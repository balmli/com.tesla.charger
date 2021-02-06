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
        let pairClicked = false;
        let teslaSession = new Tesla({
            logger: self.logger,
            i18n: Homey
        });

        socket.on('login', (data, callback) => {
            teslaSession.login(data.username, data.password).then(response => {
                self.logger.debug('onPair login', response);
                callback(null, true);
                if (!response.mfa) {
                    self.logger.info('Login success');
                    socket.showView('list_devices');
                }
            }).catch(error => {
                self.logger.error('Pairing login error:', error);
                callback(error);
            });
        });

        socket.on('pincode', async (pincode, callback) => {
            if (!pairClicked) {
                pairClicked = true;
                const mfaCode = pincode.join("");
                self.logger.debug('onPair pincode', mfaCode);
                teslaSession.mfaVerify(mfaCode).then(response => {
                    self.logger.debug('onPair pincode', response);
                    self.logger.info('Login success');
                    callback(null, true);
                }).catch(error => {
                    self.logger.error('Pairing pincode error:', error);
                    pairClicked = false;
                    callback(error);
                });
            } else {
                self.logger.debug('onPair pincode double click');
            }
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
        let pairClicked = false;
        let teslaSession = new Tesla({
            logger: self.logger,
            i18n: Homey
        });

        socket.on('login', (data, callback) => {
            teslaSession.login(data.username, data.password).then(response => {
                self.logger.debug('onRepair login', response);
                callback(null, true);
                if (!response.mfa) {
                    self.logger.info('Repair success');
                    socket.done();
                }
            }).catch(error => {
                self.logger.error('Reparing login error:', error);
                callback(error);
            });
        });

        socket.on('pincode', async (pincode, callback) => {
            if (!pairClicked) {
                pairClicked = true;
                const mfaCode = pincode.join("");
                self.logger.debug('onRepair pincode', mfaCode);
                teslaSession.mfaVerify(mfaCode).then(response => {
                    self.logger.debug('onRepair pincode', response);
                    self.logger.info('Repair success');
                    callback(null, true);
                }).catch(error => {
                    self.logger.error('Repairing pincode error:', error);
                    pairClicked = false;
                    callback(error);
                });
            } else {
                self.logger.debug('onRepair pincode double click');
            }
        });

    }

};
