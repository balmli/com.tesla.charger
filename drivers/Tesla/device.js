'use strict';

const Homey = require('homey');
const {Device} = Homey;
const {Notification} = Homey;
const moment = require('moment'),
    Tesla = require('../../lib/tesla'),
    ChargePlan = require('../../lib/charge_plan'),
    nordpool = require('../../lib/nordpool'),
    Logger = require('../../lib/Logger');

const MILES_TO_KM = 1.609344;
const CHECK_CHARGE_RATE_INTERVAL = 86400000; // Every day
const CHARGING_STATE_DISCONNECTED = 'Disconnected';
const CHARGING_STATE_CHARGING = 'Charging';
const CHARGING_STATE_COMPLETE = 'Complete';
const CHARGE_MODE_OFF = 'off';
const CHARGE_MODE_AUTOMATIC = 'automatic';
const CHARGE_MODE_MANUAL_STD = 'manual_std';
const CHARGE_MODE_CHARGE_NOW = 'charge_now';
const MAX_LOCATIONS = 10;
const MAX_ERRORS_BEFORE_UNAVAILABLE = 5;
const MAX_ERRORS_PERIOD_UNAVAILABLE = 5 * 60; // 5 minutes

module.exports = class TeslaChargerDevice extends Device {

    constructor(...args) {
        super(...args);
        this.apiErrors = 0;
        this.logger = new Logger({
            logLevel: 4,
            captureLevel: 5,
            logFunc: this.log,
            errorFunc: this.error,
        }, Homey.env);
    }

    async onInit() {
        super.onInit();
        await this.initDevice();
        this.registerFlowCards();
    }

    async initDevice() {
        await this.setStoreValue('lastGetAlldata', 0);
        let charge_mode = this.getCapabilityValue('charge_mode');
        if (!charge_mode) {
            await this.setCapabilityValue('charge_mode', CHARGE_MODE_OFF);
        }
        await this.getLocationAccuracy();
        await this.setAvailable();
        await this.createTeslaApi();
        await this.updateVehicleId();
        this.addCheckCharging();

        this.logger.silly('initDevice', this.getData().id);
    }

    async createTeslaApi() {
        const self = this;
        this._teslaApi = new Tesla({
            grant: this.getStoreValue('grant'),
            logger: this.logger
        });
        this._teslaApi.on('invalid_user_password', async () => {
            self.setUnavailable(Homey.__('device.errorAccountAccess'));
            let notification = new Homey.Notification({excerpt: Homey.__('device.errorAccountAccessNotification')});
            await notification.register();
        });
        this._teslaApi.on('grant', async grant => {
            await self.setStoreValue('grant', grant);
        });
        this._teslaApi.on('api_error', async (reason) => {
            self.handleApiError('api_error event', reason);
        });
    }

    handleApiError(source, reason) {
        this.apiErrors++;
        this.logger.error(`${source}: error ${this.apiErrors} of max ${MAX_ERRORS_BEFORE_UNAVAILABLE} before unavailable.`, reason);
        if (!this.apiErrorTimeout && this.apiErrors > MAX_ERRORS_BEFORE_UNAVAILABLE) {
            this.addTimeoutApiErrors(MAX_ERRORS_PERIOD_UNAVAILABLE);
        }
    }

    async updateVehicleId() {
        try {
            const vehicleId = await this._teslaApi.getVehicleIdByVIN(this.getData().id);
            await this.setStoreValue('vehicleId', vehicleId);
            this.logger.info(`updateVehicleId: ${vehicleId}`);
        } catch (err) {
            this.logger.error('updateVehicleId', err);
        }
    }

    onDeleted() {
        this.clearCheckCharging();
        this.clearTimeoutApiErrors();
        this.logger.info('device deleted');
    }

    async onSettings(oldSettingsObj, newSettingsObj, changedKeysArr, callback) {
        if (changedKeysArr.includes('charge_start') ||
            changedKeysArr.includes('charge_end') ||
            changedKeysArr.includes('charge_max_hours')) {
            this.clearExistingChargePlan();
        }
        if (changedKeysArr.includes('priceArea') ||
            changedKeysArr.includes('currency')) {
            this._lastPriceFetch = undefined;
            this.clearExistingChargePlan();
        }
        if (changedKeysArr.includes('password') && newSettingsObj.password !== '') {
            await this.refreshPassword(newSettingsObj.password);
            setTimeout(this.clearPasswordFromSettings.bind(this), 1000);
        }
        if (changedKeysArr.includes('locationAccuracy')) {
            await this.getLocationAccuracy();
        }

        callback(null, true);
    }

    async clearPasswordFromSettings() {
        await this.setSettings({
            password: ''
        });
    }

    async refreshPassword(password) {
        // Logon to get the grant
        const self = this;
        let teslaSession = new Tesla({
            user: this.getStoreValue('username'),
            password: password
        });
        teslaSession.on('grant', async grant => {
            if (self.getApi()) {
                self.getApi().updateGrant(grant);
            }
            await self.setStoreValue('grant', grant);
            self.logger.debug('the password was refreshed OK');
        });
        teslaSession.login().then(() => {
            this.logAvailable();
        }).catch(error => {
            throw new Error(Homey.__('device.invalid_password'));
        });
    }

    registerFlowCards() {
        this._chargingStartedTrigger = new Homey.FlowCardTriggerDevice('charging_started');
        this._chargingStartedTrigger.register();

        this._chargingStoppedTrigger = new Homey.FlowCardTriggerDevice('charging_stopped');
        this._chargingStoppedTrigger.register();

        this._vehicleStateChangedTrigger = new Homey.FlowCardTriggerDevice('vehicle_state_changed');
        this._vehicleStateChangedTrigger.register();

        this._chargePlanCreatedTrigger = new Homey.FlowCardTriggerDevice('charge_plan_created');
        this._chargePlanCreatedTrigger.register();

        this._vehicleLeftHomeTrigger = new Homey.FlowCardTriggerDevice('vehicle_left_home');
        this._vehicleLeftHomeTrigger.register();

        this._vehicleCameHomeTrigger = new Homey.FlowCardTriggerDevice('vehicle_came_home');
        this._vehicleCameHomeTrigger.register();

        this._vehicleLeftLocationTrigger = new Homey.FlowCardTriggerDevice('vehicle_left_location');
        this._vehicleLeftLocationTrigger.register();

        this._vehicleEnteredLocationTrigger = new Homey.FlowCardTriggerDevice('vehicle_entered_location');
        this._vehicleEnteredLocationTrigger.register();

        this._vehicleStartedMovingTrigger = new Homey.FlowCardTriggerDevice('vehicle_started_moving');
        this._vehicleStartedMovingTrigger.register();

        this._vehicleStoppedMovingTrigger = new Homey.FlowCardTriggerDevice('vehicle_stopped_moving');
        this._vehicleStoppedMovingTrigger.register();

        new Homey.FlowCardCondition('is_plugged_in')
            .register()
            .registerRunListener((args, state) => args.device.checkAllDataState((aState) => aState.charge_state.charging_state !== CHARGING_STATE_DISCONNECTED || false));

        new Homey.FlowCardCondition('is_charge_port_open')
            .register()
            .registerRunListener((args, state) => args.device.checkAllDataState((aState) => aState.charge_state.charge_port_door_open || false));

        new Homey.FlowCardCondition('is_charging')
            .register()
            .registerRunListener((args, state) => args.device.checkAllDataState((aState) => aState.charge_state.charging_state === CHARGING_STATE_CHARGING || false));

        new Homey.FlowCardCondition('is_locked')
            .register()
            .registerRunListener((args, state) => args.device.checkAllDataState((aState) => aState.vehicle_state.locked || false));

        new Homey.FlowCardCondition('is_sentry_mode_on')
            .register()
            .registerRunListener((args, state) => args.device.checkAllDataState((aState) => aState.vehicle_state.sentry_mode || false));

        new Homey.FlowCardCondition('is_aircondition_on')
            .register()
            .registerRunListener((args, state) => args.device.checkAllDataState((aState) => aState.climate_state.is_auto_conditioning_on || false));

        new Homey.FlowCardCondition('is_home')
            .register()
            .registerRunListener((args, state) => args.device.checkIsHome());

        new Homey.FlowCardCondition('is_moving')
            .register()
            .registerRunListener((args, state) => args.device.checkAllDataState((aState) => aState.drive_state.speed && aState.drive_state.speed > 0 || false));

        new Homey.FlowCardCondition('is_at_location')
            .register()
            .registerRunListener((args, state) => args.device.isAtLocation(args))
            .getArgument('loc_no')
            .registerAutocompleteListener((query, args) => this.onLocNoAutocomplete(query, args));

        new Homey.FlowCardAction('set_charge_mode')
            .register()
            .registerRunListener(this.setChargeMode.bind(this));

        new Homey.FlowCardAction('charge_time_period')
            .register()
            .registerRunListener(this.chargeTimePeriod.bind(this));

        new Homey.FlowCardAction('set_data_fetch_interval')
            .register()
            .registerRunListener(this.setDataFetchInterval.bind(this));

        new Homey.FlowCardAction('charge_port_door')
            .register()
            .registerRunListener(this.chargePortDoor.bind(this));

        new Homey.FlowCardAction('charging')
            .register()
            .registerRunListener(this.charging.bind(this));

        new Homey.FlowCardAction('set_charge_limit_mode')
            .register()
            .registerRunListener(this.setChargeLimitMode.bind(this));

        new Homey.FlowCardAction('set_charge_limit')
            .register()
            .registerRunListener(this.setChargeLimit.bind(this));

        new Homey.FlowCardAction('aircondition_control')
            .register()
            .registerRunListener(this.airconditionControl.bind(this));

        new Homey.FlowCardAction('aircondition_temperature')
            .register()
            .registerRunListener(this.airconditionTemperature.bind(this));

        new Homey.FlowCardAction('door_lock_control')
            .register()
            .registerRunListener(this.doorLockControl.bind(this));

        new Homey.FlowCardAction('actuate_trunk')
            .register()
            .registerRunListener(this.actuateTrunk.bind(this));

        new Homey.FlowCardAction('set_sentry_mode')
            .register()
            .registerRunListener(this.setSentryMode.bind(this));

        new Homey.FlowCardAction('meter_power_reset')
            .register()
            .registerRunListener(this.meterPowerReset.bind(this));

        new Homey.FlowCardAction('add_current_location')
            .register()
            .registerRunListener(this.addCurrentLocation.bind(this));

        new Homey.FlowCardAction('delete_location')
            .register()
            .registerRunListener(this.deleteLocation.bind(this))
            .getArgument('loc_no')
            .registerAutocompleteListener((query, args) => this.onLocNoAutocomplete(query, args));

        new Homey.FlowCardAction('honk_horn')
            .register()
            .registerRunListener(this.honkHorn.bind(this));

        new Homey.FlowCardAction('flash_lights')
            .register()
            .registerRunListener(this.flashLights.bind(this));

        this.registerCapabilityListener('charge_mode', async (value, opts) => {
            await this.clearExistingChargePlan();
            if (value === CHARGE_MODE_CHARGE_NOW) {
                // Needs a fresh status to start charging instantly
                let allData = await this.fetchAllDataState();
            }
            this.logger.info(`charge_mode: ${value}`);
        });

    }

    onLocNoAutocomplete(query, args) {
        let locs = [];
        for (let i = 1; i <= MAX_LOCATIONS; i++) {
            let loc = this.getLocation(i);
            if (loc && loc.latitude && loc.longitude) {
                locs.push({
                    id: '' + i,
                    name: (loc && loc.name ? ' ' + loc.name : i) + (loc && loc.latitude && loc.longitude ? ' (' + loc.latitude + ',' + loc.longitude + ')' : '')
                });
            }
        }
        return Promise.resolve(locs.filter(result => {
            return result.name.toLowerCase().indexOf(query.toLowerCase()) > -1;
        }));
    }

    async setChargeMode(args, state) {
        await this.setCapabilityValue('charge_mode', args.charge_mode);
        if (args.charge_mode === CHARGE_MODE_CHARGE_NOW) {
            // Needs a fresh status to start charging instantly
            let allData = await this.fetchAllDataState();
        }
    }

    chargeTimePeriod(args, state) {
        this.logger.info('chargeTimePeriod', args.charge_start, args.charge_end, args.charge_max_hours);
        this.setSettings({
            'charge_start': args.charge_start,
            'charge_end': args.charge_end,
            'charge_max_hours': args.charge_max_hours
        });
        this.clearExistingChargePlan();
        return true;
    }

    async setDataFetchInterval(args, state) {
        if (!args.data_fetch_interval || args.data_fetch_interval < 1 || args.data_fetch_interval > 1440) {
            this.logger.error('Invalid data fetch interval', args.data_fetch_interval);
            throw new Error(Homey.__('device.invalid_data_fetch_interval'))
        }
        this.logger.info('setDataFetchInterval', args.data_fetch_interval);
        this.setSettings({
            'checkAllDataInterval': args.data_fetch_interval
        });
        return true;
    }

    chargePortDoor(args, state) {
        return args.device.getApi().chargePortDoor(args.device.getVehicleId(), args.state === 'OPEN')
            .then(response => Promise.resolve(true))
            .catch(reason => Promise.reject(reason));
    }

    charging(args, state) {
        return args.device.getApi().controlCharging(args.device.getVehicleId(), args.chargestate === 'ON')
            .then(response => Promise.resolve(true))
            .catch(reason => Promise.reject(reason));
    }

    setChargeLimitMode(args, state) {
        return args.device.getApi().setChargeMode(args.device.getVehicleId(), args.chargemode)
            .then(response => Promise.resolve(true))
            .catch(reason => Promise.reject(reason));
    }

    setChargeLimit(args, state) {
        return args.device.getApi().setChargeLimit(args.device.getVehicleId(), args.limit)
            .then(response => Promise.resolve(true))
            .catch(reason => Promise.reject(reason));
    }

    airconditionControl(args, state) {
        return args.device.getApi().controlAutoConditioning(args.device.getVehicleId(), args.autoconditioningstate === 'ON')
            .then(response => Promise.resolve(true))
            .catch(reason => Promise.reject(reason));
    }

    async airconditionTemperature(args, state) {
        if (this.max_avail_temp && args.temp > this.max_avail_temp) {
            throw new Error(`${Homey.__('device.invalid_max_avail_temp')}: ${this.max_avail_temp} ℃`);
        }
        if (this.min_avail_temp && args.temp < this.min_avail_temp) {
            throw new Error(`${Homey.__('device.invalid_min_avail_temp')}: ${this.min_avail_temp} ℃`);
        }
        this.logger.info(`airconditionTemperature: update temperature: ${args.temp}`);
        return args.device.getApi().setAutoConditioningTemperatures(args.device.getVehicleId(), args.temp, args.temp)
            .then(response => Promise.resolve(true))
            .catch(reason => Promise.reject(reason));
    }

    doorLockControl(args, state) {
        return args.device.getApi().lockUnlockDoors(args.device.getVehicleId(), args.lock === 'LOCK')
            .then(response => Promise.resolve(true))
            .catch(reason => Promise.reject(reason));
    }

    actuateTrunk(args, state) {
        return args.device.getApi().actuateTrunk(args.device.getVehicleId(), args.which_trunk)
            .then(response => Promise.resolve(true))
            .catch(reason => Promise.reject(reason));
    }

    setSentryMode(args, state) {
        return args.device.getApi().setSentryMode(args.device.getVehicleId(), args.state === 'ON')
            .then(response => Promise.resolve(true))
            .catch(reason => Promise.reject(reason));
    }

    meterPowerReset(args, state) {
        return args.device.setCapabilityValue('meter_power', 0);
    }

    async getLocationAccuracy() {
        let settings = await this.getSettings();
        this.locationAccuracy = settings.locationAccuracy && settings.locationAccuracy >= 10 && settings.locationAccuracy <= 250 ? settings.locationAccuracy : 250;
        return this.locationAccuracy;
    }

    getVehicleId() {
        return this.getStoreValue('vehicleId');
    }

    getDistanceFromHome() {
        return this.getStoreValue('distance_from_home');
    }

    async setDistanceFromHome(distance) {
        await this.setStoreValue('distance_from_home', distance);
    }

    getSpeed() {
        return this.getStoreValue('speed');
    }

    async setSpeed(speed) {
        await this.setStoreValue('speed', speed);
    }

    getLocation(id) {
        return this.getStoreValue(`loc_${id}`);
    }

    async storeLocation(id, loc) {
        await this.setStoreValue(`loc_${id}`, loc);
    }

    async addCurrentLocation(args, state) {
        let j = undefined;
        for (let i = 1; i <= MAX_LOCATIONS; i++) {
            let loc = this.getLocation(i);
            if (!loc || !loc.latitude || !loc.longitude) {
                j = i;
                break;
            }
        }
        if (!j) {
            throw new Error(`${Homey.__('device.max_number_of_locations_reached')} (${MAX_LOCATIONS})`);
        }
        this.logger.info('addCurrentLocation', j);
        let allData = await this.fetchAllDataState();
        this.logger.info('addCurrentLocation, location', j, allData.drive_state.latitude, allData.drive_state.longitude);
        await this.storeLocation(j, {
            name: args.name,
            latitude: allData.drive_state.latitude,
            longitude: allData.drive_state.longitude
        });
    }

    async deleteLocation(args, state) {
        this.logger.info('deleteLocation', args.loc_no.id);
        await this.storeLocation(args.loc_no.id, null);
    }

    honkHorn(args, state) {
        return args.device.getApi().honkHorn(args.device.getVehicleId())
            .then(response => Promise.resolve(true))
            .catch(reason => Promise.reject(reason));
    }

    flashLights(args, state) {
        return args.device.getApi().flashLights(args.device.getVehicleId())
            .then(response => Promise.resolve(true))
            .catch(reason => Promise.reject(reason));
    }

    getApi() {
        return this._teslaApi;
    }

    async fetchAllDataState() {
        try {
            let allData = await this.getApi().getAlldata(this.getVehicleId());
            await this.handleStateData(allData);
            await this.handleVehicleData(allData);
            return allData;
        } catch (err) {
            this.logger.error('fetchAllDataState', err);
            return Promise.reject(err);
        }
    }

    async checkAllDataState(predicate) {
        try {
            let allData = await this.fetchAllDataState();
            return Promise.resolve(predicate(allData));
        } catch (err) {
            this.logger.error('checkAllDataState', err);
            return Promise.reject(err);
        }
    }

    async checkIsHome() {
        let allData = await this.fetchAllDataState();
        let distance_from_home = calculateDistanceInMeters(allData.drive_state.latitude, allData.drive_state.longitude,
            Homey.ManagerGeolocation.getLatitude(),
            Homey.ManagerGeolocation.getLongitude());
        return distance_from_home && distance_from_home <= this.locationAccuracy;
    }

    async isAtLocation(args) {
        this.logger.debug('isAtLocation', args.loc_no.id);
        let allData = await this.fetchAllDataState();
        let loc = this.getLocation(args.loc_no.id);
        if (loc && loc.latitude && loc.longitude) {
            let distance = calculateDistanceInMeters(allData.drive_state.latitude, allData.drive_state.longitude,
                loc.latitude, loc.longitude);
            this.logger.info('isAtLocation', args.loc_no.id, loc, distance);
            return distance && distance <= this.locationAccuracy;
        }
        return false;
    }

    async addTimeoutApiErrors(seconds = 300) {
        await this.setUnavailable(`Counted ${this.apiErrors} errors on API calls to vehicle. Timeout for ${seconds} seconds.`);
        this.clearTimeoutApiErrors();
        this.apiErrorTimeout = setTimeout(this.apiErrorHandler.bind(this), seconds * 1000);
    }

    clearTimeoutApiErrors() {
        if (this.apiErrorTimeout) {
            clearTimeout(this.apiErrorTimeout);
            this.apiErrorTimeout = undefined;
        }
    }

    async apiErrorHandler() {
        await this.logAvailable();
    }

    async addCheckCharging(minutes = 1) {
        this.clearCheckCharging();
        await this.checkCharging();
        this.checkChargingInterval = setInterval(this.checkCharging.bind(this), minutes * 60 * 1000);
    }

    clearCheckCharging() {
        if (this.checkChargingInterval) {
            clearInterval(this.checkChargingInterval);
            this.checkChargingInterval = undefined;
        }
    }

    async checkCharging() {
        if (!this.getAvailable()) {
            return;
        }
        await this.trackState();
        if (this.canHandleCharging()) {
            let charge_mode = this.getCapabilityValue('charge_mode');
            if (charge_mode === CHARGE_MODE_AUTOMATIC) {
                if (!this._prices || !this._lastPriceFetch || this._lastPriceFetch.format('YYYY-MM-DD\THH') !== moment().format('YYYY-MM-DD\THH')) {
                    await this.fetchPrices();
                }
                await this.handleAutomaticCharging();
            } else if (charge_mode === CHARGE_MODE_MANUAL_STD) {
                await this.handleManualCharging();
            } else if (charge_mode === CHARGE_MODE_CHARGE_NOW) {
                await this.handleChargeNow();
            }
        }
    }

    async trackState() {
        const vehicleId = this.getVehicleId();
        try {
            const now = new Date().getTime();
            let settings = await this.getSettings();
            let lastGetAlldata = this.getStoreValue('lastGetAlldata');

            let vehicleData = await this.getApi().getVehicle(vehicleId);
            await this.handleStateData(vehicleData);
            this.logger.info('trackState: getVehicle', vehicleData.state);

            if (!lastGetAlldata ||
                (now - lastGetAlldata > settings.checkAllDataInterval * 60000) ||
                this.getCapabilityValue('charging_state') !== CHARGING_STATE_DISCONNECTED ||
                this._charge_plan && this._charge_plan.isInChargePeriod(moment(this._charge_plan.getStartingAt()).subtract(30, 'minutes'), moment(this._charge_plan.getEndingAt()).add(30, 'minutes'))) {
                let allData = await this.getApi().getAlldata(vehicleId);
                await this.handleVehicleData(allData);
                await this.setStoreValue('lastGetAlldata', now);
                this.logger.info('trackState: getAlldata', vehicleData.state);
            }
        } catch (err) {
            this.handleApiError('trackState API error', err);
        }
    }

    async handleStateData(data) {
        let prev_vehicle_state = this.getCapabilityValue('vehicle_state');
        let new_vehicle_state = data.state;
        await this.setCapabilityValue('vehicle_state', new_vehicle_state).catch(err => this.logger.error('error', err));
        if (prev_vehicle_state && new_vehicle_state !== prev_vehicle_state) {
            this._vehicleStateChangedTrigger.trigger(this, {
                vehicle_state: new_vehicle_state
            });
        }
        await this.logAvailable();
    }

    async handleVehicleData(allData) {
        await this.setCapabilityValue('measure_temperature', allData.climate_state.inside_temp).catch(err => this.logger.error('error', err));
        await this.setCapabilityValue('measure_temperature.outside', allData.climate_state.outside_temp).catch(err => this.logger.error('error', err));
        this.max_avail_temp = allData.climate_state.max_avail_temp;
        this.min_avail_temp = allData.climate_state.min_avail_temp;

        let prev_charging_state = this.getCapabilityValue('charging_state');
        await this.setCapabilityValue('prev_charging_state', prev_charging_state).catch(err => this.logger.error('error', err));
        await this.setCapabilityValue('charging_state', allData.charge_state.charging_state).catch(err => this.logger.error('error', err));
        await this.setCapabilityValue('time_to_full_charge', allData.charge_state.time_to_full_charge).catch(err => this.logger.error('error', err));
        await this.setCapabilityValue('charge_limit_soc', allData.charge_state.charge_limit_soc).catch(err => this.logger.error('error', err));

        await this.setCapabilityValue('measure_battery', allData.charge_state.battery_level).catch(err => this.logger.error('error', err));
        await this.setCapabilityValue('battery_range', Math.round(allData.charge_state.battery_range * MILES_TO_KM)).catch(err => this.logger.error('error', err));
        await this.setCapabilityValue('charge_rate', await this.charge_rate(allData.charge_state.charge_rate, allData.charge_state.charging_state, prev_charging_state)).catch(err => this.logger.error('error', err));
        await this.setCapabilityValue('measure_power', this.calcMeasurePower(allData.charge_state.charger_actual_current, allData.charge_state.charger_voltage, allData.charge_state.charger_phases)).catch(err => this.logger.error('error', err));
        await this.setCapabilityValue('meter_power', await this.calcMeterPower(allData.charge_state.charger_actual_current, allData.charge_state.charger_voltage, allData.charge_state.charger_phases)).catch(err => this.logger.error('error', err));

        await this.setCapabilityValue('locked', allData.vehicle_state.locked).catch(err => this.logger.error('error', err));
        await this.setCapabilityValue('odometer', Math.round(1000 * allData.vehicle_state.odometer * MILES_TO_KM) / 1000).catch(err => this.logger.error('error', err));

        let distance_from_home = calculateDistanceInMeters(allData.drive_state.latitude, allData.drive_state.longitude,
            Homey.ManagerGeolocation.getLatitude(),
            Homey.ManagerGeolocation.getLongitude());

        await this.notifyHome(distance_from_home, this.getDistanceFromHome());
        await this.checkGeofence(allData.drive_state.latitude, allData.drive_state.longitude);
        await this.notifyMoving(allData.drive_state.speed, this.getSpeed(), allData.drive_state.latitude, allData.drive_state.longitude);
        await this.notifyComplete(allData.charge_state.charging_state, prev_charging_state);
        await this.logAvailable();
    }

    async charge_rate(charge_rate, charging_state, prev_charging_state) {
        let chargeRateInKm = Math.round(1000 * charge_rate * MILES_TO_KM) / 1000;

        const now = new Date().getTime();
        let lastCheck = this.getStoreValue('lastSetChargeRate');

        // Update settings with
        if (chargeRateInKm > 0 &&
            (!lastCheck || now - lastCheck > CHECK_CHARGE_RATE_INTERVAL) &&
            charging_state === CHARGING_STATE_CHARGING &&
            prev_charging_state === CHARGING_STATE_CHARGING) {
            await this.setSettings({
                'charge_km_per_hour': chargeRateInKm
            });
            await this.setStoreValue('lastSetChargeRate', now);
        }

        return chargeRateInKm;
    }

    calcMeasurePower(current, voltage, phases) {
        return Math.round(current * voltage * phases);
    }

    async calcMeterPower(current, voltage, phases) {
        let lastCheck = this.getStoreValue('lastCalcMeterPower');
        const now = new Date().getTime();
        await this.setStoreValue('lastCalcMeterPower', now);

        let meterPower = this.getCapabilityValue('meter_power') || 0;
        if (current === undefined || voltage === undefined || phases === undefined) {
            return meterPower;
        }

        // kW
        let power = this.calcMeasurePower(current, voltage, phases) / 1000;

        if (lastCheck !== undefined) {
            let diff_ms = now - lastCheck;
            meterPower += Math.round(100 * power * diff_ms / 3600000) / 100;
        }
        this.logger.debug(`calcMeterPower: power: ${power} kW, calculated meter: ${meterPower} kWh`);
        return meterPower;
    }

    async notifyHome(distance_from_home, prev_distance_from_home) {
        if (!distance_from_home || distance_from_home < 0) {
            distance_from_home = 0;
        }
        await this.setDistanceFromHome(distance_from_home).catch(err => this.logger.error('error', err));
        if (prev_distance_from_home > this.locationAccuracy &&
            distance_from_home <= this.locationAccuracy) {
            this._vehicleCameHomeTrigger.trigger(this, {
                distance_from_home: distance_from_home
            });
        }
        if (prev_distance_from_home <= this.locationAccuracy &&
            distance_from_home > this.locationAccuracy) {
            this._vehicleLeftHomeTrigger.trigger(this, {
                distance_from_home: distance_from_home
            });
        }
    }

    async checkGeofence(latitude, longitude) {
        this.logger.debug(`checkGeofence: lat: ${latitude}, long: ${longitude}`);

        for (let i = 1; i <= MAX_LOCATIONS; i++) {
            let loc = this.getLocation(i);
            if (loc && loc.latitude && loc.longitude) {
                let distance = calculateDistanceInMeters(latitude, longitude, loc.latitude, loc.longitude);
                this.logger.info(`checkGeofence: ${i}`, loc, `distance: ${distance}`);
                if (loc.prev_distance) {
                    if (loc.prev_distance > this.locationAccuracy &&
                        distance <= this.locationAccuracy) {
                        this.logger.info(`checkGeofence: entered location: ${i}`, loc, distance);
                        this._vehicleEnteredLocationTrigger.trigger(this, {
                            name: loc.name ? loc.name : '' + i,
                            latitude: latitude,
                            longitude: longitude
                        });
                    }
                    if (loc.prev_distance <= this.locationAccuracy &&
                        distance > this.locationAccuracy) {
                        this.logger.info(`checkGeofence: left location: ${i}`, loc, distance);
                        this._vehicleLeftLocationTrigger.trigger(this, {
                            name: loc.name ? loc.name : '' + i,
                            latitude: latitude,
                            longitude: longitude
                        });
                    }
                }
                loc.prev_distance = distance;
                await this.storeLocation(i, loc);
            }
        }
    }

    async notifyMoving(speed, prev_speed, latitude, longitude) {
        if (!speed || speed < 0) {
            speed = 0;
        }
        await this.setSpeed(speed).catch(err => this.logger.error('error', err));
        if (speed > 0 && prev_speed === 0) {
            this.logger.info('notifyMoving: started moving', speed, latitude, longitude);
            this._vehicleStartedMovingTrigger.trigger(this, {
                latitude: latitude,
                longitude: longitude
            });
        }
        if (speed === 0 && prev_speed > 0) {
            this.logger.info('notifyMoving: stopped moving', latitude, longitude);
            this._vehicleStoppedMovingTrigger.trigger(this, {
                latitude: latitude,
                longitude: longitude
            });
        }
    }

    async notifyComplete(charging_state, prev_charging_state) {
        let battery = this.getCapabilityValue('measure_battery');

        if (prev_charging_state !== CHARGING_STATE_CHARGING && charging_state === CHARGING_STATE_CHARGING) {
            this.logger.info('notifyComplete: charging started trigger');
            this._chargingStartedTrigger.trigger(this, {
                battery: battery
            });

        } else if (prev_charging_state === CHARGING_STATE_CHARGING && charging_state !== CHARGING_STATE_CHARGING) {
            this.logger.info('notifyComplete: charging stopped trigger');
            let meter_power_now = this.getCapabilityValue('meter_power');
            let meter_power_start = this._charge_plan.getMeterPowerStart();
            let meter_power = meter_power_now && meter_power_start && (meter_power_now - meter_power_start > 0) ? Math.round(100 * (meter_power_now - meter_power_start)) / 100 : 0;

            let complete = charging_state === CHARGING_STATE_COMPLETE ||
                (this._charge_plan ? this._charge_plan.isLastChargePeriod(undefined, true) : false);

            this._chargingStoppedTrigger.trigger(this, {
                battery: battery,
                meter_power: meter_power,
                complete: complete
            });

            let notification = new Homey.Notification({
                excerpt: complete ? `${Homey.__('device.charging_complete')}. ${battery} %` :
                    `${Homey.__('device.charging_not_complete')}. ${battery} %`
            });
            await notification.register();
        }
    }

    async fetchPrices() {
        let settings = this.getSettings();
        let priceArea = settings.priceArea || 'Oslo';
        let currency = settings.currency || 'NOK';
        this.logger.debug('fetchData', this.getData().id, priceArea, currency);
        Promise.all([
            nordpool.getHourlyPrices(moment().add(-1, 'days'), {priceArea: priceArea, currency: currency}),
            nordpool.getHourlyPrices(moment(), {priceArea: priceArea, currency: currency}),
            nordpool.getHourlyPrices(moment().add(1, 'days'), {priceArea: priceArea, currency: currency})
        ]).then(result => {
            let prices = [];
            if (result.length > 0) {
                prices = result[0];
            }
            if (result.length > 1) {
                Array.prototype.push.apply(prices, result[1]);
            }
            if (result.length > 2) {
                Array.prototype.push.apply(prices, result[2]);
            }
            this._lastPriceFetch = moment();
            this._prices = prices;
            this.logger.info('fetchPrices: got data', this.getData().id, priceArea, currency, prices.length);
            return Promise.resolve(prices);
        }).catch(err => {
            this.logger.error('fetchPrices', err);
        });
    }

    async clearExistingChargePlan() {
        if (this._charge_plan) {
            this._charge_plan = undefined;
            await this.setCapabilityValue('planned_charge', 0);
            this.logger.info('clearExistingChargePlan: cleared existing charge plan');
        }
    }

    async createChargePlanIfMissing() {
        // Has a plan already ?
        if (this._charge_plan) {
            this.logger.debug('createChargePlanIfMissing: plan already created');
            return;
        }

        // Prices ?
        if (!this._prices) {
            this.logger.info('createChargePlanIfMissing: missing prices');
            return;
        }

        let batteryLevel = this.getCapabilityValue('measure_battery');
        let batteryRange = this.getCapabilityValue('battery_range');
        let chargeLimitSoc = this.getCapabilityValue('charge_limit_soc');

        if (!batteryLevel || !batteryRange) {
            this.logger.info('createChargePlanIfMissing: no batteryLevel or -range');
            return;
        }

        let settings = await this.getSettings();
        let chargePlan = new ChargePlan({
            charge_start: settings.charge_start,
            charge_end: settings.charge_end,
            charge_km_per_hour: settings.charge_km_per_hour,
            battery_level: batteryLevel,
            battery_range: batteryRange,
            charge_limit_soc: chargeLimitSoc,
            charge_max_hours: settings.charge_max_hours
        }, this._prices);

        if (!chargePlan.hasPricesForTodayAndTomorrow()) {
            this.logger.debug('createChargePlanIfMissing: missing prices for tomorrow');
            return;
        }

        this._charge_plan = chargePlan;
        this._charge_plan.createChargePlan();
        await this.setCapabilityValue('planned_charge', Math.round(this._charge_plan.calculateMaxToBeCharged()));
        this._chargePlanCreatedTrigger.trigger(this, {
            charge_plan: this._charge_plan.asText(Homey.__('device.charge_plan'), Homey.__('device.charge_hours'), Homey.__('device.cost_reduction'), settings.currency)
        });
        this.logger.info('createChargePlanIfMissing', this._charge_plan.getChargePlan(), this._charge_plan.asText(Homey.__('device.charge_plan'), Homey.__('device.charge_hours'), Homey.__('device.cost_reduction'), settings.currency));
    }

    canHandleCharging() {
        let charging_state = this.getCapabilityValue('charging_state');
        let distance_from_home = this.getDistanceFromHome();

        // Disconnected, complete or not home ?
        if (!charging_state ||
            charging_state === CHARGING_STATE_DISCONNECTED ||
            charging_state === CHARGING_STATE_COMPLETE ||
            !distance_from_home ||
            distance_from_home > this.locationAccuracy) {
            this.resetChargeModeAfterChargeNow();
            this.logger.debug(`canHandleCharging: charging state: ${charging_state}, distance from home: ${distance_from_home}`);
            return false;
        }

        return true;
    }

    async chargeOnOff(charging_state) {
        // Charge plan now ?
        let chargeAtMoment = this._charge_plan.getChargeAtMoment();

        // Must be between startsAt and endsAt and charge == true
        let chargeNow = chargeAtMoment &&
            chargeAtMoment.charge &&
            moment().isSameOrAfter(moment(chargeAtMoment.startsAt)) &&
            moment().isBefore(moment(chargeAtMoment.endsAt));

        this.logger.debug(`chargeOnOff: state: ${charging_state}`, chargeAtMoment, `=> chargeNow = ${chargeNow}`);

        if (chargeNow && charging_state !== CHARGING_STATE_CHARGING ||
            !chargeNow && charging_state === CHARGING_STATE_CHARGING) {
            try {
                if (chargeNow && !this._charge_plan.getMeterPowerStart()) {
                    this._charge_plan.setMeterPowerStart(this.getCapabilityValue('meter_power'));
                }
                await this.getApi().controlCharging(this.getVehicleId(), chargeNow);
                this.logger.info(`chargeOnOff: ${(chargeNow ? 'started' : 'stopped')}`);
            } catch (err) {
                this.logger.error('chargeOnOff', err);
            }
        }
    }

    async handleAutomaticCharging() {
        let charging_state = this.getCapabilityValue('charging_state');

        // Clear existing charge plan if disconnected or old plan ?
        if (this._charge_plan && (!charging_state ||
            charging_state === CHARGING_STATE_DISCONNECTED ||
            this._charge_plan.isAfterChargePlan(moment().subtract(2, 'hours')))) {
            this.logger.info('handleAutomaticCharging. Will clear existing charge plan', charging_state, moment().subtract(2, 'hours'), this._charge_plan, this._charge_plan.isAfterChargePlan(moment().subtract(2, 'hours')));
            this.clearExistingChargePlan();
        }

        await this.createChargePlanIfMissing();
        if (!this._charge_plan) {
            this.logger.debug(`handleAutomaticCharging: no charge plan`);
            return;
        }

        // Charge on / off
        await this.chargeOnOff(charging_state);
    }

    async handleManualCharging() {
        let settings = await this.getSettings();
        let chargePlan = new ChargePlan({
            charge_start: settings.charge_start,
            charge_end: settings.charge_end
        });

        // In charge period ?
        if (!chargePlan.isInChargePeriod(chargePlan.getStartingAt(), chargePlan.getEndingAt())) {
            this.logger.debug(`handleManualCharging: not in charge period`);
            return;
        }

        let charging_state = this.getCapabilityValue('charging_state');
        if (charging_state !== CHARGING_STATE_CHARGING) {
            try {
                await this.getApi().controlCharging(this.getVehicleId(), true);
                this.logger.info('handleManualCharging: started charging');
            } catch (err) {
                this.logger.error('handleManualCharging', err);
            }
        }
    }

    async handleChargeNow() {
        let charging_state = this.getCapabilityValue('charging_state');
        if (charging_state !== CHARGING_STATE_CHARGING) {
            try {
                await this.getApi().controlCharging(this.getVehicleId(), true);
                this.logger.info('handleManualCharging: started charging');
            } catch (err) {
                this.logger.error('handleManualCharging', err);
            }
        }
    }

    async resetChargeModeAfterChargeNow() {
        let charge_mode = this.getCapabilityValue('charge_mode');
        if (charge_mode === CHARGE_MODE_CHARGE_NOW) {
            await this.setCapabilityValue('charge_mode', CHARGE_MODE_OFF);
        }
    }

    async logAvailable() {
        if (!this.getAvailable()) {
            await this.setAvailable();
        }
        this.apiErrors = 0;
    }

};

// From https://www.geodatasource.com/developers/javascript
function calculateDistanceInMeters(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) {
        return 0;
    }
    var radlat1 = Math.PI * lat1 / 180;
    var radlat2 = Math.PI * lat2 / 180;
    var theta = lon1 - lon2;
    var radtheta = Math.PI * theta / 180;
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515 * 1.609344 * 1000; // result in meters
    dist = dist < 1 ? 0 : Math.round(dist);
    return dist;
}