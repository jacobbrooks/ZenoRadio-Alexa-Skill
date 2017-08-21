/*
	This file consolidates all of the designated country dictionairies into one dictinary called dictDiectory. 
	index.js only requires this file to access all the other dictionaries besides the station dictionary. 
	To see the genre's that can be requested for each country, just go through the js files that are required by
	this file 
*/
"use strict";

var haitiDict = require('./haitilinks');
var ghanaDict = require('./ghanalinks');
var guatemalaDict = require('./guatemalalinks');
var maliDict = require('./malilinks');

var dictDirectory = {};

dictDirectory["hti"] = haitiDict;
dictDirectory["gna"] = ghanaDict;
dictDirectory["gta"] = guatemalaDict;
dictDirectory["mli"] = maliDict;

module.exports = dictDirectory;