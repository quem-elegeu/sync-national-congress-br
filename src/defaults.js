'use strict';
const fs = require('fs');
const path = require('path');

let jqueryPath = path.join(__dirname, '..', 'node_modules', 'jquery', 'dist', 'jquery.js');
exports.jquery = fs.readFileSync(jqueryPath, 'utf-8');

exports.baseUrl = 'http://www.camara.leg.br/internet/deputado';