const TelegramBot = require('node-telegram-bot-api');
const Master = require('./Master');
const Order = require('./Order');
const Geocoder = require('./Geokoder')
var fs = require('fs');

const transport_categories = require('./transport_categories')
const works_categories = require('./works_categories')
class Bot {

    cancel_button_text = 'Отменить'
    confirm_button_text = "Подтвердить"

    masters = []

    orders = []

    actions = {
        sign_up: {
            select: async ({ master }) => {
                master.setAction('sign_up')
                await this.requestNumber(master.chat_id, 'Здравствуйте, Вас приветствует комманда АвтоМастерПро! Для дальнейшей регистрации введите номер телефона в формате +7xxxxxxxxxx:')
            },

            resolve: async ({ msg, master }) => {
                let phone = msg.text
                if (phone) {
                    master.setPhone(phone)
                    this.actions['sign_up_name'].select({ master })
                } else {
                    this.actions['sign_up'].select({ master })
                }
            }
        },

        sign_up_name: {
            select: async ({ master }) => {
                master.setAction('sign_up_name')
                await this.sendMessage(master.chat_id, 'ФИО:')
            },

            resolve: async ({ msg, master }) => {
                let name = msg.text
                if (name) {
                    master.setFirstName(name)
                    this.actions['sign_up_location'].select({ master })
                } else {
                    this.actions['sign_up_name'].select({ master })
                }
            }
        },

        sign_up_location: {
            select: async ({ master }) => {
                master.setAction('sign_up_location')
                await this.requestLocation(master.chat_id, "Отправьте геометку для определения основной зоны работ: радиус 20км от выбранной локации:")
            },

            resolve: async ({ msg, master }) => {
                let location = msg.location
                if (this.checkCoord(location)) {

                    let res = await this.geocoder.getAdressByCoord(msg.location)
                    if (res && res.suggestions && res.suggestions[0]) {
                        let address = res.suggestions[0]
                        master.setLocation(location, address.value);
                    } else {
                        master.setLocation(location, '')
                    }





                    this.actions['sign_up_transport_categories'].select({ master })
                } else {
                    this.actions['sign_up_location'].select({ master })
                }
            }

        },

        sign_up_transport_categories: {
            select: async ({ master, hide_message }) => {
                master.setAction('sign_up_transport_categories')



                const keyboard = {
                    reply_markup: {
                        keyboard: [
                        ],
                        resize_keyboard: true
                    },
                };
                transport_categories.forEach((i, index) => {
                    let obj = { text: (master.transport_categories.includes(i.key) ? '✅' : '') + i.value }
                    if (index % 2) {
                        keyboard.reply_markup.keyboard[Math.floor(index / 2)][1] = obj
                    } else {
                        keyboard.reply_markup.keyboard.push([obj])
                    }
                })

                keyboard.reply_markup.keyboard.push([
                    this.confirm_button_text
                ])
                let res = await this.bot.sendMessage(master.chat_id, hide_message ? 'Подтвердите выбор или дополните:' : "Выберите категории транспорта, с которыми работаете:", keyboard);

                console.log(res);
            },

            resolve: async ({ msg, master }) => {
                let select = msg.text || ''

                if (select === this.confirm_button_text) {
                    this.actions['sign_up_works_categories'].select({ master })
                    return
                }

                let category =
                    transport_categories.find(c => select.includes(c.value))



                // this.bot.deleteMessage(msg.chat.id, msg.message_id)
                if (
                    category
                ) {
                    if (master.transport_categories.includes(category.key)) {
                        master.setTransportCategories([...master.transport_categories.filter(i => i !== category.key)])
                    } else {
                        master.setTransportCategories([...master.transport_categories, category.key])
                    }

                    this.actions['sign_up_transport_categories'].select({ master, hide_message: true })
                } else {
                    this.actions['sign_up_transport_categories'].select({ master })
                }


            }


        },

        sign_up_works_categories: {
            select: async ({ master, hide_message }) => {
                master.setAction('sign_up_works_categories')

                const keyboard = {
                    reply_markup: {
                        keyboard: [
                        ],
                        resize_keyboard: true
                    },
                };
                works_categories.forEach((i, index) => {
                    let obj = { text: (master.works_categories.includes(i.key) ? '✅' : '') + i.value }
                    if (index % 2) {
                        keyboard.reply_markup.keyboard[Math.floor(index / 2)][1] = obj
                    } else {
                        keyboard.reply_markup.keyboard.push([obj])
                    }
                })

                keyboard.reply_markup.keyboard.push([
                    this.confirm_button_text
                ])
                let res = await this.bot.sendMessage(master.chat_id, hide_message ? 'Подтвердите выбор или дополните:' : "Выберите специализацию выполняемых работ:", keyboard);

                console.log(res);
            },

            resolve: async ({ msg, master }) => {
                let select = msg.text || ''

                if (select === this.confirm_button_text) {
                    this.actions['sign_up_complete'].select({ master })
                    return
                }

                let category =
                    works_categories.find(c => select.includes(c.value))



                // this.bot.deleteMessage(msg.chat.id, msg.message_id)
                if (
                    category
                ) {
                    if (master.works_categories.includes(category.key)) {
                        master.setWorksCategories([...master.works_categories.filter(i => i !== category.key)])
                    } else {
                        master.setWorksCategories([...master.works_categories, category.key])
                    }

                    this.actions['sign_up_works_categories'].select({ master, hide_message: true })
                } else {
                    this.actions['sign_up_works_categories'].select({ master })
                }


            }

        },

        sign_up_complete: {
            select: async ({ master }) => {
                master.setAction('sign_up_complete')
                await this.sendMessage(master.chat_id, "Профиль активирован!");
                await this.sendMessage(master.chat_id, master.getTextInfo());


                this.actions['base'].select({ master })
            },

            resolve: async ()=>{

            }
        }
        ,
        base: {
            text: "",
            select: async ({ master }) => {
                const keyboard = {
                    reply_markup: {
                        keyboard: [
                            [
                                {
                                    text: this.actions.createOrder.text,
                                },
                                // {
                                //     text: this.actions.changeLocation.text,
                                // },
                            ],
                        ],
                        resize_keyboard: true
                    },
                };

                master.setAction('base')
                await this.bot.sendMessage(master.chat_id, "Выберите действие:", keyboard);

            },

            resolve: ({ msg, master }) => {
                let actionKey = Object.keys(this.actions).find(key => {
                    return this.actions[key].text === msg.text
                })

                let action = this.actions[actionKey]
                if (action) {
                    action.select({ msg, master })
                } else {
                    this.showBaseActions({ master })
                }
            }

        },


        createOrder: {
            text: 'Создать заявку',
            select: async ({ master }) => {
                master.setAction('createOrder')
                await this.sendMessage(master.chat_id, "Опишите задачу");
            },

            resolve: async ({ msg, master }) => {
                let order = new Order({ creatorId: master.id, text: msg.text });
                this.orders.push(order)
                master.setCreatindOrderId(order.id)
                this.actions['createOrder_setComission'].select({ msg, master })
            }
        },


        createOrder_setComission: {
            select: async ({ master }) => {
                master.setAction('createOrder_setComission')
                await this.sendMessage(master.chat_id, "Укажите комиссию");
            },

            resolve: async ({ msg, master }) => {

                let order = this.orders.find(o => o.id === master.creatindOrderId)

                if (order) {
                    order.setComission(msg.text)
                    this.actions['createOrder_setCustumerPhone'].select({ msg, master })
                } else {
                    this.showBaseActions({ master })
                }

                // await this.bot.sendMessage(msg.chat.id, "Задача создана");


            }
        },

        createOrder_setCustumerPhone: {
            select: async ({ master }) => {
                master.setAction('createOrder_setCustumerPhone')
                await this.sendMessage(master.chat_id, "Пришлите контакт или номер");
            },

            resolve: async ({ msg, master }) => {

                let order = this.orders.find(o => o.id === master.creatindOrderId)

                if (order) {
                    order.setCustumerPhone(msg.text)
                    this.actions['createOrder_setAddress'].select({ msg, master })
                } else {
                    this.showBaseActions({ master })
                }




            }



        },

        createOrder_setAddress: {

            select: async ({ master }) => {
                master.setAction('createOrder_setAddress')
                this.requestLocation(master.chat_id, "Напишите адрес или пришлите геологацию")
            },

            resolve: async ({ msg, master }) => {


                let order = this.orders.find(o => o.id === master.creatindOrderId)

                if (order) {



                    if (msg.location) {

                        let res = await this.geocoder.getAdressByCoord(msg.location)
                        if (res && res.suggestions && res.suggestions[0]) {

                            let address = res.suggestions[0]

                            console.log({ address });
                            order.setLocation([+address.data.geo_lon, +address.data.geo_lat], address.value);
                        }

                    } else if (msg.text) {

                        let res = await this.geocoder.getAdress({ query: msg.text })

                        if (res && res.suggestions && res.suggestions[0]) {
                            let address = res.suggestions[0]
                            order.setLocation([+address.data.geo_lon, +address.data.geo_lat], address.value);
                        }

                    }

                    if (order.checkLocation()) {
                        console.log({ order });
                        await this.sendMessage(msg.chat.id, "Задача создана");
                        await this.sendMessage(msg.chat.id, order.getText());
                        master.setCreatindOrderId(null);
                        this.showBaseActions({ master })

                        this.orderCreatedHandler({ order })

                    } else {
                        await this.bot.sendMessage(msg.chat.id, "Адрес не найден");
                    }




                } else {

                    this.showBaseActions({ master })
                }
            }
        },

        createOrder_showAddressesResults: {

        },





        changeLocation: {
            text: 'Сменить геопозицию'
        }


    }






