'use strict'

const { fileExists } = require('../../utils')

const outDir = 'blog'
const templateDir = 'tools/template'

function isDir (basePath, extension) {
	return (dir) => {
		const lastPart = dir.match(/[-\w]+$/)[0]
		const mainFile = `${basePath}/${dir}/${lastPart}${extension}`

		return fileExists(mainFile)
	}
}

module.exports = {
	outDir,
	templateDir,
	isDir,
}