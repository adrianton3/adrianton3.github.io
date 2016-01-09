'use strict';

var fs = require('fs');
var Handlebars = require('handlebars');

module.exports = function (grunt) {
	grunt.registerMultiTask('handlebars', 'Runs handlebars', function () {
		var templateSrc = fs.readFileSync(this.data.templatePath, 'utf8');

		var template = Handlebars.compile(templateSrc);


		var dataRaw = fs.readFileSync(this.data.dataPath, 'utf8');
		var data = JSON.parse(dataRaw);


		var result = template(data);

		fs.writeFileSync(this.data.outPath, result);
	});
};
