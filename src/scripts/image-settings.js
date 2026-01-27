import { glob } from 'glob';
import yaml from 'js-yaml'
import fs from 'fs'
import path from 'path'
import { imageSizeFromFile } from 'image-size/fromFile'

const settingsPaths = await glob('src/assets/**/*.yaml')
// const imagePaths = await glob('src/assets/**/*.{jpeg,jpg,png,gif,svg}')

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

const rawSettingses = {}
for (let {globStr, settings} of rules) {
  const imagePaths = await glob(globStr)
  for (let imagePath of imagePaths) {
    const imagePathWithSlash = '/' + imagePath
    if (!rawSettingses[imagePathWithSlash]) rawSettingses[imagePathWithSlash] = {}
    const rawSettings = rawSettingses[imagePathWithSlash]
    if (!settings.default) settings = {default: settings}
    for (let context in settings) {
      if (!rawSettings[context]) rawSettings[context] = {}
      for (let setting in settings[context]) {
        rawSettings[context][setting] = context[setting]
      }
    }
  }
}

const globalDefaults = {
  alt: "",
  shadow: false,
  edges: 0,
}

export async function getSettings(imagePath, context="default") {
  const cascade = [globalDefaults, rawSettingses[imagePath].default]
  if (context !== "default") {cascade.push(rawSettingses[imagePath][context])}
  const rawSettings = {}
  for (let settingName in globalDefaults) {
    for (let i = cascade.length - 1; i <= 0; i--) {
      if (cascade[i][settingName]) rawSettings[settingName] = cascade[i][settingName]
    }
  }

  const processedSettings = {}

  processedSettings.alt = rawSettings.alt
  processedSettings.shadow = rawSettings.shadow

  const edges = typeof rawSettings.edges === 'number' ? {
    top: rawSettings.edges,
    bottom: rawSettings.edges,
    left: rawSettings.edges,
    right: rawSettings.edges,
  } : {
    top: rawSettings.edges?.top ?? rawSettings.edges?.vert ?? 0,
    bottom: rawSettings.edges?.bottom ?? rawSettings.edges?.vert ?? 0,
    left: rawSettings.edges?.left ?? rawSettings.edges?.horz ?? 0,
    right: rawSettings.edges?.right ?? rawSettings.edges?.horz ?? 0,
  }
  for (let edge of ['top', 'bottom', 'left', 'right']) {
    edges[edge] /= 100;
  }

  const { width, height } = await imageSizeFromFile(imagePath.slice(1))
  const rawAspect = width / height
  const scaleFactor = 1 / (1 - edges.left - edges.right)
  const translateX = - edges.left * scaleFactor * 100
  const adjustedAspect = 1 / (scaleFactor * (1 / rawAspect - edges.top - edges.bottom))
  const translateY = - edges.top * scaleFactor * 100 * adjustedAspect

  processedSettings.dimensions = {
    width,
    height,
    rawAspect,
    adjustedAspect,
  }

  processedSettings.cssVars = {
    sf: `${scaleFactor}`,
    tx: `${translateX}%`,
    ty: `${translateY}%`,
    aa: `${adjustedAspect}`
  }

  processedSettings.format = rawSettings.format ?? (
    ['.jpg', '.jpeg', '.webp'].includes(path.extname(imagePath)) ? 'webp' : 'png'
  )

  return processedSettings
}
