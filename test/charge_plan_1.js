const chai = require('chai');
const expect = chai.expect;
chai.use(require('chai-moment'));

const moment = require('moment');
const ChargePlan = require('../lib/charge_plan');

const getPrices = function () {
    return [
        {
            startsAt: '2019-04-02T00:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.3579
        },
        {
            startsAt: '2019-04-02T01:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35732
        },
        {
            startsAt: '2019-04-02T02:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35646
        },
        {
            startsAt: '2019-04-02T03:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35646
        },
        {
            startsAt: '2019-04-02T04:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35414
        },
        {
            startsAt: '2019-04-02T05:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35385
        },
        {
            startsAt: '2019-04-02T06:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.38241
        },
        {
            startsAt: '2019-04-02T07:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.40702
        },
        {
            startsAt: '2019-04-02T08:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.40683
        },
        {
            startsAt: '2019-04-02T09:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.39081
        },
        {
            startsAt: '2019-04-02T10:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.38019
        },
        {
            startsAt: '2019-04-02T11:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.37334
        },
        {
            startsAt: '2019-04-02T12:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.37228
        },
        {
            startsAt: '2019-04-02T13:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.37286
        },
        {
            startsAt: '2019-04-02T14:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.36447
        },
        {
            startsAt: '2019-04-02T15:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.36427
        },
        {
            startsAt: '2019-04-02T16:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.36205
        },
        {
            startsAt: '2019-04-02T17:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.36456
        },
        {
            startsAt: '2019-04-02T18:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.37662
        },
        {
            startsAt: '2019-04-02T19:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.38183
        },
        {
            startsAt: '2019-04-02T20:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.38048
        },
        {
            startsAt: '2019-04-02T21:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.37933
        },
        {
            startsAt: '2019-04-02T22:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.37547
        },
        {
            startsAt: '2019-04-02T23:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.36562
        },
        {
            startsAt: '2019-04-03T00:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.3583
        },
        {
            startsAt: '2019-04-03T01:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35965
        },
        {
            startsAt: '2019-04-03T02:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35927
        },
        {
            startsAt: '2019-04-03T03:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35927
        },
        {
            startsAt: '2019-04-03T04:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35609
        },
        {
            startsAt: '2019-04-03T05:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.37055
        },
        {
            startsAt: '2019-04-03T06:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.39697
        },
        {
            startsAt: '2019-04-03T07:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.43197
        },
        {
            startsAt: '2019-04-03T08:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.46707
        },
        {
            startsAt: '2019-04-03T09:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.44807
        },
        {
            startsAt: '2019-04-03T10:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.44508
        },
        {
            startsAt: '2019-04-03T11:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.42985
        },
        {
            startsAt: '2019-04-03T12:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.40883
        },
        {
            startsAt: '2019-04-03T13:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.40237
        },
        {
            startsAt: '2019-04-03T14:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.39311
        },
        {
            startsAt: '2019-04-03T15:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.39032
        },
        {
            startsAt: '2019-04-03T16:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.39273
        },
        {
            startsAt: '2019-04-03T17:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.3961
        },
        {
            startsAt: '2019-04-03T18:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.39784
        },
        {
            startsAt: '2019-04-03T19:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.39909
        },
        {
            startsAt: '2019-04-03T20:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.39427
        },
        {
            startsAt: '2019-04-03T21:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.38926
        },
        {
            startsAt: '2019-04-03T22:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.38318
        },
        {
            startsAt: '2019-04-03T23:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.3718
        }
    ];
};

const getPrices2 = function () {
    return [
        {
            startsAt: '2019-04-02T00:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.3579
        },
        {
            startsAt: '2019-04-02T01:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35732
        },
        {
            startsAt: '2019-04-02T02:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35646
        },
        {
            startsAt: '2019-04-02T03:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35646
        },
        {
            startsAt: '2019-04-02T04:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35414
        },
        {
            startsAt: '2019-04-02T05:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35385
        },
        {
            startsAt: '2019-04-02T06:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.38241
        },
        {
            startsAt: '2019-04-02T07:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.40702
        },
        {
            startsAt: '2019-04-02T08:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.40683
        },
        {
            startsAt: '2019-04-02T09:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.39081
        },
        {
            startsAt: '2019-04-02T10:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.38019
        },
        {
            startsAt: '2019-04-02T11:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.37334
        },
        {
            startsAt: '2019-04-02T12:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.37228
        },
        {
            startsAt: '2019-04-02T13:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.37286
        },
        {
            startsAt: '2019-04-02T14:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.36447
        },
        {
            startsAt: '2019-04-02T15:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.36427
        },
        {
            startsAt: '2019-04-02T16:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.36205
        },
        {
            startsAt: '2019-04-02T17:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.36456
        },
        {
            startsAt: '2019-04-02T18:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.37662
        },
        {
            startsAt: '2019-04-02T19:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.38183
        },
        {
            startsAt: '2019-04-02T20:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.38048
        },
        {
            startsAt: '2019-04-02T21:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.37933
        },
        {
            startsAt: '2019-04-02T22:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.37547
        },
        {
            startsAt: '2019-04-02T23:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.36562
        }
    ];
};

