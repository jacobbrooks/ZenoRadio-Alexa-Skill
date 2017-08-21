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