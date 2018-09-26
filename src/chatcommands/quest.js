'use strict';

const CONSTANTS = require('./../constants');

const removeTags = (html) => {
    var oldHtml;
    do {
        oldHtml = html;
        html = html.replace(CONSTANTS.tagOrComment, '');
    } while (html !== oldHtml);
    return html.replace(/</g, '&lt;');
};

const quest = (data, message) => {
    let reply = '';

    let inNeighborhood = false;
    let usage = 'Command usage: **!quest reward [tags] task location** *(rewards: tm, pokemon/wild (if not sure), rarecandy)';

    const channelName = message.channel.name;
    const msgSplit = message.content.toLowerCase().split(' ');
    if (!msgSplit || msgSplit.length < 3) {
        reply = 'Sorry, incorrect format.\n'+usage;
        message.channel.send(reply);
        return reply;
    }

    let detail = message.content.substring(message.content.indexOf(' ')+1);

    detail = removeTags(detail).replace('\'', '\'\''); //sanitize html and format for insertion into sql;
    if (!detail) {
        reply = 'Quest report not processed, not enough information.\n'+usage;
        message.channel.send(reply);
        return reply;
    }

    // add whitespace at the end to make sure reward string not in description
    // ex: !quest chansey industrial building => dust => stardust
    let reward = msgSplit[1].toLowerCase();
    let tms = ['chargetm','fasttm', 'tm', 'charge', 'fast'];
    if (message.content.indexOf('rare cand') > -1 || message.content.indexOf('rarecand') > -1 || reward === 'rc' || reward === '1rc' || reward === '3rc') {
        reward = 'rarecandy';
    }
    else if (tms.indexOf(reward) > -1) {
        reward = 'tm';
    }
    else if (message.content.indexOf('stardust') > -1 || message.content.indexOf('dust ') > -1) {
        reward = 'stardust';
    }
    else if (message.content.indexOf('silverpinap') > -1 || message.content.indexOf('silver p') > -1) {
        reward = 'silverpinap';
    }
    var rewardTag = reward; //generate a tag for the pokemon to alert users

    data.GUILD.roles.forEach((role) => {
        if (role.name === reward) rewardTag = '<@&' + role.id + '>'; //if the reward name is found as a role, put in mention format
    });

    //check to see if the message contains a mention of 'shiny'
    if (message.content.indexOf('shiny') > -1) {
        data.GUILD.roles.forEach((role) => {
            //if (role.name === 'shinycheck') rewardTag += ' <@&' + role.id + '> ' + data.getEmoji(':sparkles:');
            if (role.name === 'shinycheck') rewardTag += ' <@&' + role.id + '> ✨'; //require a role called shinycheck
        });
    }


    if (detail.length > 255) {
        detail = detail.substring(0,255);
    }

    reply = '**QUEST ' + rewardTag.toUpperCase() + '** ' + data.getEmoji(reward) + '\nDetails: ' + detail + ' added by ' + message.member.displayName;
    message.channel.send(reply);

    // forward alert to other channels if not in testing
    if (channelName !== CONSTANTS.TESTING_CHANNEL) {
        let forwardReply = '- **' + rewardTag.toUpperCase() + '** ' + data.getEmoji(reward) + ' reported in ' + data.channelsByName[channelName] + ' at ' + detail;

        message.channel.permissionOverwrites.forEach((role) => {
            if (role.type !== 'role') return;

            var roleName = data.GUILD.roles.get(role.id).name;
            // todo : get rid of SF reference
            if (CONSTANTS.REGIONS.indexOf(roleName) > -1 && roleName !== 'sf' && roleName !== 'allregions') {
                if (data.channelsByName['quests_' + roleName]) {
                    data.channelsByName['quests_' + roleName].send(forwardReply);
                } else {
                    console.warn('Please add the channel quests_' + roleName);
                }
            }
        });

        if(!data.channelsByName['quests_alerts'])
            console.log('Please create a channel called quests_alerts to allow the !quest function to work');
        else if (channelName !== 'quests_alerts') {
            data.channelsByName['quests_alerts'].send(forwardReply);
        }
    }
    return reply;
};

module.exports = (data) => ( (message) => {
    return quest(data, message);
});