    constructor(token, props = {}) {
        this.geocoder = new Geocoder()
        // this.geocoder.getAdress({ query: 'студенческая 3' })


        this.bot = new TelegramBot(token, {
            ...props
        });


        this.errorHandler = this.errorHandler.bind(this)
        this.bot.on("polling_error", this.errorHandler)


        this.messageHandler = this.messageHandler.bind(this)
        this.bot.on('text', this.messageHandler)


        this.contactHandler = this.contactHandler.bind(this)
        this.bot.on('contact', this.contactHandler)

        this.locationHandler = this.locationHandler.bind(this)
        this.bot.on('location', this.locationHandler);




    }

    async orderCreatedHandler({ order }) {

        let text = order.getText()


        this.getMasters().forEach((master) => {

            this.bot.sendMessage(master.chat_id, text, {
                reply_markup: {

                    inline_keyboard: [
                        [{ text: 'Принять', callback_data: 'confirm' }, { text: 'Отклонить', callback_data: 'dicline' }],
                    ]
                }
            });


        })

    }


    async requestLocation(chatId, message_text) {
        const keyboard = {
            reply_markup: {
                keyboard: [
                    [
                        {
                            text: "Поделиться геолокацией",
                            request_location: true, // Это позволяет запросить контакт пользователя
                        },
                    ],
                ],
                resize_keyboard: true
            },
        };

        await this.bot.sendMessage(chatId, message_text || "Пожалуйста, отправьте вашу локацию:", keyboard);

    }

