module.exports = function (grunt) {
	'use strict';

	var fs = require('fs');

	var _ = require('underscore');

	require('./tools/grunt-tasks/handlebars')(grunt);

	var OUT_DIR = 'blog';
	var TEMPLATE_DIR = 'tools/template';

	function getDirs(basePath) {
		return fs.readdirSync(basePath).filter(function (file) {
			var completeFile = basePath + '/' + file;
			return fs.statSync(completeFile).isDirectory();
		});
	}

	function isDir(basePath, extension) {
		return function (dir) {
			var lastPart = dir.match(/[-\w]+$/)[0];
			var mainFile = basePath + '/' + dir + '/' + lastPart + extension;

			try {
				fs.accessSync(mainFile, fs.F_OK);
				return true;
			} catch (e) {
				return false;
			}
		}
	}

	function generateDoccoConfig() {
		var dirs = getDirs('src').filter(isDir('src', '.js'));

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
			clean: {
				command: 'rm -rf ' + OUT_DIR + '/art'
			}
		},
		markdown: {
			options: {
				template: 'tools/template/markdown.html',
				contextBinder: true
			},
			all: {
				files: [{
					src: 'src/jinter/jinter.md',
					dest: 'blog/art/jinter/jinter.html'
				}]
			}
		},
		'handlebars': {
			projects: {
				templatePath: 'tools/template/projects.hbs',
				dataPath: 'src/projects.json',
				outPath: './index.html'
			},
			articles: {
				templatePath: 'tools/template/articles.hbs',
				dataPath: 'src/articles.json',
				outPath: 'blog/index.html'
			}
		}
	});

	grunt.loadNpmTasks('grunt-docco');
	grunt.loadNpmTasks('grunt-eslint');
	grunt.loadNpmTasks('grunt-wrap');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-markdown');

	grunt.registerTask('default', [
		'shell:clean',
		'docco',
		'wrap',
		'markdown',
		'handlebars'
	]);
};
