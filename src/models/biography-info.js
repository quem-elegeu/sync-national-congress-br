'use strict';

const $RE_SPAN = /<span>([^<]*)<\/span>/i;
const $RE_STRONG = /<strong>([^<]*)<\/strong>/i;
module.exports = (elem, person) => {
    let data = elem.find('.bioFotoDetalhes .bioDetalhes').html().trim().split('<br>');
    data.forEach(info => {
        let span = info.match($RE_SPAN),
            str = info.match($RE_STRONG);
        if (!str || !str[1]) return;
        let lbl = span && span[1].toLowerCase() || '',
            val = str[1].trim().replace('\\n', '');
        if (!lbl) {
            person.fullName = val;
        } else if (~lbl.indexOf('nascimento')) {
            let dd = val.split('/');
            person.birthday = {
                day: dd[0],
                month: dd[1],
                year: dd[2]
            };
        } else if (~lbl.indexOf('natural')) {
            person.bornForm = val;
        } else if (~lbl.indexOf('profiss')) {
            person.jobTitle = val;
        } else if (~lbl.indexOf('filia')) {
            person.family = val;
        } else if (~lbl.indexOf('escola')) {
            person.degree = val;
        } else {
            console.log('Data Not Mapped:', span);
        }
    });

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
