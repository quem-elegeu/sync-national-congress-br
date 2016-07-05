'use strict';
const $defaults = require('./src/defaults');
const $baseUrl = $defaults.baseUrl;

const parseHTMLPerson = require('./src/parses/html-person');
const parseHTMLBiography = require('./src/parses/html-biography');
const parseHTMLList = require('./src/parses/html-list');

const downloadHTML = require('./src/download-html');

var urlList = `${$baseUrl}/Dep_Lista.asp?Legislatura=&Partido=QQ&SX=QQ&UF=QQ&condic=QQ&forma=lista&nome=&ordem=nome&origem=None`;
downloadHTML(urlList).then(html => {
    return parseHTMLList(html);
}).then(persons => {
    console.log('Find total: ', persons.length);
    let gb = [],
        promise = Promise.resolve();
    for (let i=0, len = persons.length; i<len; i++) {
    //for (let i=0, len = 10; i<len; i++) {
        let person = persons[i] || {};
        let exec = () => {
            let urlDetail = `${$baseUrl}/${person.links.details}`;
            return downloadHTML(urlDetail)
                .then(html => parseHTMLPerson(html, person))
                .then(person => {
                    person.links.details = urlDetail;
                    if (!person.links.biography) return;
                    //console.log('Get biography of', person.shortName || person.fullName);
                    return Promise.all([person, downloadHTML(person.links.biography)]);
                })
                .then(([person, html]) => parseHTMLBiography(html, person))
                .then(person => {
                    console.log('Concluded download of ', person.shortName || person.fullName);
                    return persons[i] = person;
                });
        };
        gb.push(exec);
        if (gb.length % 4 === 0) {
            let array = gb; gb = [];
            promise = promise.then(() => Promise.all(array.map(l => l())));

        }
    }
    if (gb.length) {
        promise = promise.then(() => Promise.all(gb.map(l => l())));
    }
    let list = [];
    for (let i=0,len = persons.length; i<len; i++) {
        let person = persons[i],
            keys = Object.keys(person),
            o = {};
        keys.sort();
        for (let k=0, tt = keys.length; k<tt;k++) {
            let key = keys[k];
            o[key] = person[key];
        }

        list.push(o);
    }
    promise.then(list => {
        const fs = require('fs');
        fs.writeFileSync('national-congress-data.json', JSON.stringify(list, 0, '  '), 'utf8');
        console.log('Finish ...');
    })
});