const getPrices3 = function () {
    return [
        {
            startsAt: '2019-04-02T00:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.3579
        },
        {
            startsAt: '2019-04-02T01:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35732
        },
        {
            startsAt: '2019-04-02T02:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35646
        },
        {
            startsAt: '2019-04-02T03:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35646
        },
        {
            startsAt: '2019-04-02T04:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35414
        },
        {
            startsAt: '2019-04-02T05:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35385
        },
        {
            startsAt: '2019-04-02T06:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.38241
        },
        {
            startsAt: '2019-04-02T07:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.40702
        },
        {
            startsAt: '2019-04-02T08:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.40683
        },
        {
            startsAt: '2019-04-02T09:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.39081
        },
        {
            startsAt: '2019-04-02T10:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.38019
        },
        {
            startsAt: '2019-04-02T11:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.37334
        },
        {
            startsAt: '2019-04-02T12:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.37228
        },
        {
            startsAt: '2019-04-02T13:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.37286
        },
        {
            startsAt: '2019-04-02T14:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.36447
        },
        {
            startsAt: '2019-04-02T15:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.36427
        },
        {
            startsAt: '2019-04-02T16:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.36205
        },
        {
            startsAt: '2019-04-02T17:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.36456
        },
        {
            startsAt: '2019-04-02T18:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.37662
        },
        {
            startsAt: '2019-04-02T19:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.38183
        },
        {
            startsAt: '2019-04-02T20:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.38048
        },
        {
            startsAt: '2019-04-02T21:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.37933
        },
        {
            startsAt: '2019-04-02T22:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.37547
        },
        {
            startsAt: '2019-04-02T23:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.36562
        },
        {
            startsAt: '2019-04-03T00:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.3583
        },
        {
            startsAt: '2019-04-03T01:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35609
        },
        {
            startsAt: '2019-04-03T02:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35927
        },
        {
            startsAt: '2019-04-03T03:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35927
        },
        {
            startsAt: '2019-04-03T04:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.35965
        },
        {
            startsAt: '2019-04-03T05:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.37055
        },
        {
            startsAt: '2019-04-03T06:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.39697
        },
        {
            startsAt: '2019-04-03T07:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.43197
        },
        {
            startsAt: '2019-04-03T08:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.46707
        },
        {
            startsAt: '2019-04-03T09:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.44807
        },
        {
            startsAt: '2019-04-03T10:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.44508
        },
        {
            startsAt: '2019-04-03T11:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.42985
        },
        {
            startsAt: '2019-04-03T12:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.40883
        },
        {
            startsAt: '2019-04-03T13:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.40237
        },
        {
            startsAt: '2019-04-03T14:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.39311
        },
        {
            startsAt: '2019-04-03T15:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.39032
        },
        {
            startsAt: '2019-04-03T16:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.39273
        },
        {
            startsAt: '2019-04-03T17:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.3961
        },
        {
            startsAt: '2019-04-03T18:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.39784
        },
        {
            startsAt: '2019-04-03T19:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.39909
        },
        {
            startsAt: '2019-04-03T20:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.39427
        },
        {
            startsAt: '2019-04-03T21:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.38926
        },
        {
            startsAt: '2019-04-03T22:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.38318
        },
        {
            startsAt: '2019-04-03T23:00:00+02:00',
            priceArea: 'Bergen',
            currency: 'NOK',
            price: 0.3718
        }
    ];
};

const getConfig = function () {
    return {
        charge_start: '22:00',
        charge_end: '06:30',
        charge_km_per_hour: 28,
        battery_level: 67,
        battery_range: 332,
        charge_limit_soc: 90
    };
};

