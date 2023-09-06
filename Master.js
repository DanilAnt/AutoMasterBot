const uid = require('uid').uid
const transport_categories = require('./transport_categories')
const works_categories = require('./works_categories')
works_categories
var fs = require('fs');

class Master {

    phone = ''
    id = ''
    location = [0, 0]
    first_name = ''
    last_name = ''
    telegram_id = ''
    chat_id = ''
    action = 'first_name'
    username = ''
    creatindOrderId = null
    is_registered = false
    status = 'first_name'
    transport_categories = [];
    works_categories = []
    address = ''
    constructor(
        {
            phone,
            id,
            location,
            first_name,
            last_name,
            telegram_id,
            chat_id,
            action,
            username,
            transport_categories,
            works_categories,
            creatindOrderId,
            is_registered,
            address
        }
    ) {
        this.telegram_id = telegram_id
        this.username = username
        this.id = id || uid()
        this.setChatId(chat_id)
        this.setPhone(phone)
        this.setLocation(location, address)
        this.setFirstName(first_name)
        this.setLastName(last_name)
        this.setAction(action)
        this.setCreatindOrderId(creatindOrderId)
        this.setIsRegistered(is_registered)
        this.setStatus()
        this.setTransportCategories(transport_categories)
        this.setWorksCategories(works_categories)
        this.initialized = true


        this.save()

    }

    setWorksCategories(arr) {

        if (Array.isArray(arr)) {
            this.works_categories = arr.filter(i => !!works_categories.find(cat => cat.key === i))
        }
        if (this.initialized) {

            this.save()
        }
    }

    setTransportCategories(arr) {

        if (Array.isArray(arr)) {
            this.transport_categories = arr.filter(i => !!transport_categories.find(cat => cat.key === i))
        }
        if (this.initialized) {

            this.save()
        }


    }
    setIsRegistered(val) {
        if (typeof val === 'boolean') {
            this.is_registered = val
        }
        if (this.initialized) {

            this.save()
        }

    }

    setCreatindOrderId(id) {
        this.creatindOrderId = id

        if (this.initialized) {

            this.save()
        }


    }

    setChatId(id) {
        this.chat_id = id
        if (this.initialized) {

            this.save()
        }

    }

    setAction(action) {
        this.action = action
        if (this.initialized) {

            this.save()
        }

    }

    setStatus() {
        if (!this.first_name) {
            this.status = 'first_name'
        } else if (!this.last_name) {
            this.status = 'last_name'
        } else if (!this.phone) {
            this.status = 'phone'
        } else if (!this.checkCoord(this.location)) {
            this.status = 'location'
        }
        else {
            this.status = 'ready'
        }

        if (this.initialized) {

            this.save()
        }

    }



    setFirstName(name) {
        if (name) this.first_name = name
        this.setStatus()
        if (this.initialized) {

            this.save()
        }

    }


    setLastName(name) {

        if (name) this.last_name = name
        this.setStatus()

        if (this.initialized) {

            this.save()
        }

    }


    setPhone(phone) {
        if (phone) this.phone = phone

        this.setStatus()

        if (this.initialized) {

            this.save()
        }

    }

    setLocation(coord, address = '') {
        if (this.checkCoord(coord)) {
            this.location = [coord[0], coord[1]]
            this.address = address
        }

        this.setStatus()
        if (this.initialized) {

            this.save()
        }

    }





    setAdressByCoords() {

    }

    checkCoord(coord) {
        if (!Array.isArray(coord) || !Number.isFinite(coord[0]) || !Number.isFinite(coord[0]) || !coord[0] || !coord[1]) {

            return false

        }
        else {
            return true
        }


    }

    save() {

        const obj = {
            phone: this.phone,
            id: this.id,
            location: this.location,
            first_name: this.first_name,
            last_name: this.last_name,
            telegram_id: this.telegram_id,
            chat_id: this.chat_id,
            action: this.action,
            username: this.username,
            creatindOrderId: this.creatindOrderId,
            status: this.status,
            is_registered: this.is_registered,
            works_categories: this.works_categories,
            transport_categories: this.transport_categories,
            address: this.address
        }

        const json = JSON.parse(fs.readFileSync('./masters.json', 'utf8'));

        json.masters = Array.isArray(json.masters) ?
            [...json.masters.filter(m => m.id !== obj.id), obj] : [obj]

        try {
            // convert JSON object to a string
            const data = JSON.stringify(json, null, 4)

            // write file to disk
            fs.writeFileSync('./masters.json', data, 'utf8')
        } catch (err) {
            console.log(`Error writing file: ${err}`)
        }

    }

    getTextInfo() {
        return `Имя: ${this.first_name}\nАдресс: ${this.address}\nТелефон: ${this.phone}\nКатегории транспорта: ${this.transport_categories.map(key => {
            let cat = transport_categories.find(i => i.key === key)
            return cat ? cat.value : key
        }).join('; ')}\nВиды работ: ${this.works_categories.map(key => {
            let cat = works_categories.find(i => i.key === key)
            return cat ? cat.value : key
        }).join('; ')}`

    }



}

module.exports = Master