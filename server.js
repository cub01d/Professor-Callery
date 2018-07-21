const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const client = require('./src/client');
//const config = require('./config/secrets.json');
const SwitchRouter = require('./routes/switch');
const logger = require('./logger');
const config =
{
  "discord": {
    "token": process.env.DISCORD_TOKEN,
    "BOTID": process.env.DISCORD_BOTID
  },
  "mysql": {
    "host": process.env.MYSQL_HOST,
    "user": process.env.MYSQL_USER,
    "password": process.env.MYSQL_PASSWORD,
    "database": process.env.MYSQL_DB
  },
  "webhook": {
    "log": {
	  "id": process.env.WEBHOOK_ID,
	  "token": process.env.WEBHOOK_TOKEN
    }
  }
};

const { token } = config.discord;
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());


app.use('/switch', SwitchRouter);
client.login(token);


app.listen(PORT, () => {
	logger.info(`Listening on ${PORT}`);
});

process.on('unhandledRejection', function(reason, p) {
	logger.error(
		'Possibly Unhandled Rejection at: Promise ',
		p,
		' reason: ',
		reason
	);
});
