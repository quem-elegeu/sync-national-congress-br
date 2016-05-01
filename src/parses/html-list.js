'use strict';
const jsdom = require('jsdom');
const $defaults = require('../defaults');
const lineInfo = require('../models/list-line-info');

module.exports = (html) => new Promise(resolve => {
    let list = [];
    jsdom.env({
        html,
        src: [$defaults.jquery],
        done: (err, window) => {
            let $ = window.jQuery;
            let allElementsUl = $('#content').find('ul#demaisInformacoes');
            allElementsUl.each(function () {
                let person = {links: {}};
                lineInfo($(this), person);
                let ul = $(this),
                    li = ul.find('li');

                li.each(function (i) {
                    let elem = $(this);
                    if (i === 0) {
                        person.shortName = elem.find('a').first().text().trim();
                        person.links.details = elem.find('a:first').attr('href');
                    } else if (i == 1) {
                        let data = elem.text().trim();

                    } else if (i == 2) {
                        person.email = elem.text().trim();
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
