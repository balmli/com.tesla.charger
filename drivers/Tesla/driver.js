'use strict';

const Homey = require('homey');
const { Driver } = Homey;
const Tesla = require('../../lib/tesla'),
    Logger = require('../../lib/Logger');

module.exports = class TeslaChargerDriver extends Driver {

    constructor(...args) {
        super(...args);

        this.logger = new Logger({
            logFunc: this.log,
            errorFunc: this.error,
        }, Homey.env);
    }

    onInit() {
        this.logger.silly('TeslaChargerDriver driver has been initialized');
    }

    onPair(socket) {
        const self = this;
        let teslaSession = new Tesla({
            logger: self.logger
        });
        let account;

        socket.on('login', (data, callback) => {
            if (data.username === '' || data.password === '') {
                return callback(null, false);
            }

            account = data;

            teslaSession.login(account.username, account.password).then(response => {
                self.logger.debug('onPair login', response);
                callback(null, true);
                if (!response.mfa) {
                    self.logger.info('Login success');
                    socket.showView('list_devices');
                }
            }).catch(error => {
                self.logger.error('paring error', error);
                callback(null, false);
            });
        });

        socket.on('pincode', async (pincode, callback) => {
            teslaSession.login(account.username, account.password, pincode).then(response => {
                self.logger.debug('onPair pincode', response);
                self.logger.info('Login success');
                callback(null, true);
            }).catch(error => {
                self.logger.error('socket MFA code error:', err);
                callback(null, false);
            });
        });

        socket.on('list_devices', (data, callback) => {
            var devices = [];
            teslaSession.getVehicles().then(vehicles => {
                if (!vehicles) {
                    return callback('errorNoVehiclesFound');
                }
                vehicles.forEach(vehicle => {
                    self.logger.info('found a car:', vehicle);
                    devices.push({
                        data: { id: vehicle.vin },
                        name: vehicle.display_name,
                        icon: 'icon_' + vehicle.vin[3].toLowerCase() + '.svg',
                        store: {
                            vehicleId: vehicle.id_s,
                            tokens: teslaSession.getTokens()
                        }
                    })
                });
                teslaSession.logout();
                return callback(null, devices);
            })
        });

        socket.on('add_device', (device, callback) => {
            //this.logger.info('pairing: vehicle added', device);
        })
    }

    onRepair(socket, device) {
        const self = this;
        let teslaSession = new Tesla({
            logger: self.logger
        });
        let account;

        socket.on('login', (data, callback) => {
            if (data.username === '' || data.password === '') {
                return callback(null, false);
            }

            account = data;

            teslaSession.login(account.username, account.password).then(response => {
                self.logger.debug('onRepair login', response);
                callback(null, true);
                if (!response.mfa) {
                    socket.done();
                }
            }).catch(error => {
                self.logger.error('paring error', error);
                callback(null, false);
            });
        });

        socket.on('pincode', async (pincode, callback) => {
            const mfaCode = pincode.join("");
            self.logger.debug('onRepair pincode', mfaCode);
            teslaSession.login(account.username, account.password, mfaCode).then(response => {
                self.logger.debug('onRepair pincode', response);
                self.logger.info('Repair success');
                device.updateTokens(response);
                callback(null, true);
            }).catch(error => {
                self.logger.error('socket MFA code error:', error);
                callback(null, false);
            });
        });

    }

};
