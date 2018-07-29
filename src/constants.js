'use strict';

const Discord = require('discord.js');

const regionsConfig = require('../config/regions.json');
const logger = require('../logger');
const secrets = (process.env.USE_SECRETS_FILE) ?
    require('../config/secrets.json') :
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

String.prototype.capitalize = function () {
	return this.charAt(0).toUpperCase() + this.slice(1);
};

const alphanumeric = (inputtxt) => {
	var letterNumber = /^[0-9a-zA-Z]+$/;
	return (inputtxt.value && inputtxt.value.match(letterNumber));
};

//Function and vars for sanitizing input
const tagBody = '(?:[^"\'>]|"[^"]*"|\'[^\']*\')*';

const tagOrComment = new RegExp(
	'<(?:'
	// Comment body.
	+ '!--(?:(?:-*[^->])*--+|-?)'
	// Special "raw text" elements whose content should be elided.
	+ '|script\\b' + tagBody + '>[\\s\\S]*?</script\\s*'
	+ '|style\\b' + tagBody + '>[\\s\\S]*?</style\\s*'
	// Regular name
	+ '|/?[a-z]'
	+ tagBody
	+ ')>',
	'gi');

const data = {
	BOTNAME: 'Professor Callery',
	BOTID: secrets.discord.BOTID,
	TEAMS: ['valor', 'instinct', 'mystic'],
	MONS: [
        'aerodactyl', 'anorith',
        'bagon', 'beldum',
        'chansey', 'chimecho',
        'ditto', 'dratini', 'dragonair', 'dragonite',
        'feebas',
        'girafarig',
        'hitmonchan', 'hitmonlee', 'hitmontop',
        'larvitar', 'lileep', 'lotad', 'lunatone',
        'mareep', 'miltank',
        'onix',
        'porygon',
        'ralts',
        'scyther', 'slakoth',
        'tauros', 'togetic', 'trapinch',
        'unown',
		'wailmer'
    ],
	EGGTIERS: ['tier3', 'tier4', 'tier5'],
	RAIDMONS: [
        'absol', 'aexeggutor', 'amarowak', 'araichu',
        'charmander',
        'donphan',
        'flareon',
        'houndoom',
        'kirlia',
        'machamp', 'magikarp', 'magmar',  'makuhita', 'mawile', 'meditite',
        'porygon',
        'tyranitar',
    ],
	LEGENDARYMONS: ['legendary',
        'articuno', 'zapdos', 'moltres', 'mew', 'mewtwo',
        'lugia', 'ho-oh', 'celebi', 'raikou', 'entei', 'suicune',
        'regirock', 'regice', 'registeel', 'latias', 'latios', 'kyogre', 'groudon', 'rayquaza', 'jirachi', 'deoxys'
    ],
	SPECIALMONS: ['highiv', 'finalevo'],
	SPECIALRAIDS: ['exgym'],
	QUESTREWARDS: ['golden-razz', 'rarecandy', 'shinycheck', 'stardust', 'technical_machine'],
	REGIONS: regionsConfig.regions,
	COMMON_MISSPELLINGS: {
        'raichu':'araichu',
        'aexeggutor':'exeggutor',
		'hooh': 'ho-oh',
		'milktank': 'miltank',
		'ttar': 'tyranitar',
		'unknown': 'unown',
		'raiku': 'raikou',
		'chancey': 'chansey',
		'tyrannitar': 'tyranitar',
		'slakoff': 'slakoth',
		'tm': 'technical_machine',
		'chargetm': 'technical_machine',
		'fasttm': 'technical_machine',
		'grazz': 'golden-razz'
	},
	NSFW_WORDS: [' fuck ', ' fucking ', ' fuckin ', ' shit ', ' shitty '],
    DEFAULT_CHANNEL: 'start_here',
    COMMAND_CHANNEL: 'professor_callery',
    ANNOUNCEMENT_CHANNEL: 'announcements',
	PROTECTED_CHANNELS: [this.DEFAULT_CHANNEL, this.COMMAND_CHANNEL, this.ANNOUCEMENT_CHANNEL], // todo : move to a config file
	PROTECTED_ROLES: ['admin', 'mod', 'dev', 'VIP', '@everyone', 'timeout_inthecorner'], // todo : move to a config file
	PRIVILEGED_ROLES: ['admin', 'mod'],
};

const webhook = secrets.webhook.log.token ? new Discord.WebhookClient(secrets.webhook.log.id, secrets.webhook.log.token) : null;
data.log = (msg) => {
	if (webhook) {
		webhook.send(msg)
			.then()
			.catch(err => logger.error({ event: `Error with webhook ${err.message}`})); // eslint-disable-line
	} else {
		console.log(msg); // eslint-disable-line
	}
};

//make this more elegant when we have more than one
data.standardizePokemonName = (name) => {
	name = name.toLowerCase();
	if (data.COMMON_MISSPELLINGS[name]) {
		name = data.COMMON_MISSPELLINGS[name];
	}
	return name;
};


module.exports = data;
