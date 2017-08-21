"use strict";

var Alexa = require('alexa-sdk');
var stationDict = require('./stationlinks');
var dictDirectory = require('./dictdirectory');
var SKILL_NAME = "ZenoRadio";
var APP_ID = "";
var countryName = "";
var stationName = "";
var genreName = "";
var dictForCountry = {};

exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest' : function () {
        this.emit('PlayRadioIntent');
    },
    'PlayRadioIntent': function () {
        var countrySlot = this.event.request.intent.slots.whichCountry;
        countryName = determineSlotValue(countrySlot);
        var genreSlot = this.event.request.intent.slots.whichGenre;
        genreName = determineSlotValue(genreSlot);

        dictForCountry = dictDirectory[mapSlotToKey(countryName)];

        if(genreName != "nullSlot"){
            var response = playRadio(dictForCountry[genreName]);
            this.context.succeed(response);
        }else{
            var response = playRadio(dictForCountry[defaultGenre(countryName)]);
            this.context.succeed(response);
        }
    },
    'TuneInIntent': function() {
        var stationSlot = this.event.request.intent.slots.whichStation;
        stationName = determineSlotValue(stationSlot);
        var response = playRadio(stationDict[stationName]);
        this.context.succeed(response);
    },
    'AMAZON.PauseIntent': function () {
        var response = stopRadio();
        this.context.succeed(response);
    },
    'AMAZON.ResumeIntent': function () {
        if(genreName != "nullSlot"){
            var response = playRadio(dictForCountry[genreName]);
            this.context.succeed(response);
        }else{
            var response = playRadio(dictForCountry[defaultGenre(countryName)]);
            this.context.succeed(response);
        }
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = "To stream radio, ask ZenoRadio to play a country's radio. For example, you can say, Alexa, ask ZenoRadio to play Haitian radio.";
        var reprompt = speechOutput;
        this.emit(":ask", speechOutput, reprompt);
    },
    'AMAZON.StopIntent': function () {
        var response = stopRadio();
        this.context.succeed(response);
    },
    'AMAZON.CancelIntent': function () {
        var response = stopRadio();
        this.context.succeed(response);
    }
};

var playRadio = function(streamURL){
    var response = {
        version: "1.0",
        response: {
            shouldEndSession: true,
            directives: [
                {
                    type: "AudioPlayer.Play",
                    playBehavior: "REPLACE_ALL",
                    audioItem: {
                        stream: {
                            url: streamURL,
                            token: "0", 
                            expectedPreviousToken: null,
                            offsetInMilliseconds: 0
                        }   
                    }
                }       
            ]
        }
    };
    return response;
};

var stopRadio = function(){
    var response = {
        version: "1.0",
        response: {
            shouldEndSession: true,
            directives: [
                {
                    type: "AudioPlayer.Stop"
                }
            ]
        }
    };
    return response;
};

var determineSlotValue = function(theSlot){
    var localSlotValue;
    if (theSlot && theSlot.value){
        localSlotValue = theSlot.value.toLowerCase();
        return localSlotValue;
    }
    return "nullSlot"; 
};

var mapSlotToKey = function(whichCountry){
    if(whichCountry == "haiti" || whichCountry == "haitian"){
        return "hti";
    }else if(whichCountry == "ghana" || whichCountry == "ghanaian"){
        return "gna";
    }else if(whichCountry == "guatemala" || whichCountry == "guatemalan"){
        return "gta";
    }else if(whichCountry == "mali" || whichCountry == "malian"){
        return "mli";
    }
    return "error";
};

var defaultGenre = function(whichCountry){
   if(mapSlotToKey(whichCountry) == "hti"){
        return "international";    
   }else if(mapSlotToKey(whichCountry) == "gna"){
        return "news";
   }else if(mapSlotToKey(whichCountry) == "gta"){
        return "general";
   }else if(mapSlotToKey(whichCountry) == "mli"){
        return "general";
   }
};






