/*
    This is the main file that the lambda function for the ZenoRadio Alexa Skill refers to for its intent handlers.
    An intent is a programmable action that Alexa can perform, such as 'Play Radio'. This Skill has 2 custom intents, 
    'PlayRadioIntent' and 'TuneInIntent'. The 'PlayRadioIntent' is invoked when you want alexa to play a given genre
    of radio from a given country. The 'PlayRadioIntent' is invoked with the words 'play', 'stream', or 'give me', so for
    example one would say "Alexa, ask Zeno to play Haiti Pop Radio" or "Alexa, tell Zeno to stream Ghanian Christian Radio"

    The 'TuneInIntent' is invoked when you want to listen to a specific radio station. The only invocation phrase 
    for this intent is 'tune in to' so for example, one would say, "Alexa, ask Zeno to tune in to Shalom Haiti"
    
    The 'PlayRadioIntent' has a built-in "Slot" or variable called 'whichCountry' that holds the name/demonym of a country, and another slot
    'whichGenre' to specify the genre of radio the user wants to listen to. So a generic user utterance looked at from a higher
    level looks like this, "Alexa, tell Zeno to Play {whichCountry} {whichGenre} Radio"

    The 'TuneInIntent' only has one slot called 'whichStation', so a higher level look at the utterance that
    invokes the 'TuneInIntent' would be "Alexa, ask Zeno to tune in to {whichStation}" 

    When a user invokes an intent such as 'PlayRadioIntent' by saying something like "Alexa, tell Zeno to play Hatian Sports Radio"
    The code in the PlayRadioIntent handler first saves 'whichCountry' in a variable, then saves 'whichGenre' in another, you can 
    think of these variables as of type: Slot. These variables are then passed individually to the function determineSlot(theSlot) that extracts 
    its actual String value, which for 'whichCountry' might be "haiti", "haitian", "malian" etc. And for 'whichGenre' might be "christian", "pop", "sports" etc.

    The URLs to each stream are contained in dictionaries that are designated to a given country. For example, there is a hatian dictionary contained in "haitilinks.js"
    They key : value pairs are 'genre' : "stream URL", so...     dict[genre] = "stream URL"    or for a more concrete example 
    haitiDict["pop"] = "https://s3.amazonaws.com/zenoradioalexa/haitistreams/pop.m3u".

    This file contains the master dictionary called dictDirectory[] which is a dictionary of dictionaries. Instead of the key being the genre, now the key is the country,
    and the value is the dictionary corresponding to that country. Now, to come full circle and bring it back to the slot values...Remember the slots
    are passed individually to the function determineSlot(theSlot) that returns String values. These String values are saved in the variables 'countryName'
    and 'genreName' respectively. 

    Now, 'countryName' is passed to the function mapSlotToKey(countryName). Since 'countryName' can either be a given country's literal name, or
    a country's demonym, such as "haiti" vs. "hatian", mapSlotToKey(countryName) accounts for those 2 possibilities and returns a three letter key
    representing the country. This key can now be used to index into the dictDirectory[] dictionary to access the proper given country's designated dictionary.
    The three letters of the key follows a specific pattern:
    -The first letter is the first letter of the country name, 
    -the middle letter is the first consonant after the first letter in the country's name, 
    -and the third letter is the last letter in the countries name. 

    For example the return value for mapSlotToKey("haiti") or mapSlotToKey("haitian") will be "hti". Now, dictDirectory["hti"] = haitiDict.
    the variable dictForCountry is a reference to the current dictionary that is being accessed to play a stream, and has a new value assigned to it
    everytime the 'PlayRadioIntent' is invoked. So if one were listening to Hatian radio: dictForCountry == dictDirectory["hti"] == haitiDict.  
    Now since dictForCountry == haitiDict, the variable 'genreName' can be used as the key to index into haitiDict. 
    So for example,  dictForCountry["pop"] == "stream URL for hatian pop music".

    dictForCountry[genreName] can now be passed to the PlayRadio function which returns a JSON response object. The response object uses the stream URL that was 
    passed into it to send a play directive: "AudioPlayer.Play" to Alexa's AudioPlayer interface. This causes the Alexa's built in AudioPlayer to begin playing
    the stream. None of this is executed until the response object is passed into the 'succeed' function from the 'PlayRadioIntent'...where it says
    'this.context.succeed(response)'

    Before the response can be invoked we need to check if the genreSlot was an empty slot because the user doesn't have to provide a genre.
    One can just say "Alexa, tell Zeno to play Hatian Radio". In this case the genreName == "nullslot". When this happens we pass 'countryName' to the function 
    defaultGenre(countryName) which returns a default genre to be used as a key into the current country's designated dictionary. This can be seen in the line
    of code that says: var response = playRadio(dictForCountry[defaultGenre(countryName)]);

    The mechanics of the 'TuneInIntent' are almost identical to that of the 'PlayRadioIntent' accept it uses a different dictionary, stationDict[], which just contains
    randomly chosen specific stations. 

    When making an Alexa Skill, we must implement built in Alexa intents such as the 'AMAZON.StopIntent' which is invoked when you say "Alexa, stop", 
    "AMAZON.HelpIntent", and the "AMAZON.CancelIntent" etc. 

    When making an Alexa Skill that uses Alexa's AudioPlayer Interface, we must implement the built in intents "AMAZON.PauseIntent" and "AMAZON.ResumeIntent".

    The intents "AMAZON.PauseIntent", "AMAZON.StopIntent", and "AMAZON.CancelIntent" all have the same inner functionality, where the stopRadio() function is called.
    stopRadio() returns a JSON Response object just like the playRadio() function. Then it is executed the same way with the line: this.context.succeed(response). The response 
    object that is returned sends Alexa's AudioPlayer a "AudioPlayer.Stop" directive to get Alexa to stop playing what ever stream is currently playing. 

    The "AMAZON.ResumeIntent" just invokes the PlayRadio(streamURL) function. Since this skill plays live streams, play will not resume from the time the user paused,
    but will instead just return to the stream's current time. 

    Lastly the "AMAZON.HelpIntent" just has Alexa say a speech prompt. 
*/


