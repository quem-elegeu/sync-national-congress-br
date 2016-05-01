'use strict';

const $RE_STRONG = /<strong>([^<]*)<\/strong>/i;
module.exports = (elem, person) => {
    let data = elem.find('.bioFotoDetalhes .bioDetalhes').html().trim().split('<br>');
    person.birthday = data[1].match($RE_STRONG)[1];
    person.bornForm = data[2].match($RE_STRONG)[1];
    person.jobTitle = data[3].match($RE_STRONG)[1];
    person.degree = data[4].match($RE_STRONG)[1];

    person.history = {};
    person.activities = {};
    let others = elem.find('.bioOutros');
    others.each(function() {
        let elemDiv = elem.find(this),
            title = elemDiv.find('.bioOutrosTitulo').text().toLowerCase().trim(),
            text = elemDiv.find('.bioOutrosTexto');
        if (title.startsWith('mandatos') && ~title.indexOf('deputados')) {
            person.history.congress = text.text().trim().replace('\\n', ' ').split(/;\s*/);
        } else if (title.startsWith('mandatos') && ~title.indexOf('externos')) {
            person.history.external = text.text().trim().replace('\\n', ' ').split(/;\s*/);
        } else if (title.startsWith('filia')) {
            person.history.party = text.text().trim().split(/;\s*/).map(l => {
                let val = l.split(/,\s*/);
                return {
                    party: l[0].trim(),
                    years: l[1].split('-')
                }
            });
        } else if (title.startsWith('condecora')) {
            person.honors = text.text().trim();
        } else if (title.startsWith('atividades partid')) {
            person.activities.party = text.text().trim().replace('\\n', ' ').split(/,\s*/);
        } else if (title.startsWith('atividades parlamentares')) {
            person.activities.congress = text.html().trim().replace('\\n', ' ');
        }
    })
};
