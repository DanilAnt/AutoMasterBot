const uid = require('uid').uid
class Order {

    comission = 0;

    constructor({ creatorId, text }) {

        this.creatorId = creatorId
        this.text = text
        this.location = []
        this.address = ''
        this.custumer_phone = ''
        this.id = uid()
    }

    setComission(comission) {
        this.comission = comission
    }

    setLocation(coord, address) {
        if (this.checkCoord(coord)) {
            this.location = [coord[0], coord[1]]
            this.address = address
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
        this.custumer_phone = phone
    }

    checkLocation() {

        return this.checkCoord(this.location)
    }


    getText() {
        return `Заказ от: ${this.creatorId}\nАдресс: ${this.address}\nКомиссия: ${this.comission}\n${this.text}`
    }
}

module.exports = Order