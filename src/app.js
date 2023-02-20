const request = require('request');
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require("axios");

const location = process.env.LOCATION;
const waitTime = process.env.WAIT_TIME;
const enableNotify = process.env.ENABLE_NOTIFY;
const verbose = process.env.VERBOSE;
const telegramKey = process.env.TELEGRAM_BOT_TOKEN;
const telegramChatId = process.env.TELEGRAM_CHATID;

// create a new bot with your bot token
const bot = new TelegramBot(telegramKey, { polling: false });

const getRandomGUID = () => {
    // Function to generate random GUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

const generateHeaders = () => {
    // Function to generate common Headers
    var headers =
    {
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'it-IT,it;q=0.9',
        Connection: 'keep-alive',
        'Cache-Control': 'max-age=0',
        'Upgrade-Insecure-Requests': '1',
        'Content-Type': 'application/json'
    }

    return headers;
};

const checkAvailability = () => {

    const options = {
        method: 'GET',
        url: 'https://www.passaportonline.poliziadistato.it/CittadinoAction.do',
        params: { codop: 'resultRicercaRegistiProvincia', provincia: location },
        headers: generateHeaders()
    };

    axios.request(options).then(function (response) {
        body = response.data;

        if (verbose == "TRUE") console.log(body);

        if (body.includes('<td headers="disponibilita">Si</td>')) {

            bot.sendMessage(telegramChatId, `There is an availability in : ${location}. Book it now: https://www.passaportonline.poliziadistato.it/CittadinoAction.do?codop=resultRicercaRegistiProvincia&provincia=MI`)
                .then(() => console.log('Notification sent successfully'))
                .catch((error) => console.error(`Error sending notification: ${error}`));

            // const htmlTable = body.substring(
            //     body.indexOf('<td headers="disponibilita">Si</td>'),
            //     body.indexOf('<td headers="disponibilita">Si</td>') + 500
            // );
            // const href = htmlTable.substring(
            //     htmlTable.indexOf('selezionaStruttura'),
            //     htmlTable.indexOf('">')
            // );
            // const hrefUrl = 'https://www.passaportonline.poliziadistato.it/${href}';

            // const optionsHref = {
            //     url: hrefUrl,
            //     headers: generateHeaders()
            // };

            // request.get(optionsHref, (error, response, body) => {
            //     if (!error && response.statusCode == 200) {
            //         // Do something with the response
            //         const message = "There is a new open slot!!"

            //         // send a message to the specified chat id
            //         bot.sendMessage(chatId, message)
            //             .then(() => console.log('Notification sent successfully'))
            //             .catch((error) => console.error(`Error sending notification: ${error}`));
            //     } else {
            //         console.log(`Error: ${error}`);
            //     }
            // });
        } else {
            console.log(`No availability in ${location}`);
        }
    }).catch(function (error) {
        bot.sendMessage(telegramChatId, `Error: ${error}`)
        .then(() => console.log('Notification sent successfully'))
        .catch((error) => console.error(`Error sending notification: ${error}`));
    });
};

setInterval(() => {
    console.log("Starting...")
    checkAvailability();
}, waitTime * 100); // Convert seconds to milliseconds and repeat check every X seconds.