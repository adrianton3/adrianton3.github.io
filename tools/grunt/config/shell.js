'use strict'

const { outDir } = require('./common')

function generateShellConfig () {
	return {
		clean: {
			command: `rm -rf ${outDir}/art`,
		},
	}
}

module.exports = {
	generateShellConfig,
}