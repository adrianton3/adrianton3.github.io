'use strict'

module.exports = function (grunt) {
	require('./tools/grunt/tasks/handlebars')(grunt)

	const { generateDoccoConfig } = require('./tools/grunt/config/docco')
	const { generateWrapConfig } = require('./tools/grunt/config/wrap')
	const { generateShellConfig } = require('./tools/grunt/config/shell')
	const { generateMarkdownConfig } = require('./tools/grunt/config/markdown')
	const { generateHandlebarsConfig } = require('./tools/grunt/config/handlebars')

	grunt.initConfig({
		docco: generateDoccoConfig(),
		wrap: generateWrapConfig(),
		shell: generateShellConfig(),
		markdown: generateMarkdownConfig(),
		handlebars: generateHandlebarsConfig(),
	})

	grunt.loadNpmTasks('grunt-docco')
	grunt.loadNpmTasks('grunt-wrap')
	grunt.loadNpmTasks('grunt-shell')
	grunt.loadNpmTasks('grunt-markdown')

	grunt.registerTask('default', [
		'shell:clean',
		'docco',
		'wrap',
		'markdown',
		'handlebars',
	])
}
