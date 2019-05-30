'use strict';

const Homey = require('homey');
const {Driver} = Homey;
const Tesla = require('../../lib/tesla'),
    Logger = require('../../lib/Logger');

module.exports = class TeslaChargerDriver extends Driver {

    constructor(...args) {
        super(...args);

        this.logger = new Logger({
            logLevel: 4,
            captureLevel: 5,
            logFunc: this.log,
            errorFunc: this.error,
        }, Homey.env);
    }

    onInit() {
        this.logger.silly('TeslaChargerDriver driver has been initialized');
    }

    onPair(socket) {
        let teslaSession;
        let account;

        socket.on('login', (data, callback) => {
            if (data.username === '' || data.password === '') {
                return callback(null, false);
            }

            account = data;
            teslaSession = new Tesla({
                user: account.username,
                password: account.password,
                logger: this.logger
            });

            teslaSession.login().then(function () {
                callback(null, true);
            }).catch(error => {
                this.logger.error('paring error', error);
                callback(null, false);
            })
        });

        socket.on('list_devices', (data, callback) => {
            var devices = [];
            teslaSession.getVehicles().then(vehicles => {
                if (!vehicles) {
                    return callback('errorNoVehiclesFound');
                }
                vehicles.forEach(vehicle => {
                    this.logger.info('found a car:', vehicle);
                    devices.push({
                        data: {id: vehicle.vin},
                        name: vehicle.display_name,
                        icon: 'icon_' + vehicle.vin[3].toLowerCase() + '.svg',
                        store: {
                            vehicleId: vehicle.id_s,
                            grant: teslaSession.getGrant(),
                            username: account.username
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

};
