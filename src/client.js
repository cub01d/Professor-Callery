'use strict';

const Discord = require('discord.js');

const chatCommandsFunc = require('./chatrouter');
const CONSTANTS = require('./constants');
const logger = require('../logger');
const client = new Discord.Client();

const rolesByName = {};
const emojisByName = {};
const channelsByName = {};
var CHATCOMMANDS;
var GUILD;

// ** Helper functions: **
const getEmoji = (pokemon) => {
    var emoji = pokemon;
    if (pokemon === 'ho-oh') {
        emoji = 'hooh'; // special case for ho-oh
    }
    if (emojisByName[emoji]) {
        return '<:' + emoji + ':' + emojisByName[emoji].id + '>';
    }
    return '';
};

const logUserMessage = (message) => {
    if (message.member)
        logger.info({ event: `${message.member.displayName} said ${message.content} in ${message.channel.name}` });
    else
        logger.info({ event: `${message.author.username} said ${message.content} in ${message.channel.name}` });
};

client.on('ready', (done) => {
    logger.info({ event: 'Ready!' });
    client.channels.forEach((channel) => {
        channelsByName[channel.name] = channel;
    });

    // TODO : for the current design of the bot this is always a singleton
    client.guilds.forEach((guild) => {
        GUILD = guild;
    });

    if (GUILD) {
        GUILD.roles.forEach((role) => {
            rolesByName[role.name] = role;
        });
        GUILD.emojis.forEach((emoji) => {
            emojisByName[emoji.name] = emoji;
        });
    }

    CHATCOMMANDS = chatCommandsFunc({
        GUILD,
        rolesByName,
        channelsByName,
        getEmoji,
    });

    if (done) {
        done();
    } else {
        logger.info('Asynchronous data loaded!');
    }
});

client.on('message', (message, cb) => {
    if (!cb) cb = data => {return data};

    // no action on my own message
    if ((message.member && message.member.id === CONSTANTS.BOTID) ||
        (message.author && message.author.id === CONSTANTS.BOTID)) return;

    if (message.channel.type === 'dm' || message.channel.type === 'group') {
        message.channel.send('I currently have no direct message functions. Please go to channel #' + CONSTANTS.DEFAULT_CHANNEL + '.');
        return;
    }

    let reply = '';
    const command = message.content.split(' ')[0].toLowerCase();
    // replace any multiple spaces with a single space
    while (message.content.indexOf('  ') > -1) {message.content = message.content.replace('  ', ' ');}

    // remove support for play command
    //if (message.member && command !== '!play') {CHATCOMMANDS.checkNew(message);}
    if (message.member) CHATCOMMANDS.checkNew(message);

    // yell at non-privileged user if they misuse a tag
    CHATCOMMANDS.mod(message);

    if (message.content[0] !== '!') {
        return;
    }

    //Outside of Professor Callery Channel, Message.member has NOT been null checked yet
    if (command === '!raid' || command === '!egg' || command === '!wild' || command === '!quest') {
        if (message.channel.name.indexOf('-') === -1) {
            reply = message.member.displayName + ', raid/egg/wild/quest commands should only be run in the corresponding neighborhood channel';
            message.channel.send(reply);
            return reply;
        }

        // handle command
        logUserMessage(message);

        switch (command) {
            case '!raid':
                return cb(CHATCOMMANDS.raid(message));
            case '!egg':
                return cb(CHATCOMMANDS.egg(message));
            case '!wild':
                return cb(CHATCOMMANDS.wild(message));
            case '!quest':
                return cb(CHATCOMMANDS.quest(message));
        }
    }
    //Inside Professor Callery Channel, Do not touch message.member
    else if (message.channel.name !== CONSTANTS.COMMAND_CHANNEL) {
        if (message.channel.name.indexOf('-') > 0) //neighborhood channel
            message.channel.send(message.member.displayName + ', I don\'t recognize your entry in this channel\n' +
                'For raids, use **!raid boss timeLeft location**\n' +
                'For eggs, use **!egg tierNumber timeLeft location**\n' +
                'For quests, use **!quest reward task location**\n' +
                'For wild spawns, use **!wild pokemonName location**\n' +
                'For everything else, go to ' + channelsByName[CONSTANTS.COMMAND_CHANNEL] + ' channel and type **!help**');
        else
            message.channel.send(message.member.displayName + ', I don\'t recognize your entry, you need to be in the channel for bot commands. Please click here: ' +
                channelsByName[CONSTANTS.COMMAND_CHANNEL] + ' and type **!help**')
        return;
    }

    // handle commmand
    logUserMessage(message);

    switch(command) {
        case '!breakpoint':
        case '!bp':
            return cb(CHATCOMMANDS.breakpoint(message));
        case '!cp':
            return cb(CHATCOMMANDS.cp(message));
        case '!counter':
        case '!counters':
            return cb(CHATCOMMANDS.counters(message));
        case '!help':
            return cb(CHATCOMMANDS.help(message));
        case '!reset':
            return cb(CHATCOMMANDS.reset(message));
    }

    //Inside Professor Callery Channel, OK to touch message.member
    if (reply === '' && !message.member) {
        message.channel.send('Member is invisible - Commands cannot be run for users who are invisible, please remove your invisible status');
        return;
    }

    const errorMessage = 'Command not found: ' + command;
    logger.info({ event: `${command} was not understood `});
    CONSTANTS.log(errorMessage);
    return cb(errorMessage);
});

module.exports = client;
