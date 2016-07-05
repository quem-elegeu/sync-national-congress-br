'use strict';
const jsdom = require('jsdom');
const $defaults = require('../defaults');

const bioInfo = require('../models/biography-info');

module.exports = (html, person = {}) => new Promise(resolve => {
    jsdom.env({
        html,
        src: [$defaults.jquery],
        done: function (err, window) {
            let $ = window.jQuery,
                content = $('#bioDeputado');

            bioInfo(content, person);
            resolve(person);
        }
    });
});
