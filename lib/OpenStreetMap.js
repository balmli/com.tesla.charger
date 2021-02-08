const http = require('http.min');

module.exports = class OpenStreetMap {

    async getAddress(lat, lon, language) {
        if (!language) {
            language = 'en';
        }

        return http.json({
            uri: `https://nominatim.openstreetmap.org/reverse`,
            query: { format: 'json', lat: lat, lon: lon },
            headers: {
                'User-Agent': 'Tesla Smart Charger app - https://github.com/balmli/com.tesla.charger',
                'Accept-Language': language.toLowerCase()
            }
        }).then(function (result) {
            if (result.error || !result.address) {
                return ({ place: 'Unknown', city: 'Unknown' });
            }
            return {
                place: result.address.cycleway || result.address.road || result.address.retail || result.address.footway || result.address.address29 || result.address.path || result.address.pedestrian || result.address[Object.keys(result.address)[0]],
                city: result.address.city || result.address.town || result.address.village || result.address[Object.keys(result.address)[1]]
            }
        })
    }

};
