'use strict'; 

const translate = require('@vitalets/google-translate-api');
const fs = require('fs/promises');
const readline = require('readline');
const lineReader = require('line-reader');
const Promise = require('bluebird');
const eachLine = Promise.promisify(lineReader.eachLine); 

//https://bountify.co/node-js-script-to-translate-srt-file

let file_srt = '';
let file_save_srt = 'text.srt'; 
const filterFileExtension = '.srt';
const fileDrasl = "./srtfile/enskatext.srt";

if(process.argv.length < 3){
  console.log('usage: node ' + process.argv[1] + ' FILENAME');
  process.exit(1); 
}

file_srt = process.argv[2];

function greina(){
  if(file_srt.endsWith(filterFileExtension)) {
    let newFile = { name : file_srt, parts: [] }
    let newLine = {};
    
    eachLine(file_srt, function(line){
      if (line == "") {
        newFile.parts.push(newLine);
        newLine = {};
        //console.log(newFile); 
      } else {
        if (newLine.num === undefined) newLine.num = line; 
        else if (newLine.time === undefined) newLine.time = line; 
        else if (newLine.sentences === undefined) {
          newLine.sentences = [line]
        } else {
          newLine.sentences.push(line);
        } 
      }
    }).then(() => {
      if (newLine.num !== undefined) {
        newFile.parts.push(newLine); 
      }
      //console.log('NewFile: ' + newFile); 
      tyda2(newFile); 
    });
  }
}

async function tyda2(_file){
  console.log(_file); 
  let parts = [];
  let counter = 0; 
  let contents = '';
  _file.parts.forEach(el => {
    if(el.sentences !== undefined && el.sentences.length > 0) {
      contents += el.num + '\r\n'; 
      contents += el.time + '\r\n'; 
      contents += el.sentences.join('\r\n'); 
      contents += '\r\n\r\n';
      /*if (Buffer.byteLength(contents) > 5*1024){
        tyda(contents); 
        contents = ""; 
      }*/
      tyda(el.sentences.join('\r\n'));
      console.log(counter++);
    }
  })
}

async function tyda(enska_setning){
  //console.log(enska_setning); 
  
  await translate( enska_setning, {from: 'en', to: 'is'}).then(res => {
    console.log(res.text); 
    //console.log(res.from.text.autoCorrected);
    
    /*fs.writeFile(file_save_srt, "\ufeff" + res.text, function(err) {
      if(err) {
        return console.log(err);
      }
      console.log('The file saved');
    });*/

  }).catch(err => {
    console.error(err);
  });

}

greina(); 

//console.log(setning); 
//tyda(enska_); 
//let neword = ord.pop(); 
//console.log('pop: ', neword);
