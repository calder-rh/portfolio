import { glob } from 'glob';
import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'

const settingsPaths = await glob('src/assets/**/*.yaml')
const imagePaths = await glob('src/assets/**/*.{jpeg,jpg,png,gif,svg}')

const settingsName = '_settings.yaml'

function pathDepth(p) {
  const normalized = path.normalize(p);
  return normalized
    .split(path.sep)
    .filter(Boolean)
    .length;
}

settingsPaths.sort((a, b) => {
  const depthDiff = pathDepth(a) - pathDepth(b)
  if (depthDiff != 0) return depthDiff
  else return (path.basename(b) === settingsName) - (path.basename(a) === settingsName) 
})

const rules = []
for (let settingsPath of settingsPaths) {
  const data = yaml.load(fs.readFileSync(settingsPath))
  if (path.basename(settingsPath) === settingsName) {
    for (let imagePath in data) {
      rules.push({
        globStr: path.join(path.dirname(settingsPath), imagePath) + '.{jpeg,jpg,png,gif,svg}',
        settings: data[imagePath]
      })
    }
  } else {
    rules.push({  
      globStr: settingsPath.match(/^(.+)\.yaml$/)[1] + '.{jpeg,jpg,png,gif,svg}',
      settings: data
    })
  }
}

export const imageSettings = {}
for (let {globStr, settings} of rules) {
  const imagePaths = await glob(globStr)
  for (let imagePath of imagePaths) {
    const imagePathWithSlash = '/' + imagePath
    if (!imageSettings[imagePathWithSlash]) imageSettings[imagePathWithSlash] = {}
    for (let setting in settings) {
      imageSettings[imagePathWithSlash][setting] = settings[setting]
    }
  }
}