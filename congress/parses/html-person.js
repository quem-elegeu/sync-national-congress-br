'use strict';
const jsdom = require('jsdom');
const $defaults = require('../../utils/defaults');

module.exports = (html, person = {}) => new Promise(resolve => {
    jsdom.env({
        html,
        src: [$defaults.jquery],
        done: function (err, window) {
            let $ = window.jQuery,
                content = $('#content');

            const RE_PHONE = /(\(\d\d\) \d\d\d\d-\d\d\d\d)/;
            const RE_GENDER = /Deputada/;
            $('.clearedBox', content).each(function (i) {
                let elem = $(this);
                if (i == 0) {
                    person.image = elem.find('.image-left').attr('src');
                    person.gender = RE_GENDER.test(elem.find('h3.documentFirstHeading').text()) ? 'F' : 'M';
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
                        } else if (RE_PHONE.test(val.trim())) {
                            person.phone = RE_PHONE.exec(val.trim())[1]
                        }
                    });
                } else if (i === 1) {
                    let lis = elem.find('.visualNoMarker li');
                    lis.each(function (i) {
                        let elem = $(this),
                            txt = elem.text().split(':'),
                            val = txt[1];
                        if (i == 1 && val) {
                            person.cabinet = val.trim();
                        }
                    });
                }
            });
            resolve(person);
        }
    });
});