"use strict";

var Alexa = require('alexa-sdk');
var stationDict = require('./stationlinks');
var dictDirectory = require('./dictdirectory');
var SKILL_NAME = "ZenoRadio";
var APP_ID = "";
var countryName = ""; //The name/demonym of a country such as "haiti" / "haitian"
var stationName = ""; //The name of a station such as "shalom haiti"
var genreName = ""; //The name of a genre such as "news"
var dictForCountry = {}; //Reference to the current dictionary being accessed. 


/*
    Entry point of the program, some boiler-plate code to register the intent handlers, and begin the alexa session etc. 
*/
exports.handler = function(event, context, callback){
    var alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};


/*
    An array of request/intent handlers, dont worry about 'LaunchRequest'. 'PlayRadioIntent' and 'TuneInIntent' 
    are the important custom intents we created. The rest of the intents are required by Amazon to be in the skill,
    with AMAZON.ResumeIntent and AMAZON.PauseIntent required if you are using Alexa's AudioPlayer Interface. 
*/
var handlers = {
    'LaunchRequest' : function () {
        this.emit('PlayRadioIntent');
    },
    /*
        The meat of this entire skill. This intent is invoked when the user says "Alexa, tell Zeno to Play {country} {genre} radio"
    */
    'PlayRadioIntent': function () {
        var countrySlot = this.event.request.intent.slots.whichCountry; //Represents the slot that contains the string with the country's name / demonym
        countryName = determineSlotValue(countrySlot); //The actual String which is the country's name / demonym that was extracted from countrySlot using the determineSlotValue() function
        var genreSlot = this.event.request.intent.slots.whichGenre;//Represents the slot that contains the string with the genre name
        genreName = determineSlotValue(genreSlot); //The actual String which is the genre name that was extracted from genreSlot using the determineSlotValue() function

        dictForCountry = dictDirectory[mapSlotToKey(countryName)];// This line assigns the current country dictionary to the dicForCountry reference which is visible to all functions and intents within this file.
    
        if(genreName != "nullslot"){ //checks to see if a genre was even provided?
            var response = playRadio(dictForCountry[genreName]); //response object that makes alexa play radio, playRadio function needs a String "stream URL" to be passed to it. 
            this.context.succeed(response);
        }else{
            var response = playRadio(dictForCountry[defaultGenre(countryName)]);//When no genre is provided, the program chooses a default genre to be played. 
            this.context.succeed(response);
        }
    },
    /*
        Less 'meaty' than 'PlayRadioIntent' but is invoked when the user wants to tune in to a specific station.
    */
    'TuneInIntent': function() {
        var stationSlot = this.event.request.intent.slots.whichStation;
        stationName = determineSlotValue(stationSlot);
        var response = playRadio(stationDict[stationName]);
        this.context.succeed(response);
    },
    /*
        Pauses the current audio stream. 
    */
    'AMAZON.PauseIntent': function () {
        var response = stopRadio(); //Response object that makes Alexa stop the radio. 
        this.context.succeed(response);
    },
    /*
        Resumes the stream, not from where it was paused. It just updates back to the streams current live time. 
    */
    'AMAZON.ResumeIntent': function () {
        if(genreName != "nullSlot"){
            var response = playRadio(dictForCountry[genreName]);
            this.context.succeed(response);
        }else{
            var response = playRadio(dictForCountry[defaultGenre(countryName)]);
            this.context.succeed(response);
        }
    },
    /*
        When the user needs help, "Alexa, help"
    */
    'AMAZON.HelpIntent': function () {
        var speechOutput = "To stream radio, ask ZenoRadio to play a country's radio. For example, you can say, Alexa, ask ZenoRadio to play Haitian radio.";
        this.emit(":tell", speechOutput); //This is how you make alexa say stuff. 
    },
    /*
        When the user tells Alexa to stop, "Alexa, stop"
    */
    'AMAZON.StopIntent': function () {
        var response = stopRadio();
        this.context.succeed(response);
    },
    /*
        When the user tells alexa to cancel, "Alexa, cancel"
    */
    'AMAZON.CancelIntent': function () {
        var response = stopRadio();
        this.context.succeed(response);
    }
};


/*
    This requires the URL to the stream, which must be HTTPS. The URL is accessed by indexing into the proper dictionary.
*/
var playRadio = function(streamURL){
    var response = {
        version: "1.0",
        response: {
            shouldEndSession: true,
            directives: [
                {
                    type: "AudioPlayer.Play", //This directive is sent to the Alexa AudioPlayer when the response is invoked. 
                    playBehavior: "REPLACE_ALL",
                    audioItem: {
                        stream: {
                            url: streamURL,
                            token: "0", 
                            expectedPreviousToken: null,
                            offsetInMilliseconds: 0 //This is the play time offset which will always be 0 because this skill plays live streams, and doesn't play from a specific time in thre stream.
                        }   
                    }
                }       
            ]
        }
    };
    return response;
};

/*
    This also returns a response object but the directive to the AudioPlayer is AudioPlayer.Stop which stops the stream.
*/
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

/*
    Extracts the String value of whatever slot it is provided
*/
var determineSlotValue = function(theSlot){
    var localSlotValue;
    if (theSlot && theSlot.value){
        localSlotValue = theSlot.value.toLowerCase(); //for simplcity we change all the strings to all lower case.
        return localSlotValue;
    }
    return "nullslot"; // we return this string if the slot is empty and doesn't actually have a value, which occurs when the user doesn't specify a genre.
};


/*
    return the three letter key into the dictDirectory[] so the user can say the country's name or demonym and it will still access the dictionary for that specific country. 
*/
var mapSlotToKey = function(countryName){
    if(countryName == "haiti" || countryName == "haitian"){
        return "hti";
    }else if(countryName == "ghana" || countryName == "ghanaian"){
        return "gna";
    }else if(countryName == "guatemala" || countryName == "guatemalan"){
        return "gta";
    }else if(countryName == "mali" || countryName == "malian"){
        return "mli";
    }
    return "error";
};

/*
    returns a String which is the default genre for a given country. This string is used to key into the dictionary for the current country with the default genre.
*/
var defaultGenre = function(countryName){
   if(mapSlotToKey(countryName) == "hti"){
        return "international";    
   }else if(mapSlotToKey(countryName) == "gna"){
        return "news";
   }else if(mapSlotToKey(countryName) == "gta"){
        return "general";
   }else if(mapSlotToKey(countryName) == "mli"){
        return "general";
   }
   return "error";
};






