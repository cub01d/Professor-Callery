const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const client = require('./src/client');
const SwitchRouter = require('./routes/switch');
const logger = require('./logger');
const http = require('http');

const config = (process.env.USE_SECRETS_FILE) ?
    require('./config/secrets.json') :
    {
      'discord': {
        'token': process.env.DISCORD_TOKEN,
        'BOTID': process.env.DISCORD_BOTID
      },
      'mysql': {
        'host': process.env.MYSQL_HOST,
        'user': process.env.MYSQL_USER,
        'password': process.env.MYSQL_PASSWORD,
        'database': process.env.MYSQL_DB
      },
      'webhook': {
        'log': {
          'id': process.env.WEBHOOK_ID,
          'token': process.env.WEBHOOK_TOKEN
        }
      },
      'server': {
          'webroot': process.env.WEBAPP_ROOT
      }
    };

const token = config.discord.token;
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());

app.use('/switch', SwitchRouter);
app.get('/', function(req, res) {
    var date = new Date(null);
    date.setSeconds(process.uptime()); // specify value for SECONDS here
    var result = date.toISOString().substr(11, 8);
    res.send(result);
});

if (token)
    client.login(token);
else
    console.log('Token is not defined.');

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

process.on("SIGTERM", function () {
    logger.info('Received SIGTERM, shutting down...');
    process.exit(0);
});
