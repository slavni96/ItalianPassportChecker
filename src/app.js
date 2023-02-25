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
const exclude = [ 'RHO-PERO', 'CINISELLO BALSAMO' ];

// create a new bot with your bot token
const bot = new TelegramBot(telegramKey, { polling: false });
const chatbot = new TelegramBot(telegramKey, { polling: true });

chatbot.on('message', (msg) => {
    if (msg.text === '/start') {
        chatbot.sendMessage(msg.chat.id, 'Hello! This is your bot. Type /help to see the available commands.');
    }
    else if (msg.text === '/help') {
        chatbot.sendMessage(msg.chat.id, 'Available commands:\n/start - Start the bot\n/help - Show this help message\n/info - Show some information');
    }
    else if (msg.text === '/info') {
        chatbot.sendMessage(msg.chat.id, 'This is some information about the bot.');
    }
    else if (msg.text.startsWith('/fetch')) {
        console.log(msg.text);
        const parameters = extractParameters(msg.text);
        const plog = JSON.stringify(parameters);
        //i.e /fetch LOCATION=MI EXCLUDE=RHO-PERO,CINISELLO_BALSAMO WAIT=100

        chatbot.sendMessage(msg.chat.id, `A seach will be launched with the following ${plog}`);

        setInterval(() => {
            console.log("Starting with params...")
            console.log(parameters)
            checkAvailability(chatbot, parameters["LOCATION"], parameters["EXCLUDE"]);
        }, waitTime * parameters["WAIT"]); // Convert seconds to milliseconds and repeat check every X seconds.
    }
});

const extractParameters = (str) => {
    const params = {};
    // Split the string into an array of individual parameters
    const parts = str.split(' ');

    // Loop through the parameters and extract the key-value pairs
    parts.forEach(part => {
        const [key, value] = part.split('=');

        if (key === 'EXCLUDE') {
            // Handle the "EXCLUDE" parameter as an array of values
            params[key] = value.split(',').map(str => str.replace('_', ' '));
        } else {
            // Store other parameters as simple key-value pairs
            params[key] = value;
        }
    });
    return params;
}

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

const checkAvailability = (bot, location, exclude) => {

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
                    
                    if (!exclude.includes(city)) {
                        const url = `https://www.passaportonline.poliziadistato.it/${href}`;
                        console.log(url)

                        const searchParams = new URLSearchParams(new URL(url).search);
                        const dataParam = searchParams.get('data');

                        if (dataParam && dataParam.trim() !== '') {
                            bot.sendMessage(telegramChatId, `There is an availability in : ${location} - ${city}. Book it now: ${url}`)
                                .then(() => console.log('Notification sent successfully'))
                                .catch((error) => console.error(`Error sending notification: ${error}`))
                        } else {
                            console.log('Il parametro "data" non è valorizzato');
                        }
                    }
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
    checkAvailability(bot, location, exclude);
}, waitTime * 100); // Convert seconds to milliseconds and repeat check every X seconds.