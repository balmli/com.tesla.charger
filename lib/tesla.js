const EventEmitter = require('events');
const http = require('http.min');
const WebSocket = require('ws');
const TeslaAuth = require('./TeslaAuth');

const OWNER_API_ENDPOINT = 'https://owner-api.teslamotors.com/';
const STREAMING_ENDPOINT = 'wss://streaming.vn.teslamotors.com/streaming/';
const STREAMING_SOCKET_TIMEOUT = 60;

module.exports = class Tesla extends EventEmitter {

    constructor(options) {
        super(options);
        if (options == null) {
            options = {}
        }

        this.tokens = options.tokens || null;
        this.logger = options.logger;
        this.i18n = options.i18n;

        this._teslaAuth = new TeslaAuth({
            logger: options.logger,
            i18n: options.i18n
        });
    }

    getTokens() {
        return this.tokens;
    }

    async login(user, password) {
        let self = this;
        return this._teslaAuth.login(user, password).then(response => {
            if (!response.mfa) {
                self.tokens = response;
            }
            return response;
        });
    }

    async mfaVerify(mfaCode) {
        let self = this;
        return this._teslaAuth.mfaVerify(mfaCode).then(response => {
            self.tokens = response;
            return response;
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

    async validateTokens() {
        if (!this.tokens) {
            throw new Error(this.i18n.__('errors.auth.no_token'));
        } else if (this.tokensExpired(this.tokens)) {
            try {
                const tokens = await this._teslaAuth.refresh(this.tokens.auth.refresh_token);
                this.tokens = tokens;
                this.emit('tokens', tokens);
            } catch (err) {
                this.logger.error('validateTokens. token refresh error', err);
            }
        }
    }

    tokensExpired(tokens) {
        return !tokens || !tokens.ownerApi || ((tokens.ownerApi.created_at + tokens.ownerApi.expires_in) * 1000) < new Date().getTime();
    }

    validateAccessToken() {
        if (!this.tokens || !this.tokens.ownerApi || !this.tokens.ownerApi.access_token) {
            throw new Error(this.i18n.__('errors.auth.no_token'));
        }
    }

    async getVehicles() {
        await this.validateTokens();
        this.validateAccessToken();
        return this._getVehicleCommand();
    }

    async getVehicleIdByVIN(VIN) {
        let vehicles = await this.getVehicles();
        const vehicle = vehicles.filter(x => x.vin === VIN)[0];
        return { vehicleId: vehicle.id_s, vehicle_id: vehicle.vehicle_id };
    }

    async getVehicle(vehicleId) {
        await this.validateTokens();
        this.validateAccessToken();
        return this._getVehicleCommand(vehicleId);
    }

    async getVehicleCommand(vehicleId, command) {
        await this.validateTokens();
        this.validateAccessToken();
        await this._wakeUpIfNecessary(vehicleId);
        return this._getVehicleCommand(vehicleId, command);
    }

    async getAlldata(vehicleId) {
        return this.getVehicleCommand(vehicleId, 'vehicle_data');
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
        await this.validateTokens();
        this.validateAccessToken();
        await this._wakeUpIfNecessary(vehicleId);
        this.logger.info(`postVehicleCommand: ${command} -> ${body}`);
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
        return this.postVehicleCommand(vehicleId, 'command/remote_start_drive', { password: password });
    }

    async triggerHomelink(vehicleId, latitude, longitude) {
        return this.postVehicleCommand(vehicleId, 'command/trigger_homelink', { lat: latitude, lon: longitude });
    }

    async speedLimitSetLimit(vehicleId, limit_mph) {
        return this.postVehicleCommand(vehicleId, 'command/speed_limit_set_limit', { limit_mph: limit_mph });
    }

    async speedLimit(vehicleId, state, pin) {
        return this.postVehicleCommand(vehicleId, `command/speed_limit_${state ? 'activate' : 'deactivate'}`, { pin: pin });
    }

    async speedLimitClearPin(vehicleId, pin) {
        return this.postVehicleCommand(vehicleId, 'command/speed_limit_clear_pin', { pin: pin });
    }

    async setValetMode(vehicleId, onOff, password) {
        return this.postVehicleCommand(vehicleId, 'command/set_valet_mode', { on: onOff, password: password });
    }

    async resetValetPin(vehicleId) {
        return this.postVehicleCommand(vehicleId, 'command/reset_valet_pin', null);
    }

    async setSentryMode(vehicleId, onOff) {
        return this.postVehicleCommand(vehicleId, 'command/set_sentry_mode', { on: onOff });
    }

    async lockUnlockDoors(vehicleId, state) {
        return this.postVehicleCommand(vehicleId, `command/door_${state ? 'lock' : 'unlock'}`, null);
    }

    async actuateTrunk(vehicleId, which_trunk) {
        if (which_trunk !== 'rear' && which_trunk !== 'front') {
            return Promise.reject('which_trunk_invalid')
        }
        return this.postVehicleCommand(vehicleId, 'command/actuate_trunk', { which_trunk: which_trunk });
    }

    async windowControl(vehicleId, command) {
        return this.postVehicleCommand(vehicleId, `command/window_control`, { command: command, lat: 0, lon: 0 });
    }

    // state: "vent", "close"
    async sunRoofControl(vehicleId, state) {
        return this.postVehicleCommand(vehicleId, `command/sun_roof_control`, { state: state });
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
        return this.postVehicleCommand(vehicleId, 'command/set_charge_limit', { percent: limit });
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
        return this.postVehicleCommand(vehicleId, `command/set_preconditioning_max`, { on: onOff });
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
        return this.postVehicleCommand(vehicleId, 'command/remote_steering_wheel_heater_request', { on: onOff });
    }

    // Address: must match this syntax "DATA_TO_SEND_TO_NAV_SYSTEM\n\nhttps://goo.gl/maps/X"
    async navigationRequest(vehicleId, address, googleMapsLink, locale = 'en-US', latitude, longitude) {
        const useCoords = latitude !== undefined && longitude !== undefined;
        const data = useCoords ? {
            type: 'share_dest_content_coords',
            value: {
                lat: latitude,
                long: longitude
            },
            locale: locale,
            timestamp_ms: Date.now()
        } : {
            type: 'share_ext_content_raw',
            value: {
                'android.intent.extra.TEXT': address + '\n\n' + googleMapsLink
            },
            locale: locale,
            timestamp_ms: Date.now()
        };
        return this.postVehicleCommand(vehicleId, 'command/share', data);
    }

    async scheduleSoftwareUpdate(vehicleId, offset) {
        return this.postVehicleCommand(vehicleId, 'command/schedule_software_update', { offset_sec: offset });
    }

    async cancelSoftwareUpdate(vehicleId) {
        return this.postVehicleCommand(vehicleId, 'command/cancel_software_update', null);
    }

    async _getVehicleCommand(vehicleId, command) {
        const self = this;
        return http.json({
            uri: `${OWNER_API_ENDPOINT}api/1/vehicles` + (vehicleId ? `/${vehicleId}` + (command ? `/${command}` : '') : ''),
            headers: this.getHeaders(this.tokens.ownerApi.access_token),
            timeout: 30000
        })
            .then(function (result) {
                if (!result.response) {
                    if (result.error && result.error.includes('operation_timedout with 10s timeout')) {
                        self.logger.error('_getVehicleCommand error', result.error);
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
            uri: `${OWNER_API_ENDPOINT}api/1/vehicles/${vehicleId}/${command}`,
            headers: this.getHeaders(this.tokens.ownerApi.access_token),
            json: body || true
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
                self.logger.debug('_postVehicleCommand', command, (new Date().getTime() - start), result.data.response);
                return result.data.response;
            })
    }

    _delay(ms) {
        return new Promise(resolve => {
            setTimeout(resolve, ms);
        });
    }

    async streamConnection(vehicle_id, tokens, callback) {
        if (this._socket) {
            this.logger.debug('Streaming use existing socket');
            this._addSocketTimeout();
        } else {
            this.logger.debug('Streaming new socket');

            this._socket = new WebSocket(STREAMING_ENDPOINT, {
                followRedirects: true,
            });

            this._socket.on('open', () => {
                this.logger.info('Streaming connection');
                this._socket.send(JSON.stringify({
                    msg_type: "data:subscribe_oauth",
                    token: this.tokens.ownerApi.access_token,
                    value: 'speed,odometer,soc,elevation,est_heading,est_lat,est_lng,power,range,est_range,heading',
                    tag: vehicle_id.toString()
                }));
            }).on('message', data => {
                let parsed = JSON.parse(data);
                if (parsed.msg_type === 'control:hello') {
                    this.logger.info('Streaming started', parsed);
                } else if (parsed.msg_type === 'data:update') {
                    this._onMessage(parsed, callback);
                } else if (parsed.msg_type === 'data:error') {
                    if (parsed.error_type === 'vehicle_disconnected' ||
                        parsed.error_type === 'timeout') {
                        this._socket.close();
                    } else {
                        this.logger.error('Streaming data error', parsed);
                        this._socket.close();
                        if (callback) {
                            callback('Error: ' + parsed.value);
                        }
                    }
                } else {
                    this.logger.info('Streaming unhandled message', parsed);
                }
            }).on('close', () => {
                this.logger.info('Streaming ended');
                this._clearSocketTimeout();
                this._socket = null;
            }).on('error', err => {
                this.logger.error('Streaming error', err);
                if (callback) {
                    callback('Streaming error');
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
            speed: this._parseValue(values[1], 0),
            odometer: this._parseValue(values[2], 0),
            soc: this._parseValue(values[3]),
            elevation: this._parseValue(values[4]),
            est_heading: this._parseValue(values[5]),
            latitude: this._parseValue(values[6]),
            longitude: this._parseValue(values[7]),
            power: this._parseValue(values[8]),
            range: this._parseValue(values[9], 0),
            est_range: this._parseValue(values[10], 0),
            heading: this._parseValue(values[11]),
        };
        this.logger.debug('Streaming data', data, response);
        if (callback) {
            callback(null, response);
        }
    }

    _parseValue(value, def) {
        return value && value.length > 0 ? parseFloat(value) : def;
    }

    _addSocketTimeout() {
        this._clearSocketTimeout();
        if (STREAMING_SOCKET_TIMEOUT) {
            this._socketTimeout = setTimeout(() => this._onSocketTimeout(), STREAMING_SOCKET_TIMEOUT * 60 * 1000);
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
