const request = require('request');
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require("axios");
const cheerio = require('cheerio');

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

            // load the HTML into Cheerio
            const $ = cheerio.load(body);

            // find the table with class "imposta_utenti"
            const table = $('table.imposta_utenti');

            // loop through each "tr" element in the table
            table.find('tr').each((i, tr) => {
                // check if there is a "td" with headers="disponibilita" and value "Si"
                const td = $(tr).find('td[headers="disponibilita"]:contains("Si")');
                if (td.length > 0) {
                    // get the "td" with headers="selezionaStruttura"
                    const href = $(tr).find('td[headers="selezionaStruttura"] a').attr('href');

                    //exclude
                    const city = $(tr).find('td[headers="citta"]').text();
                    if (city != "RHO-PERO" || city != "SESTO SAN GIOVANNI" || city != "CINISELLO BALSAMO")
                        bot.sendMessage(telegramChatId, `There is an availability in : ${location}. Book it now: https://www.passaportonline.poliziadistato.it/${href}`)
                            .then(() => console.log('Notification sent successfully'))
                            .catch((error) => console.error(`Error sending notification: ${error}`));
                }
            });
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
}, waitTime * 10); // Convert seconds to milliseconds and repeat check every X seconds.