'use strict';

const Discord = require('discord.js');
const regionsConfig = require('../config/regions.json');
const logger = require('../logger');
const secrets = (process.env.PC_USE_SECRETS_FILE) ?
    require('../config/secrets.json') :
    {
      "discord": {
        "token": process.env.PC_DISCORD_TOKEN,
        "BOTID": process.env.PC_DISCORD_BOTID
      },
      "mysql": {
        "host": process.env.PC_MYSQL_HOST,
        "user": process.env.PC_MYSQL_USER,
        "password": process.env.PC_MYSQL_PASSWORD,
        "database": process.env.PC_MYSQL_DB
      },
      "webhook": {
        "log": {
          "id": process.env.PC_WEBHOOK_ID,
          "token": process.env.PC_WEBHOOK_TOKEN
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
    egg2raid: (process.env.PC_EGG2RAID === 'true') ? true : false, // for legendary eggs
    currentT5Boss: 'registeel', // only valid if there is only 1 current t5 boss
    eggDurationMins: 45,

	BOTNAME: 'Professor Callery',
	BOTID: secrets.discord.BOTID,
	TEAMS: ['valor', 'instinct', 'mystic'],
	MONS: [
        'aerodactyl', 'anorith', 'aron',
        'bagon', 'beldum', 'blissey',
        'chansey', 'chimecho',
        'ditto', 'dratini', 'dragonite',
        'feebas',
        'girafarig', 'grimer',
        'hitmonchan', 'hitmonlee', 'hitmontop',
        'larvitar', 'lileep', 'lotad', 'lunatone',
        'machop', 'mareep', 'miltank',
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
        'absol',
        'charmander',
        'donphan',
        'exeggutor',
        'flareon',
        'houndoom',
        'kirlia',
        'machamp', 'magikarp', 'magmar', 'makuhita', 'marowak', 'mawile', 'meditite',
        'porygon',
        'raichu',
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
			.catch(err => logger.error({ event: `Error with webhook ${err.message}`}));
	} else {
		console.log(msg);
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
