const axios = require('axios');
const crypto = require('crypto');
const qs = require('querystring');
const URLSafeBase64 = require('urlsafe-base64');
const cryptoRandomString = require('crypto-random-string');
const { Cookie, CookieJar } = require('tough-cookie');

const AUTH_ENDPOINT = 'https://auth.tesla.com/';
const OAUTH2_V3_ENDPOINT = `${AUTH_ENDPOINT}oauth2/v3/`;
const OWNER_API_ENDPOINT = 'https://owner-api.teslamotors.com/';

const TESLA_CLIENT_ID = '81527cff06843c8634fdc09e8ac0abefb46ac849f38fe1e431c2ef2106796384';

module.exports = class TeslaAuth {

    constructor(options) {
        if (options == null) {
            options = {}
        }
        this.logger = options.logger;

        this.jar = new CookieJar()

        this.http = axios.create({
            maxRedirects: 0,
            validateStatus: (status) => {
                return (status >= 200 && status < 300) || status === 302
            }
        });

        this.http.interceptors.request.use(config => {
            this.jar.getCookies(config.url, {}, (err, cookies) => {
                if (err) return
                config.headers.cookie = cookies.join('; ')
            })
            return config
        });

        this.http.interceptors.response.use(response => {
            if (response.headers['set-cookie'] instanceof Array) {
                response.headers['set-cookie'].forEach(c => {
                    this.jar.setCookie(Cookie.parse(c), response.config.url, () => {
                    })
                })
            }
            return response
        });
    }

    async login(username, password, mfaCode) {
        if (!username) {
            throw new Error('No username');
        }
        if (!password) {
            throw new Error('No password');
        }

        if (!this.parameters) {
            this.codeVerifier = URLSafeBase64.encode(Buffer.from(cryptoRandomString({
                length: 86,
                type: 'base64'
            }), 'utf-8')).trim();

            const hash = crypto.createHash('sha256').update(this.codeVerifier).digest('hex');
            const codeChallenge = URLSafeBase64.encode(Buffer.from(hash, 'utf8')).trim();
            const state = URLSafeBase64.encode(crypto.randomBytes(16));

            this.parameters = {
                client_id: 'ownerapi',
                code_challenge: codeChallenge,
                code_challenge_method: 'S265',
                redirect_uri: encodeURIComponent('https://auth.tesla.com/void/callback'),
                response_type: 'code',
                scope: encodeURIComponent('openid email offline_access'),
                state: state
            };

            this.logger.debug('Created parameters:', this.parameters);
        }

        const oAuthUrl = `${OAUTH2_V3_ENDPOINT}authorize?client_id=${this.parameters.client_id}&code_challenge=${this.parameters.code_challenge}&code_challenge_method=${this.parameters.code_challenge_method}&redirect_uri=${this.parameters.redirect_uri}&response_type=${this.parameters.response_type}&scope=${this.parameters.scope}&state=${this.parameters.state}`;

        let loginPageRes;
        try {
            loginPageRes = await this.http.get(oAuthUrl)
        } catch (err) {
            this.logger.error('Fetching oauth form failed:', err);
            throw new Error('Fetching oauth form failed');
        }

        let authCodeBody;
        let transactionId;
        try {
            transactionId = this.match(loginPageRes.data, /name="transaction_id".+value="([^"]+)"/);
            authCodeBody = {
                _csrf: this.match(loginPageRes.data, /name="_csrf".+value="([^"]+)"/),
                _phase: this.match(loginPageRes.data, /name="_phase".+value="([^"]+)"/),
                _process: this.match(loginPageRes.data, /name="_process".+value="([^"]+)"/),
                transaction_id: transactionId,
                cancel: this.match(loginPageRes.data, /name="cancel".+value="([^"]+)"/),
                identity: username,
                credential: password
            };
            this.logger.debug('Login. Got login page parameters:', authCodeBody);
        } catch (err) {
            this.logger.error('Scraping oauth form failed:', err);
            throw new Error('Scraping oauth form failed');
        }

        let authCodeRes;
        try {
            authCodeRes = await this.http.post(oAuthUrl, qs.stringify(authCodeBody), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            this.logger.debug('authCodeRes result:', authCodeRes.status, authCodeRes.headers.location, authCodeRes.data.includes('/mfa/verify'), authCodeRes.data);
        } catch (err) {
            this.logger.error('Invalid credentials:', err);
            throw new Error('Invalid credentials');
        }

        // MFA?
        if (authCodeRes.status === 200 &&
            authCodeRes.data &&
            authCodeRes.data.includes('/mfa/verify')) {

            if (!mfaCode) {
                return {
                    mfa: true
                };
            }

            let mfaFactorsRes;
            try {
                mfaFactorsRes = await this.http.get(`${OAUTH2_V3_ENDPOINT}authorize/mfa/factors?transaction_id=${transactionId}`)
            } catch (err) {
                this.logger.error('Fetching MFA factors failed:', err);
                throw new Error('Fetching MFA factors failed');
            }

            let mfaVerifyRes;
            try {
                mfaVerifyRes = await this.http.post(`${OAUTH2_V3_ENDPOINT}authorize/mfa/verify`, {
                    transaction_id: transactionId,
                    factor_id: mfaFactorsRes.data.data[0].id,
                    passcode: mfaCode
                });
            } catch (err) {
                this.logger.error('Invalid MFA response:', err.response.data, err);
                throw new Error('Invalid MFA response');
            }
            if (!mfaVerifyRes.data.data || !mfaVerifyRes.data.data.valid) {
                throw new Error('Invalid MFA code');
            }

            try {
                authCodeRes = await this.http.post(oAuthUrl, { transaction_id: transactionId });
            } catch (err) {
                this.logger.error('Invalid MFA logon:', err);
                throw new Error('Invalid MFA logon');
            }
        }

        let code;
        try {
            const url = new URL(authCodeRes.headers.location);
            code = url.searchParams.get('code')
            this.logger.debug('Login. Got auth code:', code);
        } catch (err) {
            this.logger.error('Fetching auth code failed:', err);
            throw new Error('Fetching auth code failed');
        }

        return await this.getTokens({
            grant_type: 'authorization_code',
            client_id: 'ownerapi',
            code_verifier: this.codeVerifier,
            code: code,
            redirect_uri: 'https://auth.tesla.com/void/callback'
        });
    }

    match = (data, regex) => {
        const m = data.match(regex)
        return m ? m[1] : ''
    }

    async getTokens(payload) {
        const tokenRes = await this.http.post(`${OAUTH2_V3_ENDPOINT}token`, payload);

        const ownerApiRes = await this.http.post(`${OWNER_API_ENDPOINT}oauth/token`, {
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            client_id: TESLA_CLIENT_ID
        }, {
            headers: {
                Authorization: `Bearer ${tokenRes.data.access_token}`
            }
        })

        const tokens = {
            auth: tokenRes.data,
            ownerApi: ownerApiRes.data
        }

        this.logger.debug('Tokens:', tokens);

        return tokens;
    }

    async refresh(refreshToken) {
        return await this.getTokens({
            grant_type: 'refresh_token',
            client_id: 'ownerapi',
            refresh_token: refreshToken,
            scope: 'openid email offline_access'
        });
    }

};