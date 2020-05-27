const EventEmitter = require('events');
const http = require('http.min');
const WebSocket = require('ws');

const apiConsts = ['\x65\x34\x61\x39\x39\x34\x39\x66\x63\x66\x61\x30\x34\x30\x36\x38\x66\x35\x39\x61\x62\x62\x35\x61\x36\x35\x38\x66\x32\x62\x61\x63\x30\x61\x33\x34\x32\x38\x65\x34\x36\x35\x32\x33\x31\x35\x34\x39\x30\x62\x36\x35\x39\x64\x35\x61\x62\x33\x66\x33\x35\x61\x39\x65', '\x63\x37\x35\x66\x31\x34\x62\x62\x61\x64\x63\x38\x62\x65\x65\x33\x61\x37\x35\x39\x34\x34\x31\x32\x63\x33\x31\x34\x31\x36\x66\x38\x33\x30\x30\x32\x35\x36\x64\x37\x36\x36\x38\x65\x61\x37\x65\x36\x65\x37\x66\x30\x36\x37\x32\x37\x62\x66\x62\x39\x64\x32\x32\x30'];

const apiEndpoint = 'https://owner-api.teslamotors.com/';
const streamingEndpoint = 'wss://streaming.vn.teslamotors.com/streaming/';
const streamingSocketTimeout = 60;
const MILES_TO_KM = 1.609344;

