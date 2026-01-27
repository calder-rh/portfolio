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

const edgeNames = ['top', 'bottom', 'left', 'right']

function processEdges(rawSettings) {
  const rawEdges = rawSettings.edges
  if (!rawEdges) return

  const processedEdges = {}

  if (typeof rawEdges === 'number') {
    for (let edgeName of edgeNames) {
      processedEdges[edgeName] = rawEdges
    }
  } else {
    let horz, vert, edge
    if ((horz = rawEdges.horz) !== undefined) {
      processedEdges.left = horz
      processedEdges.right = horz
    }
    if ((vert = rawEdges.vert) !== undefined) {
      processedEdges.top = vert
      processedEdges.bottom = vert
    }
    for (let edgeName of edgeNames) {
      if ((edge = rawEdges[edgeName]) !== undefined) processedEdges[edgeName] = edge
    }
  }

  rawSettings.edges = processedEdges
}

function addSettingLayer(settings, layer) {
  if ('alt' in layer) settings.alt = layer.alt
  if ('shadow' in layer) settings.shadow = layer.shadow
  if ('edges' in layer) {
    if (settings.edges === undefined) settings.edges = {}
    for (let edgeName in layer.edges) {
      settings.edges[edgeName] = layer.edges[edgeName] 
    }
  }
}

const rawSettingses = {}
for (let {globStr, settings} of rules) {
  const imagePaths = await glob(globStr)
  for (let imagePath of imagePaths) {
    const imagePathWithSlash = '/' + imagePath
    if (!rawSettingses[imagePathWithSlash]) rawSettingses[imagePathWithSlash] = {}
    const rawSettings = rawSettingses[imagePathWithSlash]
    if (('alt' in settings) || ('edges' in settings) || ('shadow' in settings)) settings = {default: settings}
    for (let context in settings) {
      if (!rawSettings[context]) rawSettings[context] = {}
      processEdges(settings[context])
      addSettingLayer(rawSettings[context], settings[context])
    }
  }
}

const globalDefaults = {
  alt: "",
  shadow: false,
  edges: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
}

export async function getSettings(imagePath, context="default") {
  const isTest = imagePath.match(/calligraphic_preview\.png/)

  const cascade = [globalDefaults]
  if (rawSettingses[imagePath]) {
    const localDefault = rawSettingses[imagePath].default
    if (localDefault) cascade.push(localDefault)
    if (context !== "default") {
      const contexts = (Array.isArray(context) ? context : [context])
      for (let context of contexts) {
        const contextSettings = rawSettingses[imagePath][context]
        if (contextSettings) cascade.push(contextSettings)
      }
    }
  }

  const rawSettings = {}
  for (let layer of cascade) {
    addSettingLayer(rawSettings, layer)
  }

  const processedSettings = {}

  processedSettings.alt = rawSettings.alt
  processedSettings.shadow = rawSettings.shadow

  const edges = {}
  for (let edgeName of edgeNames) {
    edges[edgeName] = rawSettings.edges[edgeName] / 100;
  }

  const { width, height } = await imageSizeFromFile(imagePath.slice(1))
  const rawAspect = width / height
  const scaleFactor = 1 / (1 + edges.left + edges.right)
  const translateX = edges.left * scaleFactor * 100
  const adjustedAspect = 1 / (scaleFactor * (1 / rawAspect + edges.top + edges.bottom))
  const translateY = edges.top * scaleFactor * 100 * adjustedAspect

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
