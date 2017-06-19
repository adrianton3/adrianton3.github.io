'use strict'

const { getDirs } = require('../../utils')
const { outDir, templateDir, isDir } = require('./common')

function generateDoccoConfig () {
	const allDirs = getDirs('src')
	const jsDirs = allDirs.filter(isDir('src', '.js'))
	const csDirs = new Set(allDirs.filter(isDir('src', '.coffee')))

	return jsDirs.reduce((config, dir) => {
		const extension = csDirs.has(dir) ? 'coffee' : 'js'

		config[dir] = {
			src: [`src/${dir}/*.${extension}`],
			options: {
				output: `${outDir}/art/${dir}`,
				template: `${templateDir}/docco/docco.html`,
				css: 'dummy',
			},
		}

		return config
	}, {})
}

module.exports = {
	generateDoccoConfig,
}