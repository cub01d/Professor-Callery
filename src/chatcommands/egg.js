'use strict';

const CONSTANTS = require('./../constants');
const {format_time, removeTags} = require('../utils');

const usage = 'Command usage: **!egg tier# minutesLeft [exgym] location details**';


const egg = (data, message, raidcb) => {
    let reply = '';

    const msgSplit = message.content.toLowerCase().split(' ');
    if (!msgSplit || msgSplit.length < 4) {
        reply = 'Sorry, incorrect format.\n'+usage;
        message.channel.send(reply);
        return reply;
    }

    const tier = parseInt(msgSplit[1]);

    if (isNaN(tier) || tier < 1 || tier > 5) {
        reply = 'Sorry incorrect format. Ensure tier is a number between 1 and 5, use format:\n' + usage;
        message.channel.send(reply);
        return;
    }

    let tierEmoji = '';
    var eggTag = 'Tier ' + tier;
    if (tier == 5) {
        tierEmoji = 'legendaryraid';
        eggTag = ' <@&' + data.rolesByName['tier5'].id + '> ';
    }
    else if (tier > 2) {
        tierEmoji = 'rareraid';
        if(tier == 3) eggTag = ' <@&' + data.rolesByName['tier3'].id + '> ';
        if(tier == 4) eggTag = ' <@&' + data.rolesByName['tier4'].id + '> ';
    }
    else tierEmoji = 'normalraid';

    const channelName = message.channel.name;
    const minutesLeft = parseInt(msgSplit[2]);
    if (isNaN(minutesLeft) || minutesLeft < 1 || minutesLeft > 120) {
        reply = 'Raid not processed, ensure minutes remaining is a integer between 1 and 120.\n'+usage;
        message.channel.send(reply);
        return reply;
    }
    var date = new Date(); //get today's date/time
    date.setMinutes(date.getMinutes() + minutesLeft); //add minutes remaining to get end time

    var twelveHrDate = format_time(date); //calc the friendly 12h date string for the UI

    //'exgym' parameter checks and tag assignment
    //  This will NOT detect @exgym in the parameter string. Must implement check/correct similar to boss, if desired.
    var specialRaidTag = ""
    const keyWord = msgSplit[3].toLowerCase() //get the fourth parameter to check for matching keyword
    if (CONSTANTS.SPECIALRAIDS.indexOf(keyWord) > -1) {
        if (data.rolesByName[keyWord]) {
            specialRaidTag = ' <@&' + data.rolesByName[keyWord].id + '> ';
        } else {        //create keyWordtag
            specialRaidTag = '';
            console.warn('Please create a role called ' + keyword + '.'); //eslint-disable-line
        }
    }

    //location information of raid
    var keyWordLength = 0
    if (specialRaidTag !== "") {
        keyWordLength = keyWord.length + 1;
    }
    var detail = message.content.substring(message.content.indexOf(minutesLeft.toString()) + minutesLeft.toString().length + 1 + keyWordLength);
    detail = removeTags(detail).replace('\'', '\'\''); //sanitize html and format for insertion into sql;
    if (!detail) {
        reply = 'Raid not processed, no location details. Use format:\n'+usage;
        message.channel.send(reply);
        return reply;
    }
    if (detail.length > 255) {
        detail = detail.substring(0,255);
    }

    reply = eggTag + ' raid egg reported to ' + data.channelsByName['gymraids_alerts'] + ' (hatching: ' + twelveHrDate + ') at ' +
        detail + specialRaidTag + ' added by ' + message.member.displayName;
    message.channel.send(reply);
    let forwardReply = '- **Tier ' + tier + '** ' + data.getEmoji(tierEmoji) + ' egg reported in ' + data.channelsByName[channelName] + ' hatching at ' + twelveHrDate + ' at ' + detail;
    //send alert to #gymraids_alerts channel
    if (data.channelsByName['gymraids_alerts']) {
        data.channelsByName['gymraids_alerts'].send(forwardReply);
    } else {
        console.warn('Please add a channel called #gymraids_alerts');
    }

    //send alert to regional alert channel
    message.channel.permissionOverwrites.forEach((role) => {
        if (role.type !== 'role') return;

        var roleName = data.GUILD.roles.get(role.id).name;
        // todo : get rid of SF reference
        if (CONSTANTS.REGIONS.indexOf(roleName) > -1 && roleName !== 'allregions') {
            if (data.channelsByName['gymraids_' + roleName]) {
                data.channelsByName['gymraids_' + roleName].send(forwardReply);
            } else {
                console.warn('Please add the channel gymraids_' + roleName);
            }
        }
    });

    // if we haven't returned an error message yet
    if(tier == 5) {
        const details = msgSplit.slice(3).join(' ');
        const raidmsg = '!raid '+ CONSTANTS.currentT5Boss + ' ' + CONSTANTS.eggDurationMins + ' ' + details;

        // TODO remove after debug
        console.log("running raid command\n\t" + raidmsg + "\nin " + minutesLeft + " minutes!");
        if (raidcb)
            setTimeout(raidcb(raidmsg), minutesLeft*60*1000);
        else
            console.log("raid command is undefined");


    }
    return reply;
};

module.exports = (data) => ( (message) => {
    return egg(data, message);
});

// module.exports = (data, callback) => (callback) => ( (message) => {
//     return egg(data, message, callback);
// });
