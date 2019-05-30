'use strict';

const {App} = require('homey');

process.env.SENTRY_ENVIRONMENT = 'prod';

module.exports = class TeslaChargerApp extends App {

    onInit() {
        this.log('TeslaChargerApp is running...');
    }

};
