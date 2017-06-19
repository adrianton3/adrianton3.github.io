'use strict'

const { getDirs } = require('../../utils')
const { isDir } = require('./common')

function generateFiles () {
	const dirs = getDirs('src').filter(isDir('src', '.md'))

	return dirs.map((dir) => ({
		src: `src/${dir}/${dir}.md`,
		dest: `blog/art/${dir}/${dir}.html`,
	}))
}

function generateMarkdownConfig () {
	return {
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
			files: generateFiles(),
		},
	}
}

module.exports = {
	generateMarkdownConfig,
}