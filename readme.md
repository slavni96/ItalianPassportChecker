# Italian Passport AI Checker
Italian Passport AI Checker is an automated tool developed by (mostly) ChatGPT that checks the availability of appointments for Italian passport applications at local police stations. It uses REST APIs and Telegram notifications to keep users updated on the availability of appointments.

Telegram channel: [itpassportchecker](https://t.me/itpassportchecker)

## Requirements
- Node.js
- Telegram Bot Token

## Installation
Clone the repository to your local machine.
```
git clone https://github.com/<username>/italian-passport-ai-checker.git`
```

Install the required dependencies.
```
npm install
```

Create a .env file in the root directory of the project and add the following configuration.
```
LOCATION=PD
WAIT_TIME=60
ENABLE_NOTIFY=TRUE
TELEGRAM_BOT_TOKEN=<YOUR_TELEGRAM_BOT_TOKEN>
```

- LOCATION: Two letters province (e.g. VR, PD, MI)
- WAIT_TIME: Seconds between each request (seconds)
- ENABLE_NOTIFY: Choose if you want to be alerted (TRUE/FALSE) - Telegram bot will be used
- TELEGRAM_BOT_TOKEN: Your Telegram bot token

## Start the application.

```
npm start
```

## Usage
The application will run continuously and check for the availability of appointments at the specified province. If an appointment is available, it will notify you via Telegram bot. You can customize the province, waiting time, and notification settings in the .env file.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
MIT
