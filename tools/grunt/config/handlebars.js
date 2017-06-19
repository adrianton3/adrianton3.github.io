'use strict'

const { minify } = require('html-minifier')

const { fileExists, readFile, getDates } = require('../../utils')

const commonCssBlob = readFile('./style.css')

function minifyHtml (blob) {
	return minify(blob, {
		minifyCSS: true,
		collapseBooleanAttributes: true,
		collapseWhitespace: true,
		conservativeCollapse: true,
		sortAttributes: true,
		sortClassName: true,
	})
}

function addDates () {
	const articles = require('../../../src/articles.json')

	return articles.map((article) => {
		const foundExtension = ['md', 'coffee', 'js'].find((extension) =>
			fileExists(`src/${article.name}/${article.name}.${extension}`)
		)

		const dates = getDates(`src/${article.name}/${article.name}.${foundExtension}`)

		return Object.assign({}, article, dates)
	})
}

function generateHandlebarsConfig () {
	return {
		projects: {
			templatePath: 'tools/template/projects.hbs',
			data: {
				css: commonCssBlob,
				projects: require('../../../src/projects.json'),
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
	}
}

module.exports = {
	generateHandlebarsConfig,
}