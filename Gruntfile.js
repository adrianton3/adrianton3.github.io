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

	function fileExists(path) {
		try {
			fs.accessSync(path, fs.F_OK);
			return true;
		} catch (e) {
			return false;
		}
	}

	function isDir(basePath, extension) {
		return function (dir) {
			var lastPart = dir.match(/[-\w]+$/)[0];
			var mainFile = basePath + '/' + dir + '/' + lastPart + extension;

			return fileExists(mainFile);
		}
	}

	function generateDoccoConfig() {
		var allDirs = getDirs('src');
		var jsDirs = allDirs.filter(isDir('src', '.js'));
		var csDirs = new Set(allDirs.filter(isDir('src', '.coffee')));

		return jsDirs.reduce(function (config, dir) {
			var extension = csDirs.has(dir) ? 'coffee' : 'js';

			config[dir] = {
				src: ['src/' + dir + '/*.' + extension],
				options: {
					output: OUT_DIR + '/art/' + dir,
					template: TEMPLATE_DIR + '/docco/docco.html'
				}
			};

			return config;
		}, {});
	}

	function generateMarkdownConfig() {
		var dirs = getDirs('src').filter(isDir('src', '.md'));

		return dirs.map(function (dir) {
			return {
				src: 'src/' + dir + '/' + dir + '.md',
				dest: 'blog/art/' + dir + '/' + dir + '.html'
			};
		});
	}

	function readFile(path) {
		return fs.readFileSync(path, 'utf8');
	}

	var headerTemplate = _.template(readFile(TEMPLATE_DIR + '/docco/header.html'));
	var footerTemplate = _.template(readFile(TEMPLATE_DIR + '/docco/footer.html'));

	function getTitle(string) {
		// scraping my own html; there has to be a better way of integrating docco
		var match = string.match(/<h1\s.+?>([^<]+)/);

		return match && match[1];
	}

	function getHeader(path) {
		var fileContentTitle = getTitle(readFile(path));

		var match = path.match(/([-\w]+)\/([-\w]+)\.html$/);
		var fileNameTitle = match[1] + '-' + match[2];

		return headerTemplate({
			title: fileContentTitle || fileNameTitle,
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
				files: generateMarkdownConfig()
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