const path = './files/';
const filterFileExtension = ".srt";
const apiURL = 'https://api.deepl.com/v1/translate';
const authKey = 'YOUR_DEEPLY_API_KEY';
var targetLang = "PL"

const fs = require('fs');
const readline = require('readline');
const lineReader = require('line-reader');
const Promise = require("bluebird");
const axios = require('axios');
const eachLine = Promise.promisify(lineReader.eachLine);

if (process.argv.length == 3) {
  targetLang = process.argv[2]
}
init();

function init() {
  fs.readdir(path, (err, files) => {
    files.forEach(file => {
      if (file.endsWith(filterFileExtension)) {
        var newFile = { name: file, parts: [] }
        var newLine = {};
        eachLine(path + file, function(line) {
          if (line == "") {
            newFile.parts.push(newLine);
              newLine = {};
          } else {
            if (newLine.num === undefined) newLine.num = line;
            else if (newLine.time === undefined) newLine.time = line;
            else if (newLine.sentences === undefined) {
              newLine.sentences = [line]
            } else {
              newLine.sentences.push(line)
            }
          }
        }).then(() => {
          if (newLine.num !== undefined) {
            newFile.parts.push(newLine);
          }
          translate(newFile)
        });
    }
    });
  });

  function translate(_file) {
    var parts = [];
    var content = "";
    _file.parts.forEach(el => {
      if (el.sentences !== undefined && el.sentences.length > 0) {
        content += el.num + "\r\n";
        content += el.time + "\r\n";
        content += el.sentences.join("\r\n");
        content += "\r\n\r\n";
        if (Buffer.byteLength(content) > 5*1024) {
          parts.push(getApiRequest(content));
          content = ""
        }
      }
    })

    if (content != "") {
      parts.push(getApiRequest(content));
    }
    console.log(`translating ${_file.name} to ${targetLang}`);
    axios.all(parts).then(function(values) {
      var newFileName = path + _file.name.split('.')[0] + '-' + targetLang + '.srt';
      values.forEach(val => {
        fs.appendFileSync(newFileName, val.data.translations[0].text);
      })
      console.log(`completed ${newFileName} to ${targetLang}`);
    });

  }

  function getApiRequest(text) {
    return axios
        .get(apiURL, { params: {
          text: text,
          target_lang: targetLang,
          auth_key: authKey
        }});
  }
}
