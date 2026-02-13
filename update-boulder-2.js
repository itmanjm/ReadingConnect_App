import fs from 'fs'
const path = '/Users/zero/Documents/Projects/Atlas/.sisyphus/boulder.json'

const boulder = JSON.parse(fs.readFileSync(path, 'utf8'))
boulder.progress = '1/37'

fs.writeFileSync(boulderPath, JSON.stringify(boulder, null, 2))
console.log('Updated boulder.json with progress 1/37')
