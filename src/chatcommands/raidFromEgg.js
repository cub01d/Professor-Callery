// 'use strict';
//
// const pokemonInfo = require('../../data/pokemon.json');
// const CONSTANTS = require('./../constants');
// const {format_time, removeTags} = require('../utils');
//
// const usage = 'Command usage: **!raid boss minutesRemaining [exgym] location details**';
//
// const raidFromEgg = (data, message) => {
//     let reply = '';
//
//     const msgSplit = message.content.toLowerCase().split(' ');
//     if (!msgSplit || msgSplit.length < 4) {
//         reply = 'Sorry, incorrect format.\n'+usage;
//         message.channel.send(reply);
//         return reply;
//     }
//     let boss = CONSTANTS.standardizePokemonName(msgSplit[1].toLowerCase());
//
//     if (!pokemonInfo[boss.toUpperCase()]) {
//         reply = 'Sorry, boss not found. Please make sure to type the exact name of the raid boss and DO NOT USE THE @ tag.\n'+usage;
//         message.channel.send(reply);
//         return reply;
//     }
//
//     var bossTag = boss; //generate a tag for the boss to alert users
//
//     data.GUILD.roles.forEach((role) => {
//         if (role.name === boss){
//             bossTag = '<@&' + role.id + '>'; //if the boss name is found as a role, put in mention format
//         }
//         else if (boss.substring(0,3) === '<@&') {
//             if (role.id === boss.substring(3,boss.length-4)) { //if the user already mentioned the boss, strip the @ so as to not notify additionally
//                 bossTag = role.name;
//                 boss = role.name;
//             }
//         }
//     });
//
//     var legendaryTag = '';
//     if (CONSTANTS.LEGENDARYMONS.indexOf(boss) > -1) {
//         if (data.rolesByName['legendary']) {
//             legendaryTag = ' <@&' + data.rolesByName['legendary'].id + '> ';
//         } else {
//             legendaryTag = '';
//             console.warn('Please create a role called legendary.'); //eslint-disable-line
//         }
//     }
//
//     const channelName = message.channel.name;
//     const minutesLeft = parseInt(msgSplit[2]);
//     if (isNaN(minutesLeft) || minutesLeft < 1 || minutesLeft > 120) {
//         reply = 'Raid not processed, ensure minutes remaining is a integer between 1 and 120.\n'+usage;
//         message.channel.send(reply);
//         return reply;
//     }
//     var date = new Date(); //get today's date/time
//     date.setMinutes(date.getMinutes() + minutesLeft); //add minutes remaining to get end time
//
//     var twelveHrDate = format_time(date); //calc the friendly 12h date string for the UI
//
//     //clean the date variable into a UTC object compatible with mysql and discord. this may no longer be required
//     /*date = date.getUTCFullYear() + '-' +
//             ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
//             ('00' + date.getUTCDate()).slice(-2) + ' ' +
//             ('00' + date.getUTCHours()).slice(-2) + ':' +
//             ('00' + date.getUTCMinutes()).slice(-2) + ':' +
//             ('00' + date.getUTCSeconds()).slice(-2);
//     */
//
//     //'exgym' parameter checks and tag assignment
//     //  This will NOT detect @exgym in the parameter string. Must implement check/correct similar to boss, if desired.
//     var specialRaidTag = ""
//     const keyWord = msgSplit[3].toLowerCase() //get the fourth parameter to check for matching keyword
//     if (CONSTANTS.SPECIALRAIDS.indexOf(keyWord) > -1) {
//         if (data.rolesByName[keyWord]) {
//             specialRaidTag = ' <@&' + data.rolesByName[keyWord].id + '> ';
//         } else {
//             specialRaidTag = '';
//             console.warn('Please create a role called ' + keyword + '.'); //eslint-disable-line
//         }
//     }
//
//     // TODO: auto shiny tag db lookup
//     if (message.content.indexOf('shiny') > -1) {
//         data.GUILD.roles.forEach((role) => {
//             //if (role.name === 'shinycheck') specialRaidTag += ' <@&' + role.id + '> ' + data.getEmoji('sparkles');
//             if (role.name === 'shinycheck') specialRaidTag += ' <@&' + role.id + '> ✨';
//         });
//     }
//
//     //location information of raid
//     var keyWordLength = 0
//     if (specialRaidTag !== "") {
//         keyWordLength = keyWord.length + 1;
//     }
//     var detail = message.content.substring(message.content.indexOf(minutesLeft.toString()) + minutesLeft.toString().length + 1 + keyWordLength);
//     detail = removeTags(detail).replace('\'', '\'\''); //sanitize html and format for insertion into sql;
//     if (!detail) {
//         reply = 'Raid not processed, no location details. Use format: **!raid boss minutesRemaining [sponsored] [park] location details**';
//         message.channel.send(reply);
//         return reply;
//     }
//     if (detail.length > 255) {
//         detail = detail.substring(0,255);
//     }
//
//     //var sql = 'INSERT INTO raids (boss, channel, endTime, detail) VALUES (\'' + boss + '\', \'' + channelId + '\', \'' + date.toString() + '\', \'' + detail + '\');';
//     //console.log(sql); //currently logging all sql to the console for testing purposes
//     /* not connecting to the database for now
//     db.query(sql, function(err, result) {
//         if (err) {
//             console.log(err + '\n' + sql);
//             } else {
//             message.channel.send('Processed Raid #' + result.insertId + ' as ' + bossTag + ' (ending: ' + twelveHrDate + ') at ' + detail + ' added by ' + message.member.displayName);
//         }
//     });
//     */
//     reply = bossTag + legendaryTag + ' raid reported to ' + data.channelsByName['gymraids_alerts'] + ' (ending: ' + twelveHrDate + ') at ' +
//         detail + specialRaidTag + ' added by ' + message.member.displayName;
//     message.channel.send(reply);
//
//
//     // forward alert to other channels if message is not testing
//     if (channelName !== CONSTANTS.TESTING_CHANNEL) {
//         let forwardReply = '- **' + boss.toUpperCase() + '** ' + data.getEmoji(boss) + ' raid reported in ' + data.channelsByName[channelName] + ' ending at ' + twelveHrDate + ' at ' + detail;
//         //send alert to #gymraids_alerts channel
//         if (data.channelsByName['gymraids_alerts']) {
//             data.channelsByName['gymraids_alerts'].send(forwardReply);
//         } else {
//             console.warn('Please add a channel called #gymraids_alerts');
//         }
//
//         //send alert to regional alert channel
//         message.channel.permissionOverwrites.forEach((role) => {
//             if (role.type !== 'role') return;
//
//             var roleName = data.GUILD.roles.get(role.id).name;
//             // todo : get rid of SF reference
//             if (CONSTANTS.REGIONS.indexOf(roleName) > -1 && roleName !== 'sf' && roleName !== 'allregions') {
//                 if (data.channelsByName['gymraids_' + roleName]) {
//                     data.channelsByName['gymraids_' + roleName].send(forwardReply);
//                 } else {
//                     console.warn('Please add the channel gymraids_' + roleName);
//                 }
//             }
//         });
//     }
//
//     return reply;
// };
//
// /*  else if (message.content.substring(0,8) == '!raidegg') {
//  if (message.channel.id == CHANNEL_IDS['#gymraids-alerts'] || message.channel.id == CHANNEL_IDS['#gymraids-meetups']) {
//  message.channel.send(message.member.displayName + ', raid commands should only be run in the corresponding neighborhood channel');
//  return;
//  }
//  const tier = message.content.split(' ')[1];
//  var tierNum = parseInt(tier);
//  if (isNaN(tierNum)) {
//  message.channel.send('Raid not processed, use format: !raidegg [tierNumber] [minutesUntilHatch] [location details]');
//  return;
//  }
//
//  const channelId = message.channel.id;
//  const minutesToStart = parseInt(message.content.split(' ')[2]);
//  if (isNaN(minutesToStart)) {
//  message.channel.send('Raid not processed, use format: !raidegg [tierNumber] [minutesUntilHatch] [location details]');
//  return;
//  }
//  var date = new Date(); //get today's date/time
//  date.setMinutes(date.getMinutes() + minutesToStart); //add minutes until start of raid to get start time
//
//  var twelveHrDate = format_time(date); //format into a friendly 12h date format for the UI
//
//  //may not be required, format date for mysql/discord
//  date = date.getUTCFullYear() + '-' +
//  ('00' + (date.getUTCMonth() + 1)).slice(-2) + '-' +
//  ('00' + date.getUTCDate()).slice(-2) + ' ' +
//  ('00' + date.getUTCHours()).slice(-2) + ':' +
//  ('00' + date.getUTCMinutes()).slice(-2) + ':' +
//  ('00' + date.getUTCSeconds()).slice(-2);
//
//  //location information of pokemon raid
//  var detail = message.content.substring(message.content.indexOf(minutesToStart.toString()) + minutesToStart.toString().length + 1);
//  detail = removeTags(detail).replace('\'', '\'\''); //sanitize html and format for insertion into sql
//  if (detail == null || detail == '') {
//  message.channel.send('Raid not processed: use format: !raidegg [tierNumber] [minutesUntilHatch] [location details]');
//  return;
//  }
//  if (detail.length > 255) {
//  detail = detail.substring(0,255);
//  }
//  var sql = 'INSERT INTO raids (tier, boss, channel, endTime, detail) VALUES (\'' + tier + '\', \'egg\', \'' + channelId + '\', \'' + date.toString() + '\', \'' + detail + '\');';
//  //console.log(sql); //currently logging all sql to the console for testing purposes
//  /* pausing database activity for now
//  db.query(sql, function(err, result) {
//  if (err) {
//  console.log(err + '\n' + sql);
//
//  } else {
//  message.channel.send('Processed Unhatched Raid #' + result.insertId + ' as Tier ' + tier + ' (cracking: ' + twelveHrDate + ') at ' + detail + ' added by ' + message.member.displayName);
//  }
//
//  });
//
//  message.channel.send('Unhatched Raid reported to ' + client.channels.get(CHANNEL_IDS['#gymraids-alerts']) + ' as Tier ' + tier + ' (cracking: ' + twelveHrDate + ') at ' + detail + ' added by ' + message.member.displayName);
//  //send alert to #gymraids-alerts channel
//  client.channels.get(CHANNEL_IDS['#gymraids-alerts']).send('- ***Tier ' + tier + ' egg*** reported in ' + client.channels.get(channelId) + ' cracking at ' + twelveHrDate + ' at ' + detail);
//  return;
//  }*/
//
// module.exports = (data) => ( (message) => {
//     return raid(data, message);
// });
