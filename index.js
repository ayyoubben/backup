const EPub = require("epub2").EPub;
const axios = require("axios");
const {extractTo} = require("./EPUBToText");
const models = require("./models");
const SPARQL = require("sparql-client-2");

const epubfile = "./epubs/dickens_un_drame_sous_la_revolution.epub"
const imagewebroot = "./images"
const chapterwebroot = "./links" 
const textFolder = "./textFolder" 
const convert = require('xml-js');

const {addEpub} = models
const path = require('path');
const fs = require('fs');
const xl = require('excel4node');
const wb = new xl.Workbook();
const ws = wb.addWorksheet('Worksheet Name'); 

function levenshtein(str1, str2) {
  let dp = [];

  for (let i = 0; i <= str1.length; i++) {
    dp[i] = [];
    for (let j = 0; j <= str2.length; j++) {
      if (i === 0) {
        dp[i][j] = j;
      } else if (j === 0) {
        dp[i][j] = i;
      } else if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i][j - 1], dp[i - 1][j], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[str1.length][str2.length];
}

function matchPercentage(str1, str2) {
  let maxLength = Math.max(str1.length, str2.length);
  let levenshteinDistance = levenshtein(str1, str2);

  return ((maxLength - levenshteinDistance) / maxLength * 100).toFixed(2);
}

//Extraire
const epubFunction = () => {
  const directoryPath = path.join(__dirname, 'epubs');
  let data = []
  fs.readdir(directoryPath,async (err, files) => {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    }

    for (var i = 0; i < files.length; i++) {
      let dataepub = await EPub.createAsync("epubs/"+files[i], imagewebroot, chapterwebroot);
      
      const mdata = JSON.stringify(dataepub.metadata)
      data.push(JSON.parse(mdata))
    }

    let headingColumnNames = []
    for (var i = 0; i < data.length; i++) {
      headingColumnNames = headingColumnNames.concat(Object.keys(data[i]))
      headingColumnNames = headingColumnNames.filter((item, pos) => headingColumnNames.indexOf(item) === pos);      
    }
    //console.log(headingColumnNames);
    let headingColumnIndex = 1;
    for (var i = 0; i < headingColumnNames.length; i++){  
      ws.cell(1, headingColumnIndex++).string(headingColumnNames[i])
    };
    let rowIndex = 2;
    data.forEach( record => {
      //let columnIndex = 1;
      Object.keys(record).forEach(columnName =>{
        let columnIndex = headingColumnNames.indexOf(columnName)
        columnIndex++
        ws.cell(rowIndex,columnIndex++)
          .string(record[columnName])
        });
      rowIndex++;
    });
    wb.write('filename1.xlsx');
  });
}
epubFunction()
/*
const headingColumnNames = [
  "Name",
  "Email",
  "Mobile",
]
let headingColumnIndex = 1;
    headingColumnNames.forEach(heading => {
        ws.cell(1, headingColumnIndex++)
            .string(heading)
    });
    let rowIndex = 2;
    data.forEach( record => {
        let columnIndex = 1;
        Object.keys(record ).forEach(columnName =>{
            ws.cell(rowIndex,columnIndex++)
                .string(record [columnName])
        });
        rowIndex++;
    });
    wb.write('filename.xlsx');


*/




//verification
/*
let titleepub = ''
const lg = 'fr'
const getBreeds = async () => {
    try {
      return await axios.get('https://www.googleapis.com/books/v1/volumes?q=title:'+titleepub+'lg:'+lg)
    } catch (error) {
      console.error(error)
    }
  }
  
  var title = ''
  var subtitle = ''
  var authors = ''
  var printType = ''
  var pageCount = ''
  var publisher = ''
  var publishedDate = ''
  var webReaderLink = ''

  const countBreeds = async () => {
    const bk = await getBreeds()
    const book = bk.data.items[0]

    if (book) {
        //console.log(`Got ${Object.entries(breeds.data.message).length} breeds`)
        title = book['volumeInfo']['title'];
        subtitle = book['volumeInfo']['subtitle'];
        authors = book['volumeInfo']['authors'];
        printType = book['volumeInfo']['printType'];
        pageCount = book['volumeInfo']['pageCount'];
        publisher = book['volumeInfo']['publisher'];
        publishedDate = book['volumeInfo']['publishedDate'];
        webReaderLink = book['accessInfo']['webReaderLink'];
    }
  }
  countBreeds().then(() => {
    console.log({title , subtitle ,authors });
  })
 */
