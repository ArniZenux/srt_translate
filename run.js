// Version 0.1
// Author: Arni Ingi Johannesson

const fs = require('fs');
const path = require('path');
const translate = require('@vitalets/google-translate-api');

let file_srt = ''; 
let readsrt = '';
const input = 'input';
const input_ = './input/';
const output = 'output';
const output_ = './output/';
const filterFileExtension = '.srt';

const dir_input = path.join(__dirname, input);
const dir_output = path.join(__dirname, output);



function checkInput() {
  if(fs.existsSync(dir_input)) {
    return true; 
  } else { 
    console.log('Program stop. Make input-folder and run program again');
    fs.mkdirSync(dir_input, { recursive: true });
    return false; 
  }
}

function checkOutput() {
  if(fs.existsSync(dir_output)) {
    return true; 
  } else { 
    console.log('Program stop. Make output-folder and run program again');
    fs.mkdirSync(dir_output, { recursive: true });
    return false;
  }
}

function readFolder(){
  const data = fs.readdirSync(dir_input, { encoding: 'utf-8'});
  if(data.length === 0){
    console.log('Input-folder is empty, please add srt-file');
  } else {
    data.forEach(function(file) {
    if(file.endsWith(filterFileExtension)) {
      console.log('srt file exist');
      file_srt = data.join(); 
    } else {
      console.log('srt file not exist. Only srt file');
    }
   })
  }
}

function readFile(zfile_srt) {
  let newFile = { name : file_srt, parts: [] }
  let newLine = {};
  
  const zfile = fs.readFileSync(zfile_srt, 'utf-8');

  zfile.split(/\r?\n/).forEach(line => {
    if (line === ""){
      newFile.parts.push(newLine);
      newLine = {};
    } else {
      if (newLine.num === undefined) newLine.num = line;
      else if (newLine.time === undefined) newLine.time = line; 
      else if (newLine.sentences === undefined) { 
        newLine.sentences = [line];
      } else {
        newLine.sentences.push(line); 
      }
    }
  });

  readOnlyTextLine(newFile); 
}

async function thyda(contents, _newfile, makeNewSrt) {
  let teljari = 0; 
  let tyding_setning = ''; 
  let newcontents = '';
  
  let res = await translate(contents, {from: 'en', to: 'is'});
  tyding_setning += res.text; 
    
  console.log(tyding_setning); 
  console.log(makeNewSrt); 
  /*tyding_setning.split(/\r?\n/).forEach(line => {
    teljari++;
    _newfile.parts[teljari].sentences = `${line}`;  //replace. 
  });

  _newfile.parts.forEach(line => {
    if(line.sentences !== undefined && line.sentences.length > 0) {
      newcontents += line.num + '\r\n';
      newcontents += line.time + '\r\n';
      newcontents += line.sentences + '\r\n';
      newcontents += '\r\n';
    }
  });
  
  fs.appendFileSync(makeNewSrt, newcontents);
  */
}

function readOnlyTextLine(_newfile) {
  let contents = '';

  let makeNewSrt = path.join(__dirname, output_ +  file_srt + '_ice.srt');
  
  if( fs.existsSync(makeNewSrt) ) {
    fs.unlinkSync(makeNewSrt);
    _newfile.parts.forEach(item => {
    if(item.sentences !== undefined && item.sentences.length > 0) {
      contents += item.sentences.join('\r\n'); 
      contents += '\r\n';
    }
   })

   thyda(contents, _newfile, makeNewSrt); 

  } else {
    _newfile.parts.forEach(item => {
      if(item.sentences !== undefined && item.sentences.length > 0) {
        contents += item.sentences.join('\r\n'); 
        contents += '\r\n';
      }
    })

    thyda(contents, _newfile, makeNewSrt);

  }
}

function main() {
  if( checkInput() ){
    readFolder(); 
  } 
  
  if(checkOutput() ) {
    if( file_srt.length > 0 ){
      readsrt = path.join(__dirname,  input_ + file_srt);
      readFile(readsrt); 
    }
  }
}

main();
