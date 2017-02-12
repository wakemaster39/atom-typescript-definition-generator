import * as fs from 'fs'
import * as path from 'path'
import * as atomdoc from 'atomdoc'
require('coffee-script/register');
import * as donna from 'donna'
import * as tello from 'tello'
import {ClassGenerator} from './writeMethods'

const atomDirectory: string = path.resolve(__dirname, "../../atom")
console.log(atomDirectory)

// let metadata = donna.generateMetadata([atomDirectory])
// let digestedMetadata = tello.digest(metadata)
// let api = JSON.stringify(digestedMetadata, null, 2)
//
// fs.writeFileSync("api.json", api, 'utf8')

let api:AtomDocTypes.Metadata = JSON.parse(fs.readFileSync("api.json", 'utf8'))
let generators: ClassGenerator[] = []

for(let klass in api.classes){
  let generator = new ClassGenerator(api.classes[klass])
  generator.generate();
  generators.push(generator)
}

const outputFile = fs.createWriteStream("output", {"flags": 'w'})
for(let generator of generators){
    for(let line of generator.generatedData){
      outputFile.write(line)
    }
}
outputFile.end()




















function getAllFilesInSubdirectory(directory: string): string[] {
    if (!fs.lstatSync(directory).isDirectory()) {
        console.log(`${directory} is not a valid directory unable to retrieve files`)
        return [];
    }

    let allFiles: string[] = []

    for (let file of fs.readdirSync(directory)) {
        let cpath = path.resolve(directory, file)
        let info = fs.statSync(cpath)
        if (info.isDirectory()) {
            allFiles = allFiles.concat(getAllFilesInSubdirectory(cpath))
        } else {
            allFiles.push(cpath)
        }
    }
    return allFiles
}
