const _ = require('underscore')
const { minify } = require('html-minifier')

const { getDirs, fileExists, readFile, getDates } = require('./tools/utils')

module.exports = function (grunt) {
	'use strict'

	require('./tools/grunt-tasks/handlebars')(grunt)

	function addDates () {
		const articles = require('./src/articles.json')

		return articles.map((article) => {
			const foundExtension = ['md', 'coffee', 'js'].find((extension) =>
				fileExists(`src/${article.name}/${article.name}.${extension}`)
			)

			const dates = getDates(`src/${article.name}/${article.name}.${foundExtension}`)

			return Object.assign({}, article, dates)
		})
	}

	const outDir = 'blog'
	const templateDir = 'tools/template'

	function isDir (basePath, extension) {
		return (dir) => {
			const lastPart = dir.match(/[-\w]+$/)[0]
			const mainFile = `${basePath}/${dir}/${lastPart}${extension}`

			return fileExists(mainFile)
		}
	}

	function generateDoccoConfig () {
		const allDirs = getDirs('src')
		const jsDirs = allDirs.filter(isDir('src', '.js'))
		const csDirs = new Set(allDirs.filter(isDir('src', '.coffee')))

		return jsDirs.reduce((config, dir) => {
			const extension = csDirs.has(dir) ? 'coffee' : 'js'

			config[dir] = {
				src: ['src/' + dir + '/*.' + extension],
				options: {
					output: outDir + '/art/' + dir,
					template: templateDir + '/docco/docco.html',
					css: 'dummy',
				},
			}

			return config
		}, {})
	}

	function generateMarkdownConfig () {
		const dirs = getDirs('src').filter(isDir('src', '.md'))

		return dirs.map((dir) => ({
			src: 'src/' + dir + '/' + dir + '.md',
			dest: 'blog/art/' + dir + '/' + dir + '.html',
		}))
	}

	const headerTemplate = _.template(readFile(templateDir + '/docco/header.html'))
	const footerTemplate = _.template(readFile(templateDir + '/docco/footer.html'))

	function getTitle (string) {
		// scraping my own html; there has to be a better way of integrating docco
		const match = string.match(/<h1\s.+?>([^<]+)/)

		return match && match[1]
	}

	function getHeader (path) {
		const fileContentTitle = getTitle(readFile(path))

		const match = path.match(/([-\w]+)\/([-\w]+)\.html$/)
		const fileNameTitle = match[1] + '-' + match[2]

		return headerTemplate({
			title: fileContentTitle || fileNameTitle,
			css: '../../static/docco-small-tab.css',
		})
	}

	function getFooter () {
		return footerTemplate({})
	}

	const minifyHtml = (blob) =>
		minify(blob, {
			minifyCSS: true,
			collapseBooleanAttributes: true,
			collapseWhitespace: true,
			conservativeCollapse: true,
			sortAttributes: true,
			sortClassName: true,
		})

	const commonCssBlob = readFile('./style.css')

	grunt.initConfig({
		docco: generateDoccoConfig(),
		wrap: {
			all: {
				src: [`${outDir}/art/**/*.html`],
				dest: '',
				options: {
					wrapper (path) {
						return [getHeader(path), getFooter()]
					},
				},
			},
		},
		eslint: {
			options: {
				configFile: '.eslintrc',
			},
			target: ['Gruntfile.js', 'tools/grunt-tasks'],
		},
		shell: {
			clean: {
				command: `rm -rf ${outDir}/art`,
			},
		},
		markdown: {
			options: {
				template: 'tools/template/markdown.html',
				contextBinder: true,
				gfm: true,
				markdownOptions: {
					highlight: 'manual',
					smartypants: false,
				},
			},
			all: {
				files: generateMarkdownConfig(),
			},
		},
		handlebars: {
			projects: {
				templatePath: 'tools/template/projects.hbs',
				data: {
					css: commonCssBlob,
					projects: require('./src/projects.json'),
				},
				outPath: './index.html',
				postProcess: minifyHtml,
			},
			articles: {
				templatePath: 'tools/template/articles.hbs',
				data: {
					css: commonCssBlob,
					articles: addDates(),
				},
				outPath: 'blog/index.html',
				postProcess: minifyHtml,
			},
		},
	})

	grunt.loadNpmTasks('grunt-docco')
	grunt.loadNpmTasks('grunt-eslint')
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
