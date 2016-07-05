'use strict';

const $RE_SPAN = /<span>([^<]*)/i;
const $RE_STRONG = /<strong>([^<]*)<\/strong>/i;
module.exports = (elem, person) => {
    let data = elem.find('.bioFotoDetalhes .bioDetalhes').html().trim().split('<br>');
    data.forEach(info => {
        let span = info.match($RE_SPAN),
            str = info.match($RE_STRONG);
        if (!str || !str[1]) return;
        let lbl = span && span[1].toLowerCase() || '',
            val = str[1].trim().replace('\\n', '');
        if (!span) {
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

    person.legislation = [];
    person.history = {};
    person.activities = {};
    let others = elem.find('.bioOutros');
    others.each(function() {
        let elemDiv = elem.find(this),
            others = elemDiv.find('.bioOutrosTitulo'),
            title = others.text().toLowerCase().trim(),
            text = elemDiv.find('.bioOutrosTexto');
        if (!text.length) {
            others.each(function() {
                let oElem = elem.find(this),
                    link = oElem.find('a'),
                    atitle = link.text().toLowerCase().trim();
                if (~atitle.indexOf('autoria do deputado transformadas em norma jur')) {
                    person.links.propsCreatedToLawed = link.attr('href');
                } else if (~atitle.indexOf('relatadas transformadas em norma jur')) {
                    person.links.propsSpeakedToLawed = link.attr('href');
                } else if (~atitle.indexOf('de autoria do deputado')) {
                    person.links.propsCreated = link.attr('href');
                } else if (~atitle.indexOf('relatadas')) {
                    person.links.propsSpeaked = link.attr('href');
                } else if (~oElem.text().indexOf('(Legislaturas)')) {
                    elemDiv.find('a').each(function() {
                        let n = elemDiv.find(this).text().trim();
                        if (!~person.legislation.indexOf(n)) {
                            person.legislation.push(n);
                        }
                    });
                } else {
                    console.log('Links Data Not Mapped:', elem.find(this).text());
                }
            });
        } else if (title.startsWith('mandatos') && ~title.indexOf('deputados')) {
            let val = text.text().trim().replace(/\n/g, '').split(/;\s*/);
            person.history.congress = val.map(o => o.split(/\s*,\s*/));
        } else if (title.startsWith('mandatos') && ~title.indexOf('externos')) {
            person.history.external = text.text().trim().replace(/\n/g, '').split(/;\s*/);
        } else if (title.startsWith('filia')) {
            person.history.party = text.text().trim().split(/;\s*/).map(l => {
                let val = l.split(/,\s*/),
                    reYear = /([\d]*)/;
                return {
                    party: val[0].trim(),
                    years: val[1] && val[1].split('-').map(y => y && y.match(reYear) && y.match(reYear)[1] || '') || ['', '']
                }
            });
        } else if (title.startsWith('condecora')) {
            person.honors = text.text().trim();
        } else if (title.startsWith('atividades partid')) {
            person.activities.party = text.text().trim().split(/,\s*|\n/);
        } else if (title.startsWith('atividades parlamentares')) {
            person.activities.congress = text.html().trim().replace(/\n/g, '');
        } else if(title.startsWith('estudos e cursos diversos')) {
            person.educations = text.text().trim().split(/;\s*/);
        } else if(title.startsWith('atividades profissionais e cargos')) {
            person.positions = text.text().trim().split(/;\s*/);
        } else if(title.startsWith('seminários e congressos')) {
            person.speeches = text.text().trim().split(/;\s*/);
        } else if(title.startsWith('missões oficiais')) {
            person.offialMissions = text.text().trim().split(/;\s*/);
        } else if (title.startsWith('obras publicadas')) {
            person.publicBuilds = text.text().trim().split(/;\s*/);
        } else if (title.startsWith('atividades sindicais')) {
            person.sindicalActivities = text.text().trim().split(/;\s*/);
        } else if (title.startsWith('conselhos')) {
            person.advices = text.text().trim().split(/;\s*/);
        } else if (title.startsWith('suplências e efetivações')) {
            person.history.notOwner = text.text().trim();
        } else if (title.startsWith('licenças')) {
            person.history.licenses = text.text().trim();
        } else {
            console.log('Other Data Not Mapped:', title);
        }
    })
};
