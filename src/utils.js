'use strict';
const CONSTANTS = require('./constants');

//Format a date object as a string in 12 hour format
const format_time = (date_obj) => {
    // formats a javascript Date object into a 12h AM/PM time string
    var hour = date_obj.getHours();
    var minute = date_obj.getMinutes();
    const amPM = (hour > 11) ? 'pm' : 'am';
    if(hour > 12) {
        hour -= 12;
    } else if(hour === 0) {
        hour = '12';
    }
    if(minute < 10) {
        minute = '0' + minute;
    }
    return hour + ':' + minute + amPM;
};

const removeTags = (html) => {
    var oldHtml;
    do {
        oldHtml = html;
        html = html.replace(CONSTANTS.tagOrComment, '');
    } while (html !== oldHtml);
    return html.replace(/</g, '&lt;');
};


module.exports = {format_time: format_time, removeTags: removeTags};