const title = "où es-tu"
const authorName = "marc levy"
const getInfoCatalogue = async (title, author) => {
  try {
    //return await axios.get("https://www.googleapis.com/books/v1/volumes?q=inauthor:"+authorName+"+intitle:"+title)
    //https://gallica.bnf.fr/SRU?operation=searchRetrieve&version=1.2&query=(dc.creator%20any%20%22charles%20dickens%22)and(dc.title%20any%20%22un%20drame%20sous%20la%20revolution%22)
    //https://www.googleapis.com/books/v1/volumes?q=inauthor:%22patrick%20rambaud%22&intitle:%22la%20bataille%22&printType=books
    //https://www.googleapis.com/books/v1/volumes?q=inauthor:%22marcel%20proust%22+intitle:%22du%20c%C3%B4t%C3%A9%20de%20chez%20Swann%22
    //https://catalogue.bnf.fr/api/SRU?version=1.2&operation=searchRetrieve&query=(bib.author%20adj%20%22patrick%20rambaud%22)%20and%20(bib.title%20adj%20%22la%20bataille%22)
    return await axios.get(`https://catalogue.bnf.fr/api/SRU?version=1.2&operation=searchRetrieve&query=(bib.author%20adj%20%22${author}%22)%20and%20(bib.title%20adj%20%22${title}%22)`)
  } catch (error) {
    throw new Error(error)
  }
}

const getInfoCatalogueAny = async (title, author) => {
  try {
    //return await axios.get("https://www.googleapis.com/books/v1/volumes?q=inauthor:"+authorName+"+intitle:"+title)
    //https://gallica.bnf.fr/SRU?operation=searchRetrieve&version=1.2&query=(dc.creator%20any%20%22charles%20dickens%22)and(dc.title%20any%20%22un%20drame%20sous%20la%20revolution%22)
    //https://www.googleapis.com/books/v1/volumes?q=inauthor:%22patrick%20rambaud%22&intitle:%22la%20bataille%22&printType=books
    //https://www.googleapis.com/books/v1/volumes?q=inauthor:%22marcel%20proust%22+intitle:%22du%20c%C3%B4t%C3%A9%20de%20chez%20Swann%22
    //https://catalogue.bnf.fr/api/SRU?version=1.2&operation=searchRetrieve&query=(bib.author%20adj%20%22patrick%20rambaud%22)%20and%20(bib.title%20adj%20%22la%20bataille%22)
    return await axios.get(`https://catalogue.bnf.fr/api/SRU?version=1.2&operation=searchRetrieve&query=(bib.author%20adj%20%22${author}%22)%20and%20(bib.title%20any%20%22${title}%22)`)
  } catch (error) {
    throw new Error(error)
  }
}

const getInfoOpenLibrary = async (title, author) => {
  let foundSubject = false
  let foundFirstPublishYear = false
  let subject = ""
  let firstPub = ""
  const result = await axios.get(`https://openlibrary.org/search.json?title=${title}&author=${author}`)
  if(result.data.numFound) {
    console.log(result.data.numFound);
    let i = 0
    while((!foundFirstPublishYear || !foundSubject) && i < result.data.docs.length) {
      if(result.data.docs[i].subject) {
        subject = result.data.docs[i].subject
        foundSubject = true
      }
      if(result.data.docs[i].first_publish_year){
        firstPub = result.data.docs[i].first_publish_year
        foundFirstPublishYear = true
      }
      i++
    }
    if(foundFirstPublishYear && foundSubject) {
      return {first_publish_yearOpenLibrary: `${firstPub}`, subjectOpenLibrary: `${subject}`}
    }
  }
  return {first_publish_yearOpenLibrary: "", subjectOpenLibrary: ""}
}

