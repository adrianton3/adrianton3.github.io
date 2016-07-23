'use strict';

var fs = require('fs');
var Handlebars = require('handlebars');

const { readFile } = require('../utils')

module.exports = function (grunt) {
	grunt.registerMultiTask('handlebars', 'Runs handlebars', function () {
		var templateSrc = fs.readFileSync(this.data.templatePath, 'utf8');

		var template = Handlebars.compile(templateSrc);

		const data = this.data.dataPath ?
			JSON.parse(readFile(this.data.dataPath)) :
			this.data.data

		var result = template(data);

		fs.writeFileSync(this.data.outPath, result);
	});
};
