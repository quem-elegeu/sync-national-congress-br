'use strict';
var request = require('request'),
    jsdom = require('jsdom');

const $baseUrl = 'http://www.camara.leg.br/internet/deputado';

function getInfo(data, person){
    data = data.replace(/\s{2,}/g, '');
    var infos = data.split('-');
    var party = infos[0].split(':')[1];
    person.party = party.split('/')[0].replace(' ', '');
    person.state = party.split('/')[1].replace(' ', '');
    var fone = infos[3].split(':')[1].replace(' ', '');
    person.phone = fone + '-' + infos[4];
}

const parseHTMLPerson = (html, person) => new Promise(resolve => {
    if (!person) person = {};
    jsdom.env(
        html,
        ["http://code.jquery.com/jquery.js"],
        function (err, window) {
            let $ = window.jQuery,
                content = $('#content');

            $('.clearedBox', content).each(function(i) {
                let elem = $(this);
                if (i == 0) {
                    person.image = $('.image-left', elem).attr('src');
                    let lis = $('.visualNoMarker li', elem);
                    lis.each(function(i) {
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
            console.log(person);

            resolve(person);
        }
    );
});

const parseHTMLList = (html) => new Promise(resolve => {
    let list = [];
    jsdom.env(
        html,
        ["http://code.jquery.com/jquery.js"],
        function (err, window) {
            let $ = window.jQuery;
            let allElementsUl = $('#content').find('ul#demaisInformacoes');
            allElementsUl.each(function() {
                let person = {links: {}};
                let ul = $(this),
                    li = ul.find('li');

                li.each(function(i) {
                    let elem = $(this);
                    if (i === 0) {
                        person.shortName = elem.find('a').first().text().trim();
                        person.links.details = elem.find('a:first').attr('href');
                    } else if (i == 1) {
                        let data = elem.text().trim();
                        getInfo(data, person);
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
    );
});

function downloadHTML(url) {
    let options = {
        url,
        headers: {
            'User-Agent': 'Mozilla/5.0'
        }
    };
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (!error && response.statusCode === 200) {
                resolve(body);
            } else {
                console.log('Err', url, response && response.statusCode, error);
                reject({error, response});
            }
        });
    });
}

var urlList = `${$baseUrl}/Dep_Lista.asp?Legislatura=&Partido=QQ&SX=QQ&UF=QQ&condic=QQ&forma=lista&nome=&ordem=nome&origem=None`;
downloadHTML(urlList).then(html => {
    return parseHTMLList(html);
}).then(list => {
    let promise = Promise.resolve();
    for (let i=0, len = 1; i<len; i++) {
        let person = list[i];
        promise = promise.then(() => {
            let urlDetail = `${$baseUrl}/${person.links.details}`;
            return downloadHTML(urlDetail).then(html => parseHTMLPerson(html, person));
        });
    }
});