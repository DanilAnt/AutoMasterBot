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

    getOrders({ executorId, transport_categories }) {
        const json = JSON.parse(fs.readFileSync('./orders.json', 'utf8'));



        let orders =
            json.orders || []



        orders = orders.filter(o => {
            let res = true
            if (typeof executorId === 'string') {
                if (o.executorId !== executorId) {
                    res = false
                }
            }
            if (Array.isArray(transport_categories)) {
                if (!transport_categories.includes(o.transport_category)) {
                    res = false
                }
            }
            return res
        })


        return orders
    },

    getOrder({ id }) {
        const order = this.getOrders().find(o => o.id === id)
        if (order) {
            return order
        } else {
            return false
        }
    }
    ,
    addCallback(callback) {
        if (!callback || !callback.id) return
        const json = JSON.parse(fs.readFileSync('./callbacks.json', 'utf8'));

        json.callbacks = Array.isArray(json.callbacks) ?
            [...json.callbacks.filter(c => c.id !== callback.id), callback] : [callback]
        try {
            // convert JSON object to a string
            const data = JSON.stringify(json, null, 4)

            // write file to disk
            fs.writeFileSync('./callbacks.json', data, 'utf8')
        } catch (err) {
            console.log(`Error writing file: ${err}`)
        }


    },
    getCallbacks() {
        const json = JSON.parse(fs.readFileSync('./callbacks.json', 'utf8'));
        return json.callbacks || []
    },
    getCallback({ id }) {
        const callback = this.getCallbacks().find(o => o.id === id)
        if (callback) {
            return callback
        } else {
            return false
        }
    }
}

module.exports = db