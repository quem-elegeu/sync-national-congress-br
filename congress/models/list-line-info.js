'use strict';

module.exports = (elem, person) => {
    let li = elem.find('li');
    if (!li.length) {
        return null;
    }

    li.each(function (i) {
        let elemLi = elem.find(this);
        if (i === 0) {
            person.shortName = elemLi.find('a').first().text().trim();
            person.links.details = elemLi.find('a:first').attr('href');
        } else if (i == 1) {
            let data = elemLi.text().trim();
            data = data.replace(/\s{2,}/g, '');

            let infos = data.split('-'),
                party = infos[0].split(':')[1],
                sparty = party.split('/'),
                fone = infos[3].split(':')[1].replace(/ /g, '');
            person.party = sparty[0].trim();//.replace(' ', '');
            person.state = sparty[1].replace(' ', '');
            person.phone = fone + '-' + infos[4];
        } else if (i == 2) {
            person.email = elemLi.text().trim();
        }
    });

    return person;
};
