'use strict';
const $defaults = require('../utils/defaults');
const $baseUrl = $defaults.congressUrl;

const parseHTMLPerson = require('./parses/html-person');
const parseHTMLBiography = require('./parses/html-biography');
const parseHTMLList = require('./parses/html-list');

const downloadHTML = require('../utils/download-html');

var urlList = `${$baseUrl}/Dep_Lista.asp?Legislatura=&Partido=QQ&SX=QQ&UF=QQ&condic=QQ&forma=lista&nome=&ordem=nome&origem=None`;
module.exports = () => downloadHTML(urlList).then(html => {
    return parseHTMLList(html);
}).then(persons => {
    console.log('Congress: Find total: ', persons.length);
    let gb = [],
        promise = Promise.resolve([]);
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
        if (gb.length % 8 === 0) {
            let array = gb; gb = [];
            promise = promise.then(list => Promise.all(array.map(l => l())).then(res => {
                list.push(...res);
                return list;
            }));

        }
    }
    if (gb.length) {
        promise = promise.then(() => Promise.all(gb.map(l => l())).then(res => {
            list.push(...res);
            return list;
        }));
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
    return promise.then(list => new Promise((resolve, reject) => {
        const fs = require('fs');
        fs.writeFile('national-congress-data.json', JSON.stringify(list, 0, '  '), 'utf8', (err) => {
            if (err) {
                reject(err)
            } else {
                resolve();
            }
        });
    }));
});