#!/usr/bin/env node

// Run this command with:
//   npm run version -- 0.1.2
// Where the number after the dashes is the version number
// you want to increment to.

var fs = require('fs');

var versionNumber = process.argv[2];

var updateVersionInFile = function updateVersionInFile(filePath, versionNumber){
    var fileContents = JSON.parse(
        fs.readFileSync(filePath, 'utf8')
    );
    fileContents.version = versionNumber;
    fs.writeFileSync(
        filePath,
        JSON.stringify(fileContents, null, 2)
    )
}

updateVersionInFile('./src/manifest.json', versionNumber);
updateVersionInFile('./package.json', versionNumber);
