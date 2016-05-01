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
}).then(list => {
    console.log('Find total: ', list.length);
    let promise = Promise.resolve();
    for (let i=0, len = list.length; i<len; i++) {
    //for (let i=0, len = 10; i<len; i++) {
        let person = list[i];
        promise = promise.then(() => {
            let urlDetail = `${$baseUrl}/${person.links.details}`;
            return downloadHTML(urlDetail)
                .then(html => parseHTMLPerson(html, person))
                .then(() => {
                    if (!person.links.biography) return;
                    console.log('Get biography of', person.shortName || person.fullName);
                    return downloadHTML(person.links.biography)
                })
                .then(html => parseHTMLBiography(html, person))
                .then(() => console.log('Concluded download of ', person.shortName || person.fullName));
        });
    }
    promise.then(() => {
        console.log('Finish ...');
        const fs = require('fs');
        fs.writeFileSync('nationa-congress-data.json', JSON.stringify(list, 0, '  '), 'utf8');
    })
});