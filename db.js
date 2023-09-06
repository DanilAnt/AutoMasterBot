const fs = require('fs');
const db = {

    getMasters() {
        const json = JSON.parse(fs.readFileSync('./masters.json', 'utf8'));
        return json.masters || []
    },

    getMaster({ id, telegram_id }) {
        if (telegram_id) {
            return this.getMasters().find(m => m.telegram_id === telegram_id) || false
        } else if (id) {
            return this.getMasters().find(m => m.id === id) || false

        } else {
            return false
        }
    },

    getOrders() {
        const json = JSON.parse(fs.readFileSync('./orders.json', 'utf8'));
        return json.orders || []
    },

    getOrder({ id }) {
        const order = this.getOrders().find(o => o.id === id)
        if (order) {
            return order
        } else {
            return false
        }
    }

}

module.exports = db