const request = require('request');
require('dotenv').config();

const location = process.env.LOCATION;
const waitTime = process.env.WAIT_TIME;
const enableNotify = process.env.ENABLE_NOTIFY;

const getRandomGUID = () => {
    // Function to generate random GUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

const checkAvailability = () => {
    const options = {
        url: https://www.passaportonline.poliziadistato.it/CittadinoAction.do?codop=resultRicercaRegistiProvincia&provincia=${location},
        headers: {
            Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,/;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'it-IT,it;q=0.9',
            Connection: 'keep-alive',
            Host: 'gzip, deflate, br',
            'Cache-Control': 'max-age=0',
            'Upgrade-Insecure-Requests': '1',
            'Content-Type': 'application/json',
            'User-Agent': getRandomGUID(),
        },
    };

    request.get(options, (error, response, body) => {
        if (!error && response.statusCode == 200) {
            if (body.includes('<td headers="disponibilita">Si</td>')) {
                const htmlTable = body.substring(
                    body.indexOf('<td headers="disponibilita">Si</td>'),
                    body.indexOf('<td headers="disponibilita">Si</td>') + 500
                );
                const href = htmlTable.substring(
                    htmlTable.indexOf('selezionaStruttura'),
                    htmlTable.indexOf('">')
                );
                const hrefUrl = https://www.passaportonline.poliziadistato.it/${href};

                const optionsHref = {
                    url: hrefUrl,
                    headers: {
                        Accept:
                            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'Accept-Language': 'it-IT,it;q=0.9',
                        Connection: 'keep-alive',
                        Host: 'gzip, deflate, br',
                        'Cache-Control': 'max-age=0',
                        'Upgrade-Insecure-Requests': '1',
                        'Content-Type': 'application/json',
                        'User-Agent': getRandomGUID(),
                    },
                };

                request.get(optionsHref, (error, response, body) => {
                    if (!error && response.statusCode == 200) {
                        // Do something with the response
                        if (enableNotify) {
                            // Send notification via Telegram bot
                        }
                    } else {
                        console.log(`Error: ${error}`);
                    }
                });
            } else {
                console.log(`No availability in ${location}`);
            }
        } else {
            console.log(`Error: ${error}`);
        }

    });
};

setInterval(() => {
    checkAvailability();
}, waitTime * 1000); // Convert seconds to milliseconds and repeat check every X seconds.