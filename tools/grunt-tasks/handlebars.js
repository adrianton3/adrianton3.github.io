'use strict'

const fs = require('fs')
const Handlebars = require('handlebars')

const { readFile } = require('../utils')

module.exports = function (grunt) {
	grunt.registerMultiTask('handlebars', 'Runs handlebars', function () {
		const templateSrc = fs.readFileSync(this.data.templatePath, 'utf8')

		const template = Handlebars.compile(templateSrc)

		const data = this.data.dataPath ?
			JSON.parse(readFile(this.data.dataPath)) :
			this.data.data

		const result = template(data)

		fs.writeFileSync(this.data.outPath, result)
	});
};