    async requestNumber(chatId, text = 'Пожалуйста, отправьте ваш номер телефона:') {
        const keyboard = {
            reply_markup: {
                keyboard: [
                    [
                        {
                            text: "Поделиться номером",
                            request_contact: true, // Это позволяет запросить контакт пользователя
                        },
                    ],
                ],
                resize_keyboard: true
            },
        };

        await this.bot.sendMessage(chatId, text, keyboard);

    }

    errorHandler(err) {
        console.log(err);
    }


    async requestSignUpField(master) {
        if (master.status === 'first_name') {
            await this.sendMessage(master.chat_id, 'Напишите Ваше имя:')
        } else if (master.status === 'last_name') {
            await this.sendMessage(master.chat_id, 'Напишите Вашу фамилию:')
        } else if (master.status === 'phone') {
            await this.requestNumber(master.chat_id)

        } else if (master.status === 'location') {
            await this.requestLocation(master.chat_id)

        } else if (master.status === 'ready') [
            this.registationFinnisedHandler({ master })
        ]
    }

    async registationFinnisedHandler({ master }) {
        await this.sendMessage(master.chat_id, 'Регистрация завершена!')
        await this.showBaseActions({ master });
    }

    contactHandler(msg) {
        console.log(msg);
        msg.text = msg.contact.phone_number
        this.messageHandler(msg)
    }


