'use strict'


const fs = require('fs');
const { execSync } = require('child_process');


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

function readFile(path) {
	return fs.readFileSync(path, 'utf8');
}

function extractDate(string) {
	return string.match(/[-\d]+/)[0]
}

function getDates(path) {
	const result = execSync(`git log --follow --format=%ai -- ${path}`).toString()
	const lines = result.split('\n')

	return {
		added: extractDate(lines[lines.length - 2]),
		lastModified: extractDate(lines[0])
	}
}

Object.assign(module.exports, {
	getDirs,
	fileExists,
	readFile,
	getDates
})

