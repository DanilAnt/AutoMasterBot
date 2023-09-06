
const Dadata = require('dadata-suggestions');
const { default: fetch } = require('node-fetch').default

class Geocoder {

    constructor() {
        this.dadata = new Dadata(process.env.API_KEY_DADATA);
    }

    async getAdress({ query }) {
        let res = null
        try {
            res = await this.dadata.address({ query, count: 1 })
            console.log({ getAdress: res });
        }
        catch (e) {
            console.log(e);
        }

        return res

    }


    async getAdressByCoord(coord) {
console.log(11111);
     let   res = false

        try {
            let response = await fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/geolocate/address', {
                method: 'post',
                body: JSON.stringify({ "lat": coord[1], "lon": coord[0] }),
                headers: {
                    'Content-Type': 'application/json',
                    Accept: "application/json",
                    'Authorization': `Token ${process.env.API_KEY_DADATA}`
                }
            })

            res = await response.json()


            console.log({ getAdressByCoord: res });

        } catch (e) {
            console.log(e);
        }
        return res

    }

}

module.exports = Geocoder