const verification = async (title, author, nomFichier) => {
  const bk = await getInfoCatalogue(title, author)
  let titleCatalogue = ''
  let typeAny = false
  let records = []
  let percentages = []

  let xmlData = convert.xml2json(bk.data, {
    compact: true,
    space: 4
  });
  let obj = JSON.parse(xmlData)

  if(obj['srw:searchRetrieveResponse']['srw:numberOfRecords']['_text'] == 0) {
    const bk = await getInfoCatalogue(nomFichier, author)
    let xmlData = convert.xml2json(bk.data, {
      compact: true,
      space: 4
    });
    obj = JSON.parse(xmlData)
  }

  if(obj['srw:searchRetrieveResponse']['srw:numberOfRecords']['_text'] > 0) {
    records = obj['srw:searchRetrieveResponse']['srw:records']['srw:record'].map(record => record['srw:recordData']);
  }

  if(obj['srw:searchRetrieveResponse']['srw:numberOfRecords']['_text'] == 0) {
    const bk = await getInfoCatalogueAny(title, author)
    let xmlData = convert.xml2json(bk.data, {
      compact: true,
      space: 4
    });
    obj = JSON.parse(xmlData)
    typeAny = true
    if(obj['srw:searchRetrieveResponse']['srw:numberOfRecords']['_text'] > 0) {
      records = obj['srw:searchRetrieveResponse']['srw:records']['srw:record'].map(record => record['srw:recordData'])
      let i = 0
      while(i < records.length) {
        let k = 0
        while(k < records[i]['mxc:record']['mxc:datafield'].length) {
          if(records[i]['mxc:record']['mxc:datafield'][k]['_attributes']['tag'] == "200"){
            let l = 0
            while(l < records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'].length) {
              if(records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'][l]['_attributes']['code'] == "a") {
                percentages.push({title: records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'][l]['_text'], percentage: matchPercentage(records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'][l]['_text'].toLowerCase(), title.toLowerCase())})
              }
              l++
            }
          }
          k++
        }
        i++
      }
    } 
  }
  
  if(percentages.length) {
    const maxPercentage = percentages.reduce((max, curr) => (Number(curr.percentage) > Number(max.percentage) ? curr : max));
    titleCatalogue = maxPercentage.title
    console.log(titleCatalogue);
  }
  return { records, titleCatalogue, typeAny}
}

async function getGender(fullName) {
  const sources = [
    //{ url: "https://data.bnf.fr/sparql", prefix: "RDAgroup2elements" },
    { url: "https://data.bnf.fr/sparql", prefix: "foaf" },
    //{ url: "http://dbpedia.org/sparql", prefix: "rdf" },
    //{ url: "http://dbpedia.org/sparql", prefix: "owl" },
    //{ url: "https://query.wikidata.org/sparql", prefix: "wikidata" }
  ];
  for (const source of sources) {
    const client = new SPARQL(source.url);
    const query = `
      PREFIX ${source.prefix}: <http://xmlns.com/${source.prefix}/0.1/>
      PREFIX bio: <http://vocab.org/bio/0.1/>
      SELECT  ?gender   
      WHERE {
          ?auteur ${source.prefix}:gender ?gender.
          ?auteur ${source.prefix}:name  '${fullName}'.
      }
      LIMIT 100
    `;
    const result = await client.query(query, { accept: 'application/sparql-results+json' });
    const results = result.results.bindings;
    if (results.length) {
      return results[0].gender.value;
    }
  }
  return "";
}