module.exports = class Tesla extends EventEmitter {

    constructor(options) {
        super(options);
        if (options == null) {
            options = {}
        }
        this.user = options.user;
        this.password = options.password;
        this.grant = options.grant || null;
        this.logger = options.logger;
    }

    getGrant() {
        return this.grant;
    }

    updateGrant(grant) {
        this.grant = grant;
    }

    async login() {
        let self = this;
        return this._login(this.user, this.password)
            .then(grant => {
                self.grant = grant;
                self.emit('grant', grant);
                return grant;
            }).catch(err => {
                self.logger.error('Tesla.login error', err);
                self.emit('invalid_user_password');
                return Promise.reject('invalid_user_password');
            });
    }

    logout() {
    }

    getHeaders(token) {
        let headers = {
            'User-Agent': 'Mozilla/5.0 (Linux; Android 9.0.0; VS985 4G Build/LRX21Y; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/58.0.3029.83 Mobile Safari/537.36',
            'X-Tesla-User-Agent': 'custom/Athom/Homey'
        };
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        return headers;
    }

    async validateGrant() {
        if (!this.grant) {
            this.logger.info('validateGrant. no grant. will login');
            return this.login();
        }
        if (this.grantExpired(this.grant)) {
            try {
                let grant = await this._tokenRefresh();
                this.grant = grant;
                this.emit('grant', grant);
            } catch (err) {
                this.logger.error('validateGrant. token refresh error', err);
            }
        }
    }

    grantExpired(grant) {
        return !grant || !grant.access_token || ((grant.created_at + grant.expires_in) * 1000) < new Date().getTime();
    }

    validateAccessToken() {
        if (!this.grant.access_token) {
            throw new Error('no_token');
        }
    }

    async getVehicles() {
        await this.validateGrant();
        this.validateAccessToken();
        return this._getVehicleCommand();
    }

    async getVehicleIdByVIN(VIN) {
        let vehicles = await this.getVehicles();
        const vehicle = vehicles.filter(x => x.vin === VIN)[0];
        return { vehicleId: vehicle.id_s, vehicle_id: vehicle.vehicle_id, tokens: vehicle.tokens };
    }

    async getVehicle(vehicleId) {
        await this.validateGrant();
        this.validateAccessToken();
        return this._getVehicleCommand(vehicleId);
    }

    async getVehicleCommand(vehicleId, command) {
        await this.validateGrant();
        this.validateAccessToken();
        await this._wakeUpIfNecessary(vehicleId);
        return this._getVehicleCommand(vehicleId, command);
    }

    async getAlldata(vehicleId) {
        return this.getVehicleCommand(vehicleId, 'data');
    };

    getChargeState(vehicleId) {
        return this.getVehicleCommand(vehicleId, 'data_request/charge_state');
    }

    getClimateState(vehicleId) {
        return this.getVehicleCommand(vehicleId, 'data_request/climate_state');
    }

    getDriveState(vehicleId) {
        return this.getVehicleCommand(vehicleId, 'data_request/drive_state');
    }

    getGuiSettings(vehicleId) {
        return this.getVehicleCommand(vehicleId, 'data_request/gui_settings');
    }

    async getVehicleState(vehicleId) {
        return this.getVehicleCommand(vehicleId, 'data_request/vehicle_state');
    }

    async getVehicleConfig(vehicleId) {
        return this.getVehicleCommand(vehicleId, 'data_request/vehicle_config');
    }

    async getMobileEnabled(vehicleId) {
        return this.getVehicleCommand(vehicleId, 'mobile_enabled');
    }

    async getNearbyChargingSites(vehicleId) {
        return this.getVehicleCommand(vehicleId, 'nearby_charging_sites');
    }

    async postVehicleCommand(vehicleId, command, body) {
        await this.validateGrant();
        this.validateAccessToken();
        await this._wakeUpIfNecessary(vehicleId);
        return this._postVehicleCommand(vehicleId, command, body);
    }

    async wakeUp(vehicleId, state) {
        return this._wakeUpIfNecessary(vehicleId);
    }

    async honkHorn(vehicleId) {
        return this.postVehicleCommand(vehicleId, 'command/honk_horn', null);
    }

    async flashLights(vehicleId) {
        return this.postVehicleCommand(vehicleId, 'command/flash_lights', null);
    }

    async remoteStartDrive(vehicleId, password) {
        return this.postVehicleCommand(vehicleId, 'command/remote_start_drive', {password: password});
    }

    async triggerHomelink(vehicleId, latitude, longitude) {
        return this.postVehicleCommand(vehicleId, 'command/trigger_homelink', {lat: latitude, lon: longitude});
    }

    async speedLimitSetLimit(vehicleId, limit_mph) {
        return this.postVehicleCommand(vehicleId, 'command/speed_limit_set_limit', {limit_mph: limit_mph});
    }

    async speedLimit(vehicleId, state, pin) {
        return this.postVehicleCommand(vehicleId, `command/speed_limit_${state ? 'activate' : 'deactivate'}`, {pin: pin});
    }

    async speedLimitClearPin(vehicleId, pin) {
        return this.postVehicleCommand(vehicleId, 'command/speed_limit_clear_pin', {pin: pin});
    }

    async setValetMode(vehicleId, onOff, password) {
        return this.postVehicleCommand(vehicleId, 'command/set_valet_mode', {on: onOff, password: password});
    }

    async resetValetPin(vehicleId) {
        return this.postVehicleCommand(vehicleId, 'command/reset_valet_pin', null);
    }

    async setSentryMode(vehicleId, onOff) {
        return this.postVehicleCommand(vehicleId, 'command/set_sentry_mode', {on: onOff});
    }

    async lockUnlockDoors(vehicleId, state) {
        return this.postVehicleCommand(vehicleId, `command/door_${state ? 'lock' : 'unlock'}`, null);
    }

    async actuateTrunk(vehicleId, which_trunk) {
        if (which_trunk !== 'rear' && which_trunk !== 'front') {
            return Promise.reject('which_trunk_invalid')
        }
        return this.postVehicleCommand(vehicleId, 'command/actuate_trunk', {which_trunk: which_trunk});
    }

    async windowControl(vehicleId, command) {
        return this.postVehicleCommand(vehicleId, `command/window_control`, {command: command, lat: 0, lon: 0});
    }

    // state: "vent", "close"
    async sunRoofControl(vehicleId, state) {
        return this.postVehicleCommand(vehicleId, `command/sun_roof_control`, {state: state});
    }

    async chargePortDoor(vehicleId, state) {
        return this.postVehicleCommand(vehicleId, `command/charge_port_door_${state ? 'open' : 'close'}`, null);
    }

    async controlCharging(vehicleId, state) {
        return this.postVehicleCommand(vehicleId, `command/charge_${state ? 'start' : 'stop'}`, null);
    }

    async setChargeMode(vehicleId, chargeModeType) {
        if (chargeModeType !== 'standard' && chargeModeType !== 'max_range') {
            return Promise.reject('chargemodetype_invalid')
        }
        return this.postVehicleCommand(vehicleId, 'command/charge_' + chargeModeType, null);
    }

    async setChargeLimit(vehicleId, limit) {
        if (isNaN(limit) || limit > 100 || limit < 1 || limit.toFixed() !== limit.toString()) return Promise.reject('limit_invalid');
        return this.postVehicleCommand(vehicleId, 'command/set_charge_limit', {percent: limit});
    }

    async controlAutoConditioning(vehicleId, state) {
        return this.postVehicleCommand(vehicleId, `command/auto_conditioning_${state ? 'start' : 'stop'}`, null);
    }

    async setAutoConditioningTemperatures(vehicleId, driver_temp, passenger_temp) {
        return this.postVehicleCommand(vehicleId, 'command/set_temps', {
            driver_temp: driver_temp,
            passenger_temp: passenger_temp
        });
    }

    async setPreconditioningMax(vehicleId, onOff) {
        return this.postVehicleCommand(vehicleId, `command/set_preconditioning_max`, {on: onOff});
    }

    // heater: 0: driver, 1: passenger, 2: rear left, 4: rear center, 5: rear right
    // level: 0 - 3
    async seatHeater(vehicleId, heater, level) {
        return this.postVehicleCommand(vehicleId, 'command/remote_seat_heater_request', {
            heater: heater,
            level: level
        });
    }

    async steeringWheelHeater(vehicleId, onOff) {
        return this.postVehicleCommand(vehicleId, 'command/remote_steering_wheel_heater_request', {on: onOff});
    }

    async navigationRequest(vehicleId, subject, address, locale) {
        return this.postVehicleCommand(vehicleId, 'command/navigation_request', {
            type: "share_ext_content_raw",
            value: {
                "android.intent.ACTION": "android.intent.action.SEND",
                "android.intent.TYPE": "text\/plain",
                "android.intent.extra.SUBJECT": subject,
                "android.intent.extra.TEXT": address
            },
            locale: locale1,
            timestamp_ms: Date.now()
        });
    }

    async scheduleSoftwareUpdate(vehicleId, offset) {
        return this.postVehicleCommand(vehicleId, 'command/schedule_software_update', {offset_sec: offset});
    }

    async cancelSoftwareUpdate(vehicleId) {
        return this.postVehicleCommand(vehicleId, 'command/cancel_software_update', null);
    }

    // -----

    async _login(user, password) {
        if (!user) {
            return Promise.reject('no_username');
        }
        if (!password) {
            return Promise.reject('no_password');
        }
        return http.post({
            uri: `${apiEndpoint}oauth/token`,
            json: true,
            headers: this.getHeaders(),
            form: {
                grant_type: 'password',
                client_id: apiConsts[0],
                client_secret: apiConsts[1],
                email: user,
                password: password
            }
        })
            .then(function (result) {
                if (result.data.response) {
                    return Promise.reject(result.data.response);
                }
                if (!result.data.access_token) {
                    return Promise.reject('no_token');
                }
                return result.data
            });
    }

    async _tokenRefresh() {
        if (!this.grant.refresh_token) {
            throw new Error('no_refresh_token');
        }
        return http.post({
            uri: `${apiEndpoint}oauth/token`,
            json: true,
            headers: this.getHeaders(),
            form: {
                grant_type: 'refresh_token',
                client_id: apiConsts[0],
                client_secret: apiConsts[1],
                refresh_token: this.grant.refresh_token
            }
        })
            .then(function (result) {
                if (result.data.response) {
                    return Promise.reject(result.data.response);
                }
                if (!result.data.access_token) {
                    return Promise.reject('no_token');
                }
                return result.data;
            });
    }

    async _getVehicleCommand(vehicleId, command) {
        const self = this;
        return http.json({
            uri: `${apiEndpoint}api/1/vehicles` + (vehicleId ? `/${vehicleId}` + (command ? `/${command}` : '') : ''),
            headers: this.getHeaders(this.grant.access_token),
            timeout: 30000
        })
            .then(function (result) {
                if (!result.response) {
                    if (result.error && result.error.includes('operation_timedout with 10s timeout')) {
                        return Promise.reject('operation_timedout');
                    }
                    self.logger.error('_getVehicleCommand error', result.error);
                    return Promise.reject(result.error || 'api_error');
                }
                return result.response;
            })
    }

    async _wakeUpIfNecessary(vehicleId) {
        const start = new Date().getTime();
        let vehicle = await this._getVehicleCommand(vehicleId);
        if (vehicle.state === 'asleep' || vehicle.state === 'offline') {
            await this._postVehicleCommand(vehicleId, 'wake_up', null);
            for (let i = 0; i < 120; i++) {
                await this._delay(500);
                vehicle = await this._getVehicleCommand(vehicleId);
                if (vehicle.state !== 'asleep' && vehicle.state !== 'offline') {
                    this.logger.debug(`_wakeUpIfNecessary state: ${vehicle.state}  (${(new Date().getTime() - start)} ms)`);
                    return;
                }
            }
            this.logger.warn(`_wakeUpIfNecessary failed: ${vehicle.state}  (${(new Date().getTime() - start)} ms)`);
        }
    }

    async _postVehicleCommand(vehicleId, command, body) {
        const self = this;
        const start = new Date().getTime();
        this.logger.debug('_postVehicleCommand start', command, body);
        return http.post({
            uri: `${apiEndpoint}api/1/vehicles/${vehicleId}/${command}`,
            headers: this.getHeaders(this.grant.access_token),
            form: body || null,
            json: true
        })
            .then(function (result) {
                if (!result.response) {
                    self.logger.error('_postVehicleCommand error', result.error);
                    self.emit('api_error', result.error);
                    return Promise.reject(result.error || 'api_error');
                }
                if (result.response.statusCode !== 200) {
                    self.logger.error('_postVehicleCommand error', result.response.statusCode, result.response.statusMessage);
                    return Promise.reject(result.response);
                }
                self.logger.debug('_postVehicleCommand', command, (new Date().getTime() - start));
                return result.data.response;
            })
    }

    _delay(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    // callback(error, response)
    async streamConnection(vehicle_id, callback) {
        if (this._socket) {
            this._addSocketTimeout();
        } else {
            if (!this.user) {
                throw new Error('Unable to start streaming. Username is missing.');
            }
            if (!this.tokens) {
                throw new Error('Unable to start streaming. Token is missing.');
            }

            this._socket = new WebSocket(streamingEndpoint, {
                perMessageDeflate: false
            });

            this._socket.on('message', data => {
                let parsed = JSON.parse(data);
                if (parsed.msg_type === 'control:hello') {
                    this.logger.info('Streaming websocket connected');
                    this._socket.send(JSON.stringify({
                        msg_type: "data:subscribe",
                        token: Buffer.from(this.user + ':' + this.tokens[0]).toString('base64'),
                        value: 'speed,odometer,soc,elevation,est_heading,est_lat,est_lng,power,shift_state,range,est_range,heading',
                        tag: vehicle_id.toString()
                    }));
                } else if (parsed.msg_type === 'data:error') {
                    if (parsed.value === 'disconnected') {
                        this._socket.close();
                    } else {
                        this.logger.error('Streaming websocket data error', parsed);
                        if (callback) {
                            callback('Error: ' + parsed.value);
                        }
                    }
                } else if (parsed.msg_type === 'data:update') {
                    this._onMessage(parsed, callback);
                } else {
                    this.logger.info('Streaming websocket. Unhandled message', parsed);
                }
            }).on('close', () => {
                this.logger.info('Streaming websocket closed');
                this._clearSocketTimeout();
                this._socket = null;
            }).on('error', err => {
                this.logger.error('Streaming websocket error', err);
                if (callback) {
                    callback('Websocket error');
                }
            });
        }
    }

    hasStreamingConnection() {
        return !!this._socket;
    }

    _onMessage(data, callback) {
        this._addSocketTimeout();
        const values = data.value.split(',');
        const response = {
            time: new Date(parseInt(values[0])),
            speed: Math.round(this._parseValue(values[1], 0) * MILES_TO_KM),
            odometer: Math.round(1000 * this._parseValue(values[2], 0) * MILES_TO_KM) / 1000,
            soc: this._parseValue(values[3]),
            elevation: this._parseValue(values[4]),
            est_heading: this._parseValue(values[5]),
            est_lat: this._parseValue(values[6]),
            est_lng: this._parseValue(values[7]),
            power: this._parseValue(values[8]),
            shift_state: this._parseValue(values[9]),
            range: Math.round(this._parseValue(values[10], 0) * MILES_TO_KM),
            est_range: Math.round(this._parseValue(values[11], 0) * MILES_TO_KM),
            heading: this._parseValue(values[12]),
        };
        this.logger.debug('Streaming websocket data', data, response);
        if (callback) {
            callback(null, response);
        }
    }

    _parseValue(value, def) {
        return value && value.length > 0 ? parseFloat(value) : def;
    }

    _addSocketTimeout() {
        this._clearSocketTimeout();
        if (streamingSocketTimeout) {
            this._socketTimeout = setTimeout(() => this._onSocketTimeout(), streamingSocketTimeout * 60 * 1000);
        }
    }

    _clearSocketTimeout() {
        if (this._socketTimeout) {
            clearTimeout(this._socketTimeout);
            this._socketTimeout = undefined;
        }
    }

    _onSocketTimeout() {
        if (this._socket) {
            this.logger.debug('_onSocketTimeout');
            this._socket.close();
        }
    }

};