    locationHandler(msg) {
        msg.location = [msg.location.longitude, msg.location.latitude]
        this.messageHandler(msg)
    }

    async showBaseActions({ msg, master }) {
        this.actions['base'].select({ msg, master })
    }

    async messageHandler(msg) {
        console.log(msg);
        try {

            let master = this.isExists(msg.from.id)


            if (master) {
                master.chat_id = msg.chat.id;

                // if (master.status !== 'ready') {
                //     if (master.status === 'first_name') {
                //         master.setFirstName(msg.text)
                //     } else if (master.status === 'last_name') {
                //         master.setLastName(msg.text)
                //     } else if (master.status === 'phone') {
                //         master.setPhone(msg.text)
                //     } else if (master.status === 'location') {

                //         if (msg.location) {
                //             master.setLocation(msg.location)
                //         } else {

                //             let res = await this.geocoder.getAdress({ query: msg.text })
                //             if (res && res.suggestions && res.suggestions[0]) {
                //                 console.log(res.suggestions[0]);
                //             }
                //             // this.sendMessage(msg.chat.id, res.suggestions[0] ? res.suggestions[0].result : 'адрес не найден')



                //         }

                //     }
                //     this.requestSignUpField(master)
                // } else {


                let actionKey = Object.keys(this.actions).find(key => {
                    return key === master.action
                })

                let action = this.actions[actionKey]


                console.log({ actionKey });
                if (action) {
                    action.resolve({ master, msg })
                } else if (master.is_registered) {


                    this.showBaseActions({ master, msg })
                } else {
                    this.actions['sign_up'].select({ master })
                }





                // }




            } else {

                this.newUserHandler({ telegram_id: msg.from.id, username: msg.from.username, chat_id: msg.chat.id })


            }
        }
        catch (error) {
            console.log(error);
        }
    }
    async newUserHandler({ telegram_id, chat_id, username }) {
        const master = this.createMaster({ telegram_id, chat_id, username })
        this.actions['sign_up'].select({ master })
    }
    createMaster({ telegram_id, chat_id, username }) {
        const master = new Master({ telegram_id, chat_id, username })
        return master
    }

    getMasters() {
        const json = JSON.parse(fs.readFileSync('./masters.json', 'utf8'));
        return json.masters || []
    }

    isExists(telegram_id) {
        let master = this.getMasters().find(m => m.telegram_id === telegram_id) || false
        if (master) {
            return new Master({ ...master })
        } else {
            return false

        }
    }

    async sendMessage(chat_id, text) {

        let keyboard = {
            reply_markup: {
                remove_keyboard: true,
                selective: false
            },
        };

        await this.bot.sendMessage(chat_id, text,
            keyboard)
    }

    async waiting(chat_id, text) {
        const msgWait = await this.bot.sendMessage(chat_id, `Ожидайте ответа...`);
        return async () => {
            await this.bot.deleteMessage(msgWait.chat.id, msgWait.message_id);
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



}

module.exports = Bot