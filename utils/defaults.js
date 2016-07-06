'use strict';
const fs = require('fs');
const path = require('path');

let jqueryPath = path.join(__dirname, '..', 'node_modules', 'jquery', 'dist', 'jquery.js');
exports.jquery = fs.readFileSync(jqueryPath, 'utf-8');

exports.congressUrl = 'http://www.camara.leg.br/internet/deputado';
exports.senateUrl = 'http://www25.senado.leg.br/web/senadores/por-uf/-/uf'