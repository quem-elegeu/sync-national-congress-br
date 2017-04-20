'use strict';
const jsdom = require('jsdom');
const $defaults = require('../../utils/defaults');

module.exports = (html) => new Promise(resolve => {
    let list = [];
    jsdom.env({
        html,
        src: [$defaults.jquery],
        done: (err, window) => {
            let $ = window.jQuery;
            let allElementsUl = $('div.busca-estado').find('div.boxProfile');
            allElementsUl.each(function () {
                let person = {links: {}};
                let profile = $(this);
                person.image = profile.find('figure img').attr('src');
                person.shortName = profile.find('p:first').text();

                let action = profile.find('div.botoes');
                person.links.details = action.find('a:first').attr('href');

                let ul = profile.find('ul:first'),
                    li = ul.find('li');

                li.each(function (i) {
                    let elem = $(this),
                        val = elem.text().split(':')[1];
                    if (i === 0) {
                        person.birthday = val.trim();
                    } else if (i == 1) {
                        person.party = val.split('/')[0].trim();
                    } else if (i == 3) {
                        person.cabinet = val.trim();
                    } else if (i == 4) {
                        person.phone = val.trim();
                    } else if (i == 6) {
                        person.email = val.trim();
                        person.gender = ~person.email.indexOf('senadora') ? 'F' : 'M';

                    }
                });
                if (li.length) {
                    list.push(person);
                } else {
                    console.log('not found <li>', ul.text());
                }
            });

            resolve(list);
        }
    });
});
