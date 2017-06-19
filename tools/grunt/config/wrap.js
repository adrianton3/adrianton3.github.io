'use strict'

const _ = require('underscore')

const { readFile } = require('../../utils')
const { outDir, templateDir } = require('./common')

const headerTemplate = _.template(readFile(`${templateDir}/docco/header.html`))
const footerTemplate = _.template(readFile(`${templateDir}/docco/footer.html`))

function getTitle (string) {
	// scraping my own html; there has to be a better way of integrating docco
	const match = string.match(/<h1\s.+?>([^<]+)/)

	return match && match[1]
}

function getHeader (path) {
	const fileContentTitle = getTitle(readFile(path))

	const match = path.match(/([-\w]+)\/([-\w]+)\.html$/)
	const fileNameTitle = `${match[1]}-${match[2]}`

	return headerTemplate({
		title: fileContentTitle || fileNameTitle,
		css: '../../static/docco-small-tab.css',
	})
}

function getFooter () {
	return footerTemplate({})
}

function generateWrapConfig () {
	return {
		all: {
			src: [`${outDir}/art/**/*.html`],
				dest: '',
				options: {
				wrapper (path) {
					return [getHeader(path), getFooter()]
				},
			},
		},
	}
}

module.exports = {
	generateWrapConfig,
}