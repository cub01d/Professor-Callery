'use strict';

// const mySQL = require('mysql');

const client = require('./src/client');
const config = (process.env.USE_SECRETS_FILE === "true") ?
    require('./config/secrets.json') :
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

const token = config.discord.token;
/* const db = mySQL.createConnection(config.mysql);
// let's not connect to the database for now
db.connect((err) => {
	if (err) throw err;
	console.log('Database Connected!');
}); */

client.login(token);
