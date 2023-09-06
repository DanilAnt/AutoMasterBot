require('dotenv').config()
const Bot = require('./Bot')
const Geocoder = require('./Geokoder')
const TelegramBot = require('node-telegram-bot-api');


class App {

    constructor() {

        console.log(process.env.API_KEY_MASTER_BOT);
        this.initBot()

        this.initGeocoder()

        
    }

    initGeocoder(){

console.log(Geocoder);
this.geocoder = new Geocoder()
    }

    initBot() {
        this.bot = new Bot(process.env.API_KEY_MASTER_BOT, {
            polling: true
        });
    }

   async createMaster(){

    //adding Master to MOngo db

    }
}



const app = new App()