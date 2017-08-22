# ZenoRadio-Alexa-Skill
A skill for Amazon Alexa, using the Alexa Skills Kit.

Clone this Repo, then refer to this tutorial https://github.com/alexa/skill-sample-nodejs-trivia to learn how to set up
an alexa skill. This will help you learn how to setup a skill in the Amazon Developer Console and
make an AWS Lambda Function for it. Once you set up the generic outline of a skill you need to change some things around
to get the ZenoRadio skill working. Some of the following might already be implemented / selected in your skill.


In the "skill information" tab: 
-Select "custom" for skill type
-Select "English (U.S.)" for language
-Name the skill "ZenoRadio" 
-Make the invocation name "xeno". Then you can pronounce it like "Zeeno". If you made the invocation "Zeno", you would have to 
pronounce it "Zeyno" when playing with it on the echo. 
-Select "Yes" for "Audio Player" in the global fields. 

In the "interation model" tab:
-Copy the contents of intentschema.txt when creating the intent schema.
-Create three custom slot types, "country", "genre" and "station"
-For the custom slot country, enter the slot values by copying the contents of countryslotvalues.txt, then do 
the same for the other custom slots with their respective txt files. You can tell which files are for which slots
by the file names. 
-Copy the contents of sampleuterances.txt into the sample utterance field

Make sure your Lambda location is set to US East (N. Virginia)

Read the comments in index.js to understand how the code works.

Also, when adding streams, most moundpoints are served through HTTP which cannot be played by the AudioPlayer interface.
To get around this, save the stream as an m3u file, create an s3 bucket with Amazon Web Services and upload the m3u file there. Amazon will provide you with an HTTPS link to the file which is now the stream URL. I've included a sample m3u file for you to download, open up in a text editor, then replace the link with whatever link you have. Save the file with the .m3u extension. 

Tips: 

-When uploading your zip file to your lambda function, select all the files and compress them together, don't compress the 
the folder they're in. 

-For some reason Alexa won't recognize certain countries so you have to pronounce them weirdly. When saying "Ghana",
pronounce the first "a" in "Ghana" the same as you would in the word "apple" instead of like the "a" in "car". 
Also it completely doesn't understand when I say "Mali" or "Malian", and there's no way to pronounce it to make it understand. I'm trying to figure out a way to fix it, but until then....

To actually use the skill say "Alexa, tell zeno to..." followed by the command you want it to do.

Example commands:

"Alexa, tell zeno to play haitian radio"
"Alexa, ask zeno to stream Ghanaian news"
"Alexa, tell zeno to give me Guatemalan music"
"Alexa, tell zeno to tune in to Shalom Haiti"

To whoever ends up continuing this: email me if you have questions - jbrooks2@oswego.edu