const getInfo = async (title, author, nomFichier) => {
  let foundLangue = false
  let foundTraducteur = false
  let foundFirstName = false
  let foundLastName = false
  let foundDates = false
  let foundType = false
  let langueCatalog = ""
  let traducteurCatalog = ""
  let authorFirsNameCatalog = ""
  let authorLastNameCatalog = ""
  let authorDatesCatalog = ""
  let typeCatalog = ""

  const obj = await verification(title, author, nomFichier)
  
  if(obj.records.length > 0) {
    if(obj.typeAny) {
      foundLangue = true
      foundTraducteur = true
      foundType = true
    }

    let i = 0
    while((!foundLangue || !foundFirstName || !foundLastName || !foundDates || !foundTraducteur || !foundType) && i < obj.records.length) {
      let k = 0
      while(k < obj.records[i]['mxc:record']['mxc:datafield'].length) {
        if((!foundTraducteur || !foundType) && obj.records[i]['mxc:record']['mxc:datafield'][k]['_attributes']['tag'] == "200" && !obj.typeAny){
          let l = 0
          while((!foundTraducteur || !foundType) && l < obj.records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'].length) {
            if(obj.records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'][l]['_attributes']['code'] == "a") {//title
              obj.titleCatalogue = obj.records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'][l]['_text']
            } else if(obj.records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'][l]['_attributes']['code'] == "g") {//traducteur
              traducteurCatalog = obj.records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'][l]['_text']
              foundTraducteur = true
            } else if(obj.records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'][l]['_attributes']['code'] == "e") {//type
              typeCatalog = obj.records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'][l]['_text']
              foundType = true
            }
            l++
          }
        } else if(!foundLangue && obj.records[i]['mxc:record']['mxc:datafield'][k]['_attributes']['tag'] == "101" && !obj.typeAny){// a et c
          if(Array.isArray(obj.records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'])) {
            let l = 0
            while(!foundLangue && l < obj.records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'].length) {
              if(!foundLastName && obj.records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'][l]['_attributes']['code'] == "c"){
                langueCatalog = obj.records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'][l]['_text']
                foundLangue = true    
              }
              l++
            }
          } else if(typeof(obj.records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield']) == 'object') {
            langueCatalog = obj.records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield']['_text']
            foundLangue = true
          }
        } else if((!foundFirstName || !foundLastName || !foundDates) && obj.records[i]['mxc:record']['mxc:datafield'][k]['_attributes']['tag'] == "700"){
          let l = 0
          while((!foundFirstName || !foundLastName || !foundDates) && l < obj.records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'].length) {
            if(!foundLastName && obj.records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'][l]['_attributes']['code'] == "a") {//nom
              authorLastNameCatalog = obj.records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'][l]['_text']
              foundLastName = true
            } else if(!foundFirstName && obj.records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'][l]['_attributes']['code'] == "b") {//prenom
              authorFirsNameCatalog = obj.records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'][l]['_text']
              foundFirstName = true
            } else if(!foundDates && obj.records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'][l]['_attributes']['code'] == "f") {//dates (birth, death)
              authorDatesCatalog = obj.records[i]['mxc:record']['mxc:datafield'][k]['mxc:subfield'][l]['_text']
              foundDates = true
            }
            l++
          }
        }
        k++
      }
      i++
    }
  }
  const openLibrary = await getInfoOpenLibrary(title, author)
  const genderDataBnf = await getGender(authorFirsNameCatalog+" "+authorLastNameCatalog)
  return {traducteurCatalog, authorFirsNameCatalog, authorLastNameCatalog, authorDatesCatalog, typeCatalog, langueCatalog, titleCatalogue: obj.titleCatalogue, first_publish_yearOpenLibrary: openLibrary.first_publish_yearOpenLibrary, subjectOpenLibrary: openLibrary.subjectOpenLibrary, genderDataBnf}
}

async function main() {
  const infos = await getInfo("La bataille", "Patrick Rambaud", "")
  console.log(infos)
}

main()
/*//Transformer epub to txt
extractTo(epubfile,textFolder , (err) => {
  console.log(err);
})*/