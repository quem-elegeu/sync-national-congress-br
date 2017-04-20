'use strict';
const jsdom = require('jsdom');
const $defaults = require('../../utils/defaults');

module.exports = (html, person) => new Promise(resolve => {
    jsdom.env({
        html,
        src: [$defaults.jquery],
        done: function (err, window) {
            let $ = window.jQuery,
                content = $('div.dadosPessoais');

            let list = content.find('dl.dl-horizontal dd');
            list.each(function(i) {
                let elem = $(this);
                if (i === 0) {
                    person.fullName = elem.text().trim();
                }
            });

            resolve(person);
        }
    });
});
