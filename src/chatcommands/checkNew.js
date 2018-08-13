'use strict';

const CONSTANTS = require('./../constants');


const checkNew = (data, message) => {
    let reply = '';
    let grantAll = true;

    if (message.member.roles) {
        message.member.roles.forEach( (role) => {
            if (grantAll && CONSTANTS.REGIONS.indexOf(role.name) !== -1) {
                grantAll = false;
            }
        });
    }

    if (grantAll) {
        message.member.addRole(data.rolesByName['allregions']);
        message.member.addRole(data.rolesByName['unverified']);
        reply = 'Welcome ' + message.member.displayName + ' - Please read discord rules and learn bot commands in ' + data.channelsByName[CONSTANTS.DEFAULT_CHANNEL] + ' before doing anything. Run bot commands in ' + data.channelsByName[CONSTANTS.COMMAND_CHANNEL]  + ' and type **!help** for more information.'; message.channel.send(reply);
    }

    return reply;
};

module.exports = (data) => ( (message) => {
    return checkNew(data, message);
});
