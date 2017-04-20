'use strict';
const $states = require('../utils/states');
const $defaults = require('../utils/defaults');
const $baseUrl = $defaults.senateUrl;

const parseHTMLPerson = require('./parses/html-person');
//const parseHTMLBiography = require('./parses/html-biography');
const parseHTMLList = require('./parses/html-list');

const downloadHTML = require('../utils/download-html');

let promises = [];
for (let i= 0, total=$states.length; i<total; i++) {
    let state = $states[i];
    let urlList = `${$baseUrl}/${state.abbr}`;
    let prom = downloadHTML(urlList).then(html => {
        return parseHTMLList(html);
    }).then(persons => {
        //console.log(state.abbr, 'Find total: ', persons.length);
        return persons;
    }).then(persons => Promise.all(persons.map(person => {
        let urlDetail = person.links.details;
        person.state = state.abbr;
        return downloadHTML(urlDetail)
            .then(html => parseHTMLPerson(html, person))
            .then(person => {
                console.log('Concluded download of Senate:', person.shortName || person.fullName);
                return persons[i] = person;
            });
    })));
    promises.push(prom);
}

module.exports = () => Promise.all(promises).then(all => {
    //console.log(all);
    let list = [];
    for (let i= 0, len=all.length; i<len; i++) {
        let persons = all[i];
        list.push(...persons);
    }
    return list;
}).then(list => new Promise((resolve, reject) => {
    const fs = require('fs');
    fs.writeFile('national-senate-data.json', JSON.stringify(list, 0, '  '), 'utf8', (err) => {
        if (err) {
            reject(err)
        } else {
            resolve();
        }
    });
}));