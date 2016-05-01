'use strict';
const jsdom = require('jsdom');
const $defaults = require('../defaults');

module.exports = (html, person) => new Promise(resolve => {
    if (!person) person = {};
    jsdom.env({
        html,
        src: [$defaults.jquery],
        done: function (err, window) {
            let $ = window.jQuery,
                content = $('#content');

            $('.clearedBox', content).each(function (i) {
                let elem = $(this);
                if (i == 0) {
                    person.image = elem.find('.image-left').attr('src');
                    let lis = elem.find('.visualNoMarker li');
                    lis.each(function (i) {
                        let elem = $(this),
                            txt = elem.text().split(':'),
                            val = txt[1];
                        if (i == 0) {
                            person.fullName = val.trim();
                        } else if (i == 1) {
                            person.birthday = val.trim();
                        } else if (i == 5) {
                            person.links.biography = elem.find('a').attr('href');
                        } else if (i == 6) {
                            person.links.talkTo = elem.find('a').attr('href');
                        }
                    });
                }
            });
            resolve(person);
        }
    });
});
