'use strict';

var fs = require('fs');
var Handlebars = require('handlebars');


var templatePath = 'tools/index/index.hbs';
var templateSrc = fs.readFileSync(templatePath, 'utf8');

var template = Handlebars.compile(templateSrc);


var dataPath = 'tools/index/data.json';
var dataRaw = fs.readFileSync(dataPath, 'utf8');
var data = JSON.parse(dataRaw);


var result = template(data);

fs.writeFileSync('./index.html', result);