const uid = require('uid').uid
const transport_categories = require('./transport_categories')
const works_categories = require('./works_categories')
const fs = require('fs');
const db = require('./db')
class Order {
    creatorId = ''
    executorId = ''
    comission = 0;
    text = ''
    location = [0, 0]
    address = ''
    custumer_phone = ''
    transport_category = '';
    work_category = '';
    id = 0;
    price = 0;
    created_at = 0;
    modified_at = 0


    constructor({ creatorId,
        executorId,
        comission,
        text,
        location,
        address,
        custumer_phone,
        transport_category,
        work_category,
        id,
        price,
        created_at,
        modified_at
    }) {

        this.creatorId = creatorId
        this.id = id || uid();
        this.created_at = created_at || Date.now()
        this.modified_at = modified_at || created_at
        this.setComission(comission)
        this.setText(text)
        this.setLocation(location, address)
        this.setCustumerPhone(custumer_phone)
        this.setTransportCategory(transport_category)
        this.setWorkCategory(work_category)
        this.setPrice(price)
        this.setExecutorId(executorId)

        this.initialized = true


        this.save()
    }

    setExecutorId(id) {
        if (id) {
            this.executorId = id
        }

        if (this.initialized) {
            this.save()
        }

    }

    setComission(comission) {
        if (comission) {
            this.comission = comission
        }


        if (this.initialized) {

            this.save()
        }
    }

    setPrice(price) {
        if (price) {
            this.price = price
        }


        if (this.initialized) {

            this.save()
        }
    }
    setText(text) {
        if (text) {
            this.text = text
        }
        if (this.initialized) {

            this.save()
        }

    }


    setLocation(coord, address = '') {
        if (this.checkCoord(coord)) {
            this.location = [coord[0], coord[1]]
            this.address = address
        }
        if (this.initialized) {
            this.save()
        }
    }


    checkCoord(coord) {
        if (!Array.isArray(coord) || !Number.isFinite(coord[0]) || !Number.isFinite(coord[0]) || !coord[0] || !coord[1]) {

            return false

        }
        else {
            return true
        }
    }

    setCustumerPhone(phone) {
        if (phone) {
            this.custumer_phone = phone
        }

        if (this.initialized) {
            this.save()
        }
    }

    setTransportCategory(category) {

        if (transport_categories.find(i => i.key === category)) {
            this.transport_category = category
        } else {
            this.transport_category = ''
        }



        if (this.initialized) {
            this.save()
        }
    }

    setWorkCategory(category) {

        if (works_categories.find(i => i.key === category)) {
            this.work_category = category
        } else {
            this.work_category = ''
        }

        if (this.initialized) {
            this.save()
        }
    }

    checkLocation() {

        return this.checkCoord(this.location)
    }



    save() {

        const obj = {
            creatorId: this.creatorId,
            executorId: this.executorId,
            comission: this.comission,
            text: this.text,
            location: this.location,
            address: this.address,
            custumer_phone: this.custumer_phone,
            transport_category: this.transport_category,
            work_category: this.work_category,
            id: this.id,
            price: this.price,
            modified_at: Date.now(),
            created_at: this.created_at
        }

        const json = JSON.parse(fs.readFileSync('./orders.json', 'utf8'));

        json.orders = Array.isArray(json.orders) ?
            [...json.orders.filter(m => m.id !== obj.id), obj] : [obj]

        try {
            // convert JSON object to a string
            const data = JSON.stringify(json, null, 4)

            // write file to disk
            fs.writeFileSync('./orders.json', data, 'utf8')
        } catch (err) {
            console.log(`Error writing file: ${err}`)
        }

    }

    getTextInfo({ custumer_phone } = {}) {
        const master = db.getMaster({ id: this.creatorId })
        let name = master ? master.first_name : ''
        let transport_category = transport_categories.find(i => i.key === this.transport_category)
        let transport_category_value = transport_category ? transport_category.value : this.transport_category
        let work_category = works_categories.find(i => i.key === this.work_category)
        let work_category_value = work_category ? work_category.value : this.work_category

        let str = `Заказ от: ${name}\nТранспорт: ${transport_category_value}\nТип работы: ${work_category_value}\nАдрес: ${this.address}\nКомиссия: ${this.comission}\nОписание: ${this.text}\nСтоимость: ${this.price}\n`

        if (custumer_phone) {
            str = str + `Номер клиента: ${this.custumer_phone}\n`
        }
        return str
    }
}

module.exports = Order