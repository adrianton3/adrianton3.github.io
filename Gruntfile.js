module.exports = function (grunt) {
	'use strict';

	var fs = require('fs');

	var _ = require('underscore');

	var OUT_DIR = 'blog';
	var TEMPLATE_DIR = 'tools/template';

	function getDirs(basePath) {
		return fs.readdirSync(basePath).filter(function (file) {
			var completeFile = basePath + '/' + file;
			return fs.statSync(completeFile).isDirectory();
		});
	}

	function generateDoccoConfig() {
		var dirs = getDirs('src');

		var config = {};

		dirs.forEach(function (dir) {
			config[dir] = {
				src: ['src/' + dir + '/*.js', 'src/' + dir + '/*.coffee'],
				options: {
					output: OUT_DIR + '/art/' + dir,
					template: TEMPLATE_DIR + '/docco.jst'
				}
			};
		});

		return config;
	}

	function readFile(path) {
		return fs.readFileSync(path, 'utf8');
	}

	var headerTemplate = _.template(readFile(TEMPLATE_DIR + '/header.jst'));
	var footerTemplate = _.template(readFile(TEMPLATE_DIR + '/footer.jst'));

	function getHeader(path) {
		var match = path.match(/([-\w]+)\/([-\w]+)\.html$/);
		var title = match[1] + '-' + match[2];

		return headerTemplate({
			title: title,
			css: '../../static/docco-small-tab.css'
		});
	}

	function getFooter() {
		return footerTemplate({});
	}

	grunt.initConfig({
		docco: generateDoccoConfig(),
		wrap: {
			all: {
				src: [OUT_DIR + '/art/**/*.html'],
				dest: '',
				options: {
					wrapper: function (path) {
						return [getHeader(path), getFooter()];
					}
				}
			}
		},
		eslint: {
			options: {
				configFile: '.eslintrc'
			},
			target: ['Gruntfile.js', 'src/**/*.js', 'test/spec/**/*.js']
		},
		shell: {
			index: {
				command: 'node tools/index/generate.js'
			}
		}
	});

	grunt.loadNpmTasks('grunt-docco');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-wrap');
	grunt.loadNpmTasks('grunt-shell');

	grunt.registerTask('default', ['docco', 'wrap']);
};