describe("Charge plan", function () {

    describe("Check testdata", function () {
        it("48 hours", function () {
            expect(getPrices().length).to.equal(48);
        });
    });

    describe("Check", function () {
        it("Check getStartingAt", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            expect(chargePlan.getStartingAt()).to.be.sameMoment(moment().hour(22).minute(0).second(0).millisecond(0));
        });
        it("Check getEndingAt", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            expect(chargePlan.getEndingAt()).to.be.sameMoment(moment().add(1, 'days').hour(6).minute(30).second(0).millisecond(0));
        });
        it("Check getHoursInPeriod", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            expect(chargePlan.getHoursInPeriod()).to.equal(8.5);
        });
    });

    describe("Check getPricesInPeriod", function () {
        it("No prices 1", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            expect(chargePlan.getPricesInPeriod(getPrices(), moment('2019-05-01'), undefined).length).to.eql(0);
        });
        it("No prices 2", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            expect(chargePlan.getPricesInPeriod(getPrices(), undefined, moment('2019-04-01')).length).to.eql(0);
        });
        it("All prices 1", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            expect(chargePlan.getPricesInPeriod(getPrices(), undefined, undefined).length).to.eql(48);
        });
        it("Some prices 1", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            expect(chargePlan.getPricesInPeriod(getPrices(), moment('2019-04-02T00:00:00+02:00'), moment('2019-04-02T01:00:00+02:00')).length).to.eql(1);
        });
        it("Some prices 2", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            expect(chargePlan.getPricesInPeriod(getPrices(), moment('2019-04-02T22:00:00+02:00'), moment('2019-04-03T07:00:00+02:00')).length).to.eql(9);
        });
    });

    it("hasPricesForTodayAndTomorrow 1", function () {
        let chargePlan = new ChargePlan(getConfig(), getPrices());
        chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
        let dd = chargePlan.hasPricesForTodayAndTomorrow(moment('2019-04-02T17:00:00+02:00'));
        expect(dd).to.eql(true);
    });
    it("hasPricesForTodayAndTomorrow 2", function () {
        let chargePlan = new ChargePlan(getConfig(), getPrices2());
        chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
        let dd = chargePlan.hasPricesForTodayAndTomorrow(moment('2019-04-02T12:00:00+02:00'));
        expect(dd).to.eql(false);
    });

    describe("Check getLowestPrices", function () {
        it("No prices 1", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            expect(chargePlan.getLowestPrices(undefined, 0).length).to.eql(0);
        });
        it("No prices 2", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            expect(chargePlan.getLowestPrices(getPrices(), 0).length).to.eql(0);
        });
        it("Lowest price 1", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let lowestPrices = chargePlan.getLowestPrices(getPrices(), 1);
            expect(lowestPrices.length).to.eql(1);
            expect(lowestPrices).to.eql([{
                startsAt: '2019-04-02T05:00:00+02:00',
                priceArea: 'Bergen',
                currency: 'NOK',
                price: 0.35385,
                highest: true
            }]);
        });
        it("Lowest price 1", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let getPricesInPeriod = chargePlan.getPricesInPeriod(getPrices(), moment('2019-04-02T22:00:00+02:00'), moment('2019-04-03T07:00:00+02:00'));
            let lowestPrices = chargePlan.getLowestPrices(getPricesInPeriod, 3);
            expect(lowestPrices.length).to.eql(3);
            expect(lowestPrices).to.eql([{
                startsAt: '2019-04-03T04:00:00+02:00',
                priceArea: 'Bergen',
                currency: 'NOK',
                price: 0.35609
            }, {
                startsAt: '2019-04-03T00:00:00+02:00',
                priceArea: 'Bergen',
                currency: 'NOK',
                price: 0.3583
            }, {
                startsAt: '2019-04-03T02:00:00+02:00',
                priceArea: 'Bergen',
                currency: 'NOK',
                price: 0.35927,
                highest: true
            }]);
        });
        it("Lowest price map 1", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let getPricesInPeriod = chargePlan.getPricesInPeriod(getPrices(), moment('2019-04-02T22:00:00+02:00'), moment('2019-04-03T07:00:00+02:00'));
            let lowestPrices = chargePlan.getLowestPricesMap(getPricesInPeriod, 3);
            expect(lowestPrices).to.eql({
                '2019-04-03T04:00:00+02:00': {
                    startsAt: '2019-04-03T04:00:00+02:00',
                    priceArea: 'Bergen',
                    currency: 'NOK',
                    price: 0.35609
                },
                '2019-04-03T00:00:00+02:00': {
                    startsAt: '2019-04-03T00:00:00+02:00',
                    priceArea: 'Bergen',
                    currency: 'NOK',
                    price: 0.3583
                },
                '2019-04-03T02:00:00+02:00': {
                    startsAt: '2019-04-03T02:00:00+02:00',
                    priceArea: 'Bergen',
                    currency: 'NOK',
                    price: 0.35927,
                    highest: true
                }
            });
        });
    });

    describe("Check mapToChargePlan", function () {

        it("mapToChargePlan 1", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            expect(chargePlan.mapToChargePlan(undefined)).to.eql(undefined);
        });
        it("mapToChargePlan 2", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            expect(chargePlan.mapToChargePlan([])).to.eql([]);
        });
        it("mapToChargePlan 3", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            expect(chargePlan.mapToChargePlan([{
                startsAt: '2019-04-03T14:00:00+02:00',
                priceArea: 'Bergen',
                currency: 'NOK',
                price: 0.39311
            }])).to.eql([{
                startsAt: '2019-04-03T14:00:00+02:00',
                endsAt: '2019-04-03T15:00:00+02:00',
                price: 0.39311
            }]);
        });

    });

    describe("Check calculateMaxBatteryRange", function () {
        it("calculateMaxBatteryRange 1", function () {
            expect(new ChargePlan(getConfig(), getPrices()).calculateMaxBatteryRange()).to.eql(495.5223880597015);
        });
    });

    describe("Check calculateMaxToBeCharged", function () {
        it("calculateMaxToBeCharged 1", function () {
            expect(new ChargePlan(getConfig(), getPrices()).calculateMaxToBeCharged()).to.eql(113.97014925373134);
        });
        it("calculateMaxToBeCharged 1", function () {
            let config = getConfig();
            config.charge_km_per_hour = 10;
            expect(new ChargePlan(config, getPrices()).calculateMaxToBeCharged()).to.eql(85.0);
        });
    });

    describe("Check calculateChargeHours", function () {
        it("calculateChargeHours 1", function () {
            expect(new ChargePlan(getConfig(), getPrices()).calculateChargeHours()).to.eql(4.07);
        });
        it("calculateChargeHours 2", function () {
            let config = getConfig();
            config.charge_max_hours = 4;
            expect(new ChargePlan(config, getPrices()).calculateChargeHours()).to.eql(4);
        });
        it("calculateChargeHours 3", function () {
            let config = getConfig();
            config.charge_max_hours = 2;
            expect(new ChargePlan(config, getPrices()).calculateChargeHours()).to.eql(2);
        });
        it("calculateChargeHours 4", function () {
            let config = getConfig();
            config.charge_max_hours = 10;
            expect(new ChargePlan(config, getPrices()).calculateChargeHours()).to.eql(4.07);
        });
    });

    describe("Check applyLowestPricesToChargePlan", function () {

        it("applyLowestPricesToChargePlan 1", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let plan = [
                {
                    startsAt: '2019-04-03T14:00:00+02:00',
                    endsAt: '2019-04-03T15:00:00+02:00',
                    price: 0.3
                },
                {
                    startsAt: '2019-04-03T15:00:00+02:00',
                    endsAt: '2019-04-03T16:00:00+02:00',
                    price: 0.5
                },
                {
                    startsAt: '2019-04-03T16:00:00+02:00',
                    endsAt: '2019-04-03T17:00:00+02:00',
                    price: 0.4
                }
            ];
            let lowestPricesMap = {
                '2019-04-03T14:00:00+02:00': {
                    startsAt: '2019-04-03T14:00:00+02:00',
                    priceArea: 'Bergen',
                    currency: 'NOK',
                    price: 0.3
                },
                '2019-04-03T16:00:00+02:00': {
                    startsAt: '2019-04-03T16:00:00+02:00',
                    priceArea: 'Bergen',
                    currency: 'NOK',
                    price: 0.4,
                    highest: true

                }
            };
            console.log('calculateChargeHours', chargePlan.calculateChargeHours());
            let chPlan = chargePlan.applyLowestPricesToChargePlan(plan, lowestPricesMap, 1.25);
            expect(chPlan).to.eql([
                {
                    startsAt: '2019-04-03T14:00:00+02:00',
                    endsAt: '2019-04-03T15:00:00+02:00',
                    price: 0.3,
                    charge: true
                },
                {
                    startsAt: '2019-04-03T15:00:00+02:00',
                    endsAt: '2019-04-03T16:00:00+02:00',
                    price: 0.5,
                    charge: false
                },
                {
                    startsAt: '2019-04-03T16:00:00+02:00',
                    endsAt: '2019-04-03T16:15:00+02:00',
                    price: 0.4,
                    charge: true
                }
            ]);
        });

    });

    describe("Check createChargePlan", function () {

        it("createChargePlan 1", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'), 4);
            expect(chPlan).to.eql([
                {
                    startsAt: '2019-04-02T22:00:00+02:00',
                    endsAt: '2019-04-02T23:00:00+02:00',
                    price: 0.37547,
                    charge: false
                },
                {
                    startsAt: '2019-04-02T23:00:00+02:00',
                    endsAt: '2019-04-03T00:00:00+02:00',
                    price: 0.36562,
                    charge: false
                },
                {
                    startsAt: '2019-04-03T00:00:00+02:00',
                    endsAt: '2019-04-03T01:00:00+02:00',
                    price: 0.3583,
                    charge: true
                },
                {
                    startsAt: '2019-04-03T01:00:00+02:00',
                    endsAt: '2019-04-03T02:00:00+02:00',
                    price: 0.35965,
                    charge: false
                },
                {
                    startsAt: '2019-04-03T02:00:00+02:00',
                    endsAt: '2019-04-03T03:00:00+02:00',
                    price: 0.35927,
                    charge: true
                },
                {
                    startsAt: '2019-04-03T03:00:00+02:00',
                    endsAt: '2019-04-03T04:00:00+02:00',
                    price: 0.35927,
                    charge: true
                },
                {
                    startsAt: '2019-04-03T04:00:00+02:00',
                    endsAt: '2019-04-03T05:00:00+02:00',
                    price: 0.35609,
                    charge: true
                },
                {
                    startsAt: '2019-04-03T05:00:00+02:00',
                    endsAt: '2019-04-03T06:00:00+02:00',
                    price: 0.37055,
                    charge: false
                },
                {
                    startsAt: '2019-04-03T06:00:00+02:00',
                    endsAt: '2019-04-03T07:00:00+02:00',
                    price: 0.39697,
                    charge: false
                }]
            );
        });

        it("createChargePlan 2", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chPlan).to.eql([
                {
                    startsAt: '2019-04-02T22:00:00+02:00',
                    endsAt: '2019-04-02T23:00:00+02:00',
                    price: 0.37547,
                    charge: false
                },
                {
                    startsAt: '2019-04-02T23:00:00+02:00',
                    endsAt: '2019-04-03T00:00:00+02:00',
                    price: 0.36562,
                    charge: false
                },
                {
                    startsAt: '2019-04-03T00:00:00+02:00',
                    endsAt: '2019-04-03T01:00:00+02:00',
                    price: 0.3583,
                    charge: true
                },
                {
                    startsAt: '2019-04-03T01:00:00+02:00',
                    endsAt: '2019-04-03T01:04:12+02:00',
                    price: 0.35965,
                    charge: true
                },
                {
                    startsAt: '2019-04-03T02:00:00+02:00',
                    endsAt: '2019-04-03T03:00:00+02:00',
                    price: 0.35927,
                    charge: true
                },
                {
                    startsAt: '2019-04-03T03:00:00+02:00',
                    endsAt: '2019-04-03T04:00:00+02:00',
                    price: 0.35927,
                    charge: true
                },
                {
                    startsAt: '2019-04-03T04:00:00+02:00',
                    endsAt: '2019-04-03T05:00:00+02:00',
                    price: 0.35609,
                    charge: true
                },
                {
                    startsAt: '2019-04-03T05:00:00+02:00',
                    endsAt: '2019-04-03T06:00:00+02:00',
                    price: 0.37055,
                    charge: false
                },
                {
                    startsAt: '2019-04-03T06:00:00+02:00',
                    endsAt: '2019-04-03T07:00:00+02:00',
                    price: 0.39697,
                    charge: false
                }]
            );
        });

        it("createChargePlan 3", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'), 4.01);
            expect(chPlan).to.eql([
                {
                    startsAt: '2019-04-02T22:00:00+02:00',
                    endsAt: '2019-04-02T23:00:00+02:00',
                    price: 0.37547,
                    charge: false
                },
                {
                    startsAt: '2019-04-02T23:00:00+02:00',
                    endsAt: '2019-04-03T00:00:00+02:00',
                    price: 0.36562,
                    charge: false
                },
                {
                    startsAt: '2019-04-03T00:00:00+02:00',
                    endsAt: '2019-04-03T01:00:00+02:00',
                    price: 0.3583,
                    charge: true
                },
                {
                    startsAt: '2019-04-03T01:00:00+02:00',
                    endsAt: '2019-04-03T01:03:00+02:00',
                    price: 0.35965,
                    charge: true
                },
                {
                    startsAt: '2019-04-03T02:00:00+02:00',
                    endsAt: '2019-04-03T03:00:00+02:00',
                    price: 0.35927,
                    charge: true
                },
                {
                    startsAt: '2019-04-03T03:00:00+02:00',
                    endsAt: '2019-04-03T04:00:00+02:00',
                    price: 0.35927,
                    charge: true
                },
                {
                    startsAt: '2019-04-03T04:00:00+02:00',
                    endsAt: '2019-04-03T05:00:00+02:00',
                    price: 0.35609,
                    charge: true
                },
                {
                    startsAt: '2019-04-03T05:00:00+02:00',
                    endsAt: '2019-04-03T06:00:00+02:00',
                    price: 0.37055,
                    charge: false
                },
                {
                    startsAt: '2019-04-03T06:00:00+02:00',
                    endsAt: '2019-04-03T07:00:00+02:00',
                    price: 0.39697,
                    charge: false
                }]
            );
        });
    });

    describe("Check getChargeAtMoment", function () {

        it("getChargeAtMoment 1", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            let dd = chargePlan.getChargeAtMoment(moment('2019-04-04T00:20:00+02:00'));
            expect(dd).to.eql(undefined);
        });
        it("getChargeAtMoment 2", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            let dd = chargePlan.getChargeAtMoment(moment('2019-04-02T17:00:00+02:00'));
            expect(dd).to.eql(undefined);
        });
        it("getChargeAtMoment 3", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            let dd = chargePlan.getChargeAtMoment(moment('2019-04-03T00:20:00+02:00'));
            expect(dd).to.eql(
                {
                    startsAt: '2019-04-03T00:00:00+02:00',
                    endsAt: '2019-04-03T01:00:00+02:00',
                    price: 0.3583,
                    charge: true
                }
            );
        });
        it("getChargeAtMoment 4", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            let dd = chargePlan.getChargeAtMoment(moment('2019-04-03T05:00:00+02:00'));
            expect(dd).to.eql(
                {
                    startsAt: '2019-04-03T05:00:00+02:00',
                    endsAt: '2019-04-03T06:00:00+02:00',
                    price: 0.37055,
                    charge: false
                }
            );
        });
        it("getChargeAtMoment 5", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            let dd = chargePlan.getChargeAtMoment(moment('2019-04-03T01:00:00+02:00'));
            expect(dd).to.eql(
                {
                    startsAt: '2019-04-03T01:00:00+02:00',
                    endsAt: '2019-04-03T01:04:12+02:00',
                    price: 0.35965,
                    charge: true
                }
            );
        });
        it("getChargeAtMoment 6", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            let dd = chargePlan.getChargeAtMoment(moment('2019-04-03T01:30:00+02:00'));
            expect(dd).to.eql(
                {
                    startsAt: '2019-04-03T01:00:00+02:00',
                    endsAt: '2019-04-03T01:04:12+02:00',
                    price: 0.35965,
                    charge: true
                }
            );
        });

    });

    describe("Check isBeforeChargePlan", function () {

        it("isBeforeChargePlan 1", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isBeforeChargePlan(moment('2019-04-01T10:00:00+02:00'))).to.eql(true);
        });
        it("isBeforeChargePlan 2", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isBeforeChargePlan(moment('2019-04-02T21:00:00+02:00'))).to.eql(true);
        });
        it("isBeforeChargePlan 3", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isBeforeChargePlan(moment('2019-04-02T21:59:59+02:00'))).to.eql(true);
        });
        it("isBeforeChargePlan 4", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isBeforeChargePlan(moment('2019-04-02T22:00:00+02:00'))).to.eql(false);
        });
        it("isBeforeChargePlan 5", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isBeforeChargePlan(moment('2019-04-02T22:30:00+02:00'))).to.eql(false);
        });
        it("isBeforeChargePlan 6", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isBeforeChargePlan(moment('2019-04-02T23:00:00+02:00'))).to.eql(false);
        });
        it("isBeforeChargePlan 7", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isBeforeChargePlan(moment('2019-04-03T06:00:00+02:00'))).to.eql(false);
        });
        it("isBeforeChargePlan 8", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isBeforeChargePlan(moment('2019-04-03T06:30:00+02:00'))).to.eql(false);
        });
        it("isBeforeChargePlan 9", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isBeforeChargePlan(moment('2019-04-03T06:59:59+02:00'))).to.eql(false);
        });
        it("isBeforeChargePlan 10", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isBeforeChargePlan(moment('2019-04-03T07:00:00+02:00'))).to.eql(false);
        });
        it("isBeforeChargePlan 11", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isBeforeChargePlan(moment('2019-04-03T08:00:00+02:00'))).to.eql(false);
        });
        it("isBeforeChargePlan 12", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isBeforeChargePlan(moment('2019-04-03T09:00:00+02:00'))).to.eql(false);
        });

    });

    describe("Check isAfterChargePlan", function () {

        it("isAfterChargePlan 1", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isAfterChargePlan(moment('2019-04-01T10:00:00+02:00'))).to.eql(false);
        });
        it("isAfterChargePlan 2", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isAfterChargePlan(moment('2019-04-02T21:00:00+02:00'))).to.eql(false);
        });
        it("isAfterChargePlan 3", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isAfterChargePlan(moment('2019-04-02T22:00:00+02:00'))).to.eql(false);
        });
        it("isAfterChargePlan 4", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isAfterChargePlan(moment('2019-04-02T22:30:00+02:00'))).to.eql(false);
        });
        it("isAfterChargePlan 5", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isAfterChargePlan(moment('2019-04-02T23:00:00+02:00'))).to.eql(false);
        });
        it("isAfterChargePlan 6", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isAfterChargePlan(moment('2019-04-03T06:00:00+02:00'))).to.eql(false);
        });
        it("isAfterChargePlan 7", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isAfterChargePlan(moment('2019-04-03T06:30:00+02:00'))).to.eql(false);
        });
        it("isAfterChargePlan 8", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isAfterChargePlan(moment('2019-04-03T06:59:59+02:00'))).to.eql(false);
        });
        it("isAfterChargePlan 9", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isAfterChargePlan(moment('2019-04-03T07:00:00+02:00'))).to.eql(true);
        });
        it("isAfterChargePlan 10", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isAfterChargePlan(moment('2019-04-03T08:00:00+02:00'))).to.eql(true);
        });
        it("isAfterChargePlan 11", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isAfterChargePlan(moment('2019-04-03T09:00:00+02:00'))).to.eql(true);
        });

    });

    describe("Check isFirstChargePeriod", function () {

        it("isFirstChargePeriod 1", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isFirstChargePeriod(moment('2019-04-02T21:00:00+02:00'))).to.eql(false);
        });
        it("isFirstChargePeriod 2", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isFirstChargePeriod(moment('2019-04-02T22:00:00+02:00'))).to.eql(true);
        });
        it("isFirstChargePeriod 3", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isFirstChargePeriod(moment('2019-04-02T22:01:00+02:00'))).to.eql(true);
        });
        it("isFirstChargePeriod 4", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isFirstChargePeriod(moment('2019-04-02T22:59:59+02:00'))).to.eql(true);
        });
        it("isFirstChargePeriod 5", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isFirstChargePeriod(moment('2019-04-02T23:00:00+02:00'))).to.eql(false);
        });
        it("isFirstChargePeriod 6", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isFirstChargePeriod(moment('2019-04-03T06:00:00+02:00'))).to.eql(false);
        });
    });

    describe("Check isLastChargePeriod charging not set", function () {

        it("isLastChargePeriod 1", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-02T21:00:00+02:00'))).to.eql(false);
        });
        it("isLastChargePeriod 2", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-02T22:00:00+02:00'))).to.eql(false);
        });
        it("isLastChargePeriod 3", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-02T22:01:00+02:00'))).to.eql(false);
        });
        it("isLastChargePeriod 4", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T04:00:00+02:00'))).to.eql(false);
        });
        it("isLastChargePeriod 5", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T04:01:00+02:00'))).to.eql(false);
        });
        it("isLastChargePeriod 6", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T04:59:59+02:00'))).to.eql(false);
        });
        it("isLastChargePeriod 4", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T05:00:00+02:00'))).to.eql(false);
        });
        it("isLastChargePeriod 5", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T05:01:00+02:00'))).to.eql(false);
        });
        it("isLastChargePeriod 6", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T05:59:59+02:00'))).to.eql(false);
        });
        it("isLastChargePeriod 4", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T06:00:00+02:00'))).to.eql(true);
        });
        it("isLastChargePeriod 5", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T06:01:00+02:00'))).to.eql(true);
        });
        it("isLastChargePeriod 6", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T06:59:59+02:00'))).to.eql(true);
        });
        it("isLastChargePeriod 7", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T07:00:00+02:00'))).to.eql(false);
        });
    });

    describe("Check isLastChargePeriod charging set", function () {

        it("isLastChargePeriod 1", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-02T21:00:00+02:00'), true)).to.eql(false);
        });
        it("isLastChargePeriod 2", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-02T22:00:00+02:00'), true)).to.eql(false);
        });
        it("isLastChargePeriod 3", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-02T22:01:00+02:00'), true)).to.eql(false);
        });
        it("isLastChargePeriod 4", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T04:00:00+02:00'), true)).to.eql(true);
        });
        it("isLastChargePeriod 5", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T04:01:00+02:00'), true)).to.eql(true);
        });
        it("isLastChargePeriod 6", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T04:59:59+02:00'), true)).to.eql(true);
        });
        it("isLastChargePeriod 4", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T05:00:00+02:00'), true)).to.eql(false);
        });
        it("isLastChargePeriod 5", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T05:01:00+02:00'), true)).to.eql(false);
        });
        it("isLastChargePeriod 6", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T05:59:59+02:00'), true)).to.eql(false);
        });
        it("isLastChargePeriod 4", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T06:00:00+02:00'), true)).to.eql(false);
        });
        it("isLastChargePeriod 5", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T06:01:00+02:00'), true)).to.eql(false);
        });
        it("isLastChargePeriod 6", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T06:59:59+02:00'), true)).to.eql(false);
        });
        it("isLastChargePeriod 7", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T07:00:00+02:00'), true)).to.eql(false);
        });
    });

    describe("Check isLastChargePeriod charging set 2", function () {

        it("isLastChargePeriod 1", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices3());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-02T21:00:00+02:00'), true)).to.eql(false);
        });
        it("isLastChargePeriod 2", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices3());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T03:00:00+02:00'), true)).to.eql(false);
        });
        it("isLastChargePeriod 3", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices3());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T03:59:00+02:00'), true)).to.eql(false);
        });
        it("isLastChargePeriod 4", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices3());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T04:00:00+02:00'), true)).to.eql(true);
        });
        it("isLastChargePeriod 5", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices3());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T04:04:00+02:00'), true)).to.eql(true);
        });
        it("isLastChargePeriod 6", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices3());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T04:05:00+02:00'), true)).to.eql(true);
        });
        it("isLastChargePeriod 7", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices3());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T04:59:00+02:00'), true)).to.eql(true);
        });
        it("isLastChargePeriod 8", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices3());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T05:00:00+02:00'), true)).to.eql(false);
        });
        it("isLastChargePeriod 9", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices3());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T06:00:00+02:00'), true)).to.eql(false);
        });
        it("isLastChargePeriod 10", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices3());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T06:01:00+02:00'), true)).to.eql(false);
        });
        it("isLastChargePeriod 11", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices3());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T06:59:59+02:00'), true)).to.eql(false);
        });
        it("isLastChargePeriod 12", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices3());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.isLastChargePeriod(moment('2019-04-03T07:00:00+02:00'), true)).to.eql(false);
        });
    });

    describe("Calculate sum charge hours", function () {
        it("calculateSumChargeHours 1", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(moment.utc(chargePlan.calculateSumChargeHours().as('milliseconds')).format('HH:mm:ss')).to.eql('04:04:12');
        });
    });

    describe("Charge plan as text", function () {
        it("asText 1", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            expect(chargePlan.asText('Label1', 'Label2', 'Label3')).to.eql('Label1: 114 km\nLabel2: 04:04\nLabel3: 1.79 %\n00:00-01:00: 0.3583 NOK/kWh\n01:00-01:04: 0.35965 NOK/kWh\n02:00-03:00: 0.35927 NOK/kWh\n03:00-04:00: 0.35927 NOK/kWh\n04:00-05:00: 0.35609 NOK/kWh');
        });
    });

    describe("Calculate cost reduction", function () {
        it("calculateCostReduction 1", function () {
            let chargePlan = new ChargePlan(getConfig(), getPrices());
            let chPlan = chargePlan.createChargePlan(moment('2019-04-02T17:00:00+02:00'));
            let costReduction = chargePlan.calculateCostReduction();
            expect(costReduction).to.eql(-0.01788855);
            expect(Math.round(-10000 * costReduction) / 100).to.eql(1.79);
        });
    });

});