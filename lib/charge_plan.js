'use strict';

const moment = require('moment');

module.exports = class ChargePlan {

    constructor(config, prices) {
        this._config = config;
        this._prices = prices;
        this._chargePlan = undefined;
    }

    static getHourPart(hour) {
        const splitted = hour.split(':');
        return parseInt(splitted[0]);
    }

    static getMinutePart(hour) {
        const splitted = hour.split(':');
        return splitted.length > 1 ? parseInt(splitted[1]) : 0;
    }

    static getHour(hour, minutes, aMoment) {
        let aMnt = aMoment || moment();
        return moment(aMnt.hours(hour).minutes(minutes).second(0).millisecond(0));
    }

    getStartingAt(aMoment) {
        return ChargePlan.getHour(ChargePlan.getHourPart(this._config.charge_start),
            ChargePlan.getMinutePart(this._config.charge_start), aMoment);
    }

    getEndingAt(aMoment) {
        let startingAt = moment(this.getStartingAt(aMoment));
        let endingAt = ChargePlan.getHour(ChargePlan.getHourPart(this._config.charge_end),
            ChargePlan.getMinutePart(this._config.charge_end), aMoment);
        if (endingAt.isBefore(moment(startingAt))) {
            endingAt.add(1, 'days');
        }
        return endingAt;
    }

    getHoursInPeriod(aStarting, aEnding) {
        return (this.getEndingAt(aEnding).valueOf() - this.getStartingAt(aStarting).valueOf()) / 3600000;
    }

    isInChargePeriod(startingAt, endingAt) {
        const now = moment();
        return now.isSameOrAfter(startingAt) && now.isBefore(endingAt);
    }

    getPricesInPeriod(prices, startingAt, endingAt) {
        return !prices ? [] : prices
            .filter(p => !startingAt || moment(p.startsAt).isSameOrAfter(startingAt))
            .filter(p => !endingAt || endingAt && moment(p.startsAt).isBefore(endingAt))
            .sort((a, b) => moment(a.startsAt).valueOf() - moment(b.startsAt).valueOf());
    }

    hasPricesForTodayAndTomorrow(aMoment) {
        if (!this._prices || this._prices.length === 0) {
            return undefined;
        }
        let now = aMoment || moment();
        let startingAt = moment(now).hour(23).minutes(0).second(0).millisecond(0);
        let endingAt = moment(startingAt).add(2, 'hours');
        return this.getPricesInPeriod(this._prices, startingAt, endingAt).length === 2;
    }

    getLowestPrices(prices, low_hours) {
        let ret = !prices ? [] : prices
            .sort((a, b) => a.price - b.price)
            .slice(0, Math.ceil(low_hours));
        if (ret.length > 0) {
            ret[ret.length - 1].highest = true;
        }
        return ret;
    }

    getLowestPricesMap(prices, low_hours) {
        return this.getLowestPrices(prices, low_hours)
            .reduce((map, obj) => {
                map[obj.startsAt] = obj;
                return map;
            }, {});
    }

    mapToChargePlan(prices) {
        return !prices ? undefined : prices
            .map(p => {
                return {
                    startsAt: moment(p.startsAt).format(),
                    endsAt: moment(p.startsAt).add(1, 'hours').format(),
                    price: p.price
                }
            });
    }

    calculateMaxBatteryRange() {
        let batteryLevel = this._config.battery_level;
        let batteryRange = this._config.battery_range;
        return batteryLevel && batteryRange && batteryLevel !== 0 ? batteryRange / batteryLevel * 100 : 500;
    }

    calculateMaxToBeCharged() {
        // Charge to X %, default 90 %
        const chargeLimit = this._config.charge_limit_soc ? this._config.charge_limit_soc / 100 : 0.9;
        const maxToBeCharged = Math.max(this.calculateMaxBatteryRange() * chargeLimit - this._config.battery_range, 0);
        return Math.min(maxToBeCharged, this.getHoursInPeriod() * this._config.charge_km_per_hour);
    }

    calculateChargeHours(overrideHours) {
        let hours = overrideHours ? overrideHours : Math.round(100 * this.calculateMaxToBeCharged() / this._config.charge_km_per_hour) / 100;
        hours = this._config.charge_max_hours && hours > this._config.charge_max_hours ? this._config.charge_max_hours : hours;
        return hours;
    }

    calculateChargeHoursFormatted() {
        const chargeHours = this.calculateChargeHours();
        return Math.floor(chargeHours) + ':' + ('' + Math.round(60 * (chargeHours - Math.floor(chargeHours)))).padStart(2, '0');
    }

    applyLowestPricesToChargePlan(plan, lowestPricesMap, chargeHours) {
        return plan.map(p => {
            const charge = lowestPricesMap[p.startsAt] !== undefined;
            p.charge = charge;
            const chargeFraction = (charge && lowestPricesMap[p.startsAt].highest && chargeHours > Math.floor(chargeHours) ?
                Math.max(chargeHours - Math.floor(chargeHours), 0.05) : 1) * 3600000;
            p.endsAt = moment(moment(p.startsAt).valueOf() + chargeFraction).format();
            return p;
        });
    }

    createChargePlan(aMoment, overrideHours) {
        const pricesInPeriod = this.getPricesInPeriod(this._prices, this.getStartingAt(aMoment), this.getEndingAt(aMoment));
        const chargeHours = this.calculateChargeHours(overrideHours);
        this._chargePlan = this.applyLowestPricesToChargePlan(this.mapToChargePlan(pricesInPeriod), this.getLowestPricesMap(pricesInPeriod, chargeHours), chargeHours);
        return this._chargePlan;
    }

    getChargePlan() {
        return this._chargePlan;
    }

    getMeterPowerStart() {
        return this._meterPower;
    }

    setMeterPowerStart(meterPower) {
        this._meterPower = meterPower;
    }

    getChargeAtMoment(aMoment) {
        if (!this._chargePlan) {
            return undefined;
        }
        let now = aMoment || moment();
        let startingAt = moment(now).minutes(0).second(0).millisecond(0);
        let endingAt = moment(startingAt).add(1, 'hours');
        let prices = this.getPricesInPeriod(this._chargePlan, startingAt, endingAt);
        return prices.length > 0 ? prices[0] : undefined;
    }

    isBeforeChargePlan(aMoment) {
        let now = aMoment || moment();
        return !this._chargePlan || this._chargePlan.length === 0 ? undefined : now.isBefore(moment(this._chargePlan[0].startsAt));
    }

    isAfterChargePlan(aMoment) {
        let now = aMoment || moment();
        return !this._chargePlan || this._chargePlan.length === 0 ? undefined : now.isSameOrAfter(moment(this._chargePlan[this._chargePlan.length - 1].endsAt));
    }

    isFirstChargePeriod(aMoment) {
        let now = aMoment || moment();
        return !this._chargePlan || this._chargePlan.length === 0 ? undefined : now.isSameOrAfter(moment(this._chargePlan[0].startsAt)) && now.isBefore(moment(this._chargePlan[0].endsAt));
    }

    isLastChargePeriod(aMoment, charging) {
        let now = aMoment || moment();
        let cplan = this._chargePlan && charging === true ? this._chargePlan.filter(p => p.charge === true) : this._chargePlan;
        return !cplan || cplan.length === 0 ? undefined : now.isSameOrAfter(moment(cplan[cplan.length - 1].startsAt)) && now.isBefore(moment(cplan[cplan.length - 1].startsAt).add(1, 'hours'));
    }

    calculateSumChargeHours() {
        return this._chargePlan ?
            this._chargePlan
                .filter(r => r.charge === true)
                .map(r => moment.duration(moment(r.endsAt).diff(moment(r.startsAt))))
                .reduce((prev, cur) => moment.duration(cur).add(prev)) :
            undefined;
    }

    calculateCostReduction() {
        if (!this._chargePlan) {
            return undefined;
        }

        let chargeMs = this.calculateSumChargeHours().asMilliseconds();

        let costCharge = this._chargePlan
            .filter(r => r.charge === true)
            .map(r => moment.duration(moment(r.endsAt).diff(moment(r.startsAt))).asMilliseconds() * r.price)
            .reduce((a, b) => (a + b));

        if (costCharge === 0) {
            return undefined;
        }

        let startCostCharge = this._chargePlan
            .map(r => {
                let cost = Math.max(Math.min(chargeMs, 3600000), 0) * r.price;
                if (chargeMs > 0) {
                    chargeMs = chargeMs - 3600000;
                }
                return cost;
            })
            .reduce((a, b) => (a + b));

        return Math.round(100000000 * (costCharge - startCostCharge) / costCharge) / 100000000;
    }

    asText(charge_plan_text, charge_hours_text, cost_reduction_text, currency = 'NOK') {
        let costReduction = this.calculateCostReduction();
        return this._chargePlan ?
            `${charge_plan_text}: ${Math.round(this.calculateMaxToBeCharged())} km\n` +
            `${charge_hours_text}: ${moment.utc(this.calculateSumChargeHours().as('milliseconds')).format('HH:mm')}\n` +
            (costReduction && costReduction < 0 ? `${cost_reduction_text}: ${Math.round(-10000 * costReduction) / 100} %\n` : '') +
            this._chargePlan
                .filter(r => r.charge === true)
                .map(r => moment(r.startsAt).format('HH:mm') + '-' + moment(r.endsAt).format('HH:mm') + ': ' + r.price + ' ' + currency + '/kWh')
                .join('\n') :
            '';
    }

};
