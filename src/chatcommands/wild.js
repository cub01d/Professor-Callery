'use strict';

const pokemonInfo = require('../../data/pokemon.json');
const CONSTANTS = require('./../constants');

const removeTags = (html) => {
    var oldHtml;
    do {
        oldHtml = html;
        html = html.replace(CONSTANTS.tagOrComment, '');
    } while (html !== oldHtml);
    return html.replace(/</g, '&lt;');
};

const wild = (data, message) => {
    let reply = '';

    let inNeighborhood = false;
    let usage = 'Command usage: **!wild pokemonName [tags] location details**';

    const msgSplit = message.content.toLowerCase().split(' ');
    if (!msgSplit || msgSplit.length < 3) {
        reply = 'Sorry, incorrect format.\n'+usage;
        message.channel.send(reply);
        return reply;
    }
    let pokemonName = CONSTANTS.standardizePokemonName(msgSplit[1].toLowerCase());

    if (!pokemonInfo[pokemonName.toUpperCase()]) {
        reply = 'Sorry, pokemon not found. Please make sure to type the exact name of the pokemon and DO NOT USE THE @ tag.\n'+usage;
        message.channel.send(reply);
        return reply;
    }

    var pokemonTag = pokemonName; //generate a tag for the pokemon to alert users

    data.GUILD.roles.forEach((role) => {
        if (role.name === pokemonName) pokemonTag = '<@&' + role.id + '>'; //if the pokemon name is found as a role, put in mention format
    });

    let detail = message.content.substring(message.content.indexOf(' ',message.content.indexOf(' ') +1)+1);

    detail = removeTags(detail).replace('\'', '\'\''); //sanitize html and format for insertion into sql;
    if (!detail) {
        reply = 'Wild sighting not processed, no location details.\n'+usage;
        message.channel.send(reply);
        return reply
    }
    if (detail.length > 255) {
        detail = detail.substring(0,255);
    }

    // handle special tags
    if (message.content.indexOf('shiny') > -1) {
        data.GUILD.roles.forEach((role) => {
            //if (role.name === 'shinycheck') detail += ' <@&' + role.id + '> ' + data.getEmoji('sparkles');
            if (role.name === 'shinycheck') detail += ' <@&' + role.id + '> ✨';
        });
    }
    if (message.content.indexOf('finalevo') > -1) {
        data.GUILD.roles.forEach((role) => {
            if (role.name === 'finalevo') detail += ' <@&' + role.id + '> ';
        });
    }
    if (message.content.indexOf('highiv') > -1) {
        data.GUILD.roles.forEach((role) => {
            if (role.name === 'highiv') detail += ' <@&' + role.id + '> ';
        });
    }

    reply = 'Wild **' + pokemonTag.toUpperCase() + '** ' + data.getEmoji(pokemonName) + ' at ' + detail + ' added by ' + message.member.displayName;
    message.channel.send(reply);

    // forward alert only if not testing
    if (message.channel.name !== CONSTANTS.TESTING_CHANNEL) {
        let forwardReply = '- **' + pokemonName.toUpperCase() + '** ' + data.getEmoji(pokemonName) + ' reported in the wild in ' + data.channelsByName[message.channel.name] + ' at ' + detail;

        if (message.channel.name !== CONSTANTS.DEX_CHANNEL) {
            data.channelsByName[CONSTANTS.DEX_CHANNEL].send(forwardReply);
        }
    }
    return reply;
};

module.exports = (data) => ( (message) => {
    return wild(data, message);
});
