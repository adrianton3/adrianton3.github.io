'use strict'

const Handlebars = require('handlebars')

const { readFile, writeFile } = require('../../utils')

module.exports = function (grunt) {
	grunt.registerMultiTask('handlebars', 'Runs handlebars', function () {
		const {
			data,
			outPath,
			templatePath,
			postProcess,
		} = this.data

		const templateSrc = readFile(templatePath)

		const template = Handlebars.compile(templateSrc)

		const result = template(data)

		writeFile(
			outPath,
			postProcess ? postProcess(result): result,
		)
	})
}
