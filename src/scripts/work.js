function setURLTag(element, tag) {
  const hyphenTag = tag.replace(' ', '-')
  const url = new URL(window.location.href)
  url.searchParams.set('tag', hyphenTag)
  window.history.pushState({}, '', url)
  let pageTitle = element.dataset.titleName
  document.title = `${pageTitle} – Calder Ruhl Hansen`
}

function getURLTag() {
  const url = new URL(window.location.href)
  return (url.searchParams.get('tag') || 'all').replace('-', ' ')
}



const cols = document.getElementById('work-cols')
const workTagContainer = document.querySelector('#tags')
const workTags = document.querySelectorAll('.work-tag')
const workItems = document.querySelectorAll('.work-item')
const nonDraftWorkItems = document.querySelectorAll('.work-item:not(.draft)')
const workItemArray = Array.from(workItems)
const tagDict = {}
for (let tag of workTags) {
  tagDict[tag.dataset.slug] = tag
}

const allTagIntroContainer = document.getElementById('tag-intro-container')
const currentIntroContainer = document.getElementById('tag-intro-current')
const incomingIntroContainer = document.getElementById('tag-intro-incoming')
const tagIntroWaitingRoom = document.getElementById('tag-intro-waiting-room')
const tagIntros = document.querySelectorAll('.tag-intro')
const tagIntroDict = {}
for (let tagIntro of tagIntros) {
  tagIntroDict[tagIntro.dataset.slug] = tagIntro
}


function remToPx(rem) {    
  return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function columnWidth() {
  const numColumns = cols.querySelectorAll('.column').length
  const columnGap = 20
  const columnsWidth = cols.querySelector('.columns').offsetWidth 
  const columnWidth = (columnsWidth - (columnGap * (numColumns - 1))) / numColumns
  return columnWidth
}

function contentWidth() {
  return columnWidth() - remToPx(3)
}

const totalImages = document.querySelectorAll('.work-images').length

let loadedImageSections = 0
let totalImageSections = document.querySelectorAll('.work-images').length

function imageLoad() {
  if (totalImages === 0) {
    resizeWorkItems()
  } else {
    loadedImageSections = 0
    for (let item of document.querySelectorAll('.work-images')) {  
      const images = item.querySelectorAll('img')
      const total = images.length
      let loaded = 0
      function loadOne() {
        loaded++
        if (loaded == total) layoutImages(item)
      }
      for (let image of images) {
        if (image.complete) loadOne()
        else image.addEventListener('load', () => loadOne())
      }
    }
  }
}



function layoutImages(item) {
  const images = item.querySelectorAll('img')
  const rows = item.querySelector('.image-rows')
  const waitingRoom = item.querySelector('.image-waiting-room')
  const gap = remToPx(0.6)
  const defaultImageHeight = remToPx(10)
  const rowWidth = contentWidth()

  for (let image of images) {
    waitingRoom.append(image)
  }
  rows.innerHTML = ''


  let currentWidth
  let gapCount
  function setupRow() {
    const row = document.createElement('div')
    row.className = 'image-row'
    rows.prepend(row)
    currentWidth = 0
    gapCount = 0
    return row
  }

  function resizeRow() {
    const gaplessImageWidth = currentWidth - gapCount * gap
    const gaplessRowWidth = rowWidth - gapCount * gap
    const scaleRatio = gaplessRowWidth / gaplessImageWidth
    const finalHeight = defaultImageHeight * scaleRatio
    currentRow.style.height = `${finalHeight}px`
  }

  let currentRow = setupRow()

  let firstIteration = true
  for (let index = images.length - 1; index >= 0; index--) {
    const image = images[index]
    const aspectRatio = image.naturalWidth / image.naturalHeight
    const imageWidth = aspectRatio * defaultImageHeight
    const nextWidth = currentWidth + imageWidth + (firstIteration ? 0 : gap)
    if (firstIteration || nextWidth <= rowWidth) {
      currentRow.prepend(image)
      currentWidth = nextWidth
      if (!firstIteration) gapCount += 1
    }
    if (nextWidth > rowWidth) {
      resizeRow()
      currentRow = setupRow()
      if (!firstIteration) {
        currentRow.prepend(image)
        currentWidth = imageWidth
      } else {
        currentWidth = 0
        gapCount = 0
      }
    } else {
      currentWidth = nextWidth
    }
    firstIteration = false
  }
  resizeRow()

  loadedImageSections++
  if (loadedImageSections === totalImageSections) {
    resizeWorkItems()
  }
}

function workItemsWidth() {
  document.querySelectorAll('.work-content-wrapper').forEach((item) => {
    item.style.width = contentWidth()
  })
}

function resizeWorkItems() {
  workItems.forEach((item) => {
    item.classList.remove('closable')

    const contentHeight = (() => {
      const contentHeight = item.querySelector('.work-content')?.clientHeight
      if (JSON.parse(item.dataset.data).draft) return Math.max((item.querySelector('.work-title-contents').innerHTML.length) * 8, contentHeight)
      else return contentHeight
    })()
    
    item.style.setProperty('--content-height', `${contentHeight}px`)
    const openIshContentHeight = item.querySelector('.work-content-wrapper').clientHeight * 0.8
    item.style.setProperty('--open-ish-content-height', `${openIshContentHeight}px`)
  })
  workItems.forEach(item => {
    item.dataset.fullHeight = item.offsetHeight
    item.classList.add('closable')
  })
  cols.dispatchEvent(new Event('items-ready'))
}

async function fillColumns() {
  const tags = Array.from(workTags).map(element => element.dataset.slug)
  const columns = cols.querySelectorAll('.column')
  const numColumns = columns.length
  setHideOthers()

  function initialTagInfo() {
    return {
      waitTime: 1,
      columnHeights: new Array(numColumns).fill(0)
    }
  }

  const tagInfo = {
    all: initialTagInfo()
  }
  for (let tag of tags) {
    tagInfo[tag] = initialTagInfo()
  }

  const prioritizedItemsMap = new Map()
  for (let workItem of workItems) {
    const data = JSON.parse(workItem.dataset.data)
    const priority = data.priority || Infinity
    const priorityKey = JSON.stringify({draft: data.draft, priority})
    if (!prioritizedItemsMap.has(priorityKey)) prioritizedItemsMap.set(priorityKey, [])
    prioritizedItemsMap.get(priorityKey).push(workItem)
  }
  const prioritizedItems = []
  for (let priority of Array.from(prioritizedItemsMap.keys()).sort((a, b) => {
    const aKey = JSON.parse(a)
    const bKey = JSON.parse(b)
    if (aKey.draft !== bKey.draft) return aKey.draft - bKey.draft
    else return aKey.priority - bKey.priority
  })) {
    const datedPriorityPool = prioritizedItemsMap.get(priority).map(element => ({element: element, date: new Date (JSON.parse(element.dataset.data).date)}))
    datedPriorityPool.sort((a, b) => b.date - a.date)
    const priorityPool = datedPriorityPool.map(item => item.element)
    prioritizedItems.push(priorityPool)
  }

  for (let i = 0; i < workItemArray.length; i++) {
    const priorityPool = prioritizedItems[0]
    const tagWeights = {}
    for (let [tag, {waitTime, columnHeights}] of Object.entries(tagInfo)) {
      // tagWeights[tag] = waitTime * (Math.max(...columnHeights) - Math.min(...columnHeights))
      tagWeights[tag] = {used: waitTime < i + 1, waitTime, unbalancedness: Math.max(...columnHeights) - Math.min(...columnHeights)}
      // tagWeights[tag] = waitTime
    }
    tags.sort((a, b) => {
      const aWeights = tagWeights[a]
      const bWeights = tagWeights[b]
      // return bWeights.waitTime - aWeights.waitTime
      if (!aWeights.used || !bWeights.used) return bWeights.waitTime - aWeights.waitTime
      return bWeights.waitTime * bWeights.unbalancedness - aWeights.waitTime * aWeights.unbalancedness
    })

    let { chosenTag, chosenItem } = (() => {
      for (let tag of tags) {
        const foundIndex = priorityPool.findIndex(workItem => JSON.parse(workItem.dataset.data).tags.includes(tag))
        if (foundIndex !== -1) {
          const foundItem = priorityPool[foundIndex]
          priorityPool.splice(foundIndex, 1)
          if (priorityPool.length === 0) prioritizedItems.shift()
          return { chosenTag: tag, chosenItem: foundItem }
        }
      }
    })()

    const columnHeights = tagInfo[chosenTag].columnHeights
    const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights))
    const fullHeight = Number(chosenItem.dataset.fullHeight)
    const minHeight = remToPx(Number(chosenItem.dataset.minheight))
    const allItemTags = JSON.parse(chosenItem.dataset.data).tags
        
    columns[shortestColumnIndex].appendChild(chosenItem)
    for (let [tag, info] of Object.entries(tagInfo)) {
      const hasTag = allItemTags.includes(tag)
      info.columnHeights[shortestColumnIndex] += hasTag ? fullHeight : minHeight
      if (hasTag) info.waitTime = 1
      else tagInfo[tag].waitTime++
    }
  }

  cols.dispatchEvent(new Event('columns-filled'))
}

function resize() {
  workItemsWidth()
  for (let item of document.querySelectorAll('.work-images')) {
    layoutImages(item)
  }
  resizeWorkItems()
}

function setupItems() {
  imageLoad()
}






cols.addEventListener('columns-created', setupItems)
cols.addEventListener('items-ready', fillColumns)
window.addEventListener('resize', resize)



function setHideOthers() {
  const url = new URL(window.location.href)
  const tagElement = tagDict[url.searchParams.get('tag') || 'all']
  const numCols = cols.querySelectorAll('.column').length
  cols.classList.toggle('hide-others', numCols == 1 || JSON.parse(tagElement.dataset.hideOthers))
}


let tagChangeTimeout

function selectTag(element, tag) {
  element.scrollIntoViewIfNeeded()

  const url = new URL(window.location.href)
  const selectedIsCurrent = tag === (url.searchParams.get('tag') || 'all')

  setURLTag(element, tag)

  setHideOthers()

  for (let otherWorkTag of workTags) {
    const isThis = otherWorkTag == element
    otherWorkTag.classList.toggle('open', isThis)
    otherWorkTag.classList.toggle('closed', !isThis)
    otherWorkTag.classList.remove('short', 'ish')
  }
  for (let workItem of workItems) {
    const hasTag = JSON.parse(workItem.dataset.tags).includes(tag)
    workItem.classList.toggle('open', hasTag)
    workItem.classList.toggle('closed', !hasTag)
    workItem.classList.remove('short', 'ish')
  }

  if (selectedIsCurrent) return;

  const alreadyTransitioning = allTagIntroContainer.classList.contains('transitioning')
  const currentIntro = currentIntroContainer.querySelector('.tag-intro')
  const incomingIntro = tagIntroDict[tag]
  const oldIncomingIntro = alreadyTransitioning ? incomingIntroContainer.querySelector('.tag-intro') : null
  const reverseTransition = currentIntro == incomingIntro

  const currentHeight = currentIntro.offsetHeight + (currentIntro.offsetHeight === 0 ? 0 : remToPx(2.45))
  const incomingHeight = incomingIntro.offsetHeight + (incomingIntro.offsetHeight === 0 ? 0 : remToPx(2.45))

  if (!alreadyTransitioning) {
    allTagIntroContainer.classList.add('transitioning')
    allTagIntroContainer.style.height = `${currentHeight}px`
    incomingIntroContainer.appendChild(incomingIntro)
    setTimeout(() => {
      allTagIntroContainer.style.height = `${incomingHeight}px`
      incomingIntroContainer.style.opacity = '1'
      currentIntroContainer.style.opacity = '0'
    }, 1)
    tagChangeTimeout = setTimeout(() => {
      allTagIntroContainer.classList.remove('transitioning')
      allTagIntroContainer.style.height = 'initial';
      incomingIntroContainer.style.opacity = '0'
      currentIntroContainer.style.opacity = '1'
      currentIntroContainer.appendChild(incomingIntro)
      tagIntroWaitingRoom.appendChild(currentIntro)
    }, 300)
  } else {
    clearTimeout(tagChangeTimeout)
    allTagIntroContainer.style.height = `${incomingHeight}px`

    if (!reverseTransition) {
      tagIntroWaitingRoom.appendChild(oldIncomingIntro)
      incomingIntroContainer.appendChild(incomingIntro)
      incomingIntroContainer.style.opacity = '1'
      currentIntroContainer.style.opacity = '0'

      tagChangeTimeout = setTimeout(() => {
        allTagIntroContainer.classList.remove('transitioning')
        allTagIntroContainer.style.height = 'initial';
        incomingIntroContainer.style.opacity = '0'
        currentIntroContainer.style.opacity = '1'
        currentIntroContainer.appendChild(incomingIntro)
        tagIntroWaitingRoom.appendChild(currentIntro)
      }, 300)
    } else {
      incomingIntroContainer.style.opacity = '0'
      currentIntroContainer.style.opacity = '1'

      tagChangeTimeout = setTimeout(() => {
        allTagIntroContainer.classList.remove('transitioning')
        allTagIntroContainer.style.height = 'initial';
        tagIntroWaitingRoom.appendChild(oldIncomingIntro)
      }, 300)
    }
  }
  
}

function mouseEnterTag(element, tag) {
  if (!element.classList.contains('open')) {
    element.classList.add('short', 'ish')
    workTagContainer.querySelector('.open').classList.add('short', 'ish')
  }
  for (let workItem of workItems) {
    const isOpen = workItem.classList.contains('open')
    const hasTag = JSON.parse(workItem.dataset.tags).includes(tag)
    workItem.classList.add('short')
    workItem.classList.toggle('ish', isOpen !== hasTag)
    // workItem.classList.toggle('closed', !hasTag)
  }
}

function mouseLeaveTag(element, tag) {
  for (let workTag of workTags) {
    workTag.classList.remove('ish')
  }
  element.classList.remove('ish')
  for (let workItem of workItems) {
    workItem.classList.remove('ish')
  }
}


let isClicked = false

addEventListener('DOMContentLoaded', () => {
  for (let tag of document.querySelectorAll('.work-tag')) {
    if (shouldShowTag(tag)) {
      tag.style.display = 'block';
    } else {
      tag.remove()
    }
  }

  const tag = (getURLTag() || 'all').replace(' ', '-')
  const element = workTagContainer.querySelector(`[data-slug="${tag}"]`)
  if (element) {
    selectTag(element, tag)
  }

  currentIntroContainer.appendChild(tagIntroDict[tag])

  for (let item of nonDraftWorkItems) {
    const url = item.querySelector('.work-url').href

    const workLink = item.querySelector('.work-link')

    const scaler = item.querySelector('.work-item-scaler')
    function expand() {scaler.classList.add('hovered')}
    function contract() {scaler.classList.remove('hovered')}

    for (let cap of item.querySelectorAll('.cap')) {
      cap.addEventListener('mouseenter', expand)
      cap.addEventListener('mouseleave', contract)
    }
    item.querySelector('.work-content-wrapper').addEventListener('mouseenter', expand)
    item.querySelector('.work-content-wrapper').addEventListener('mouseleave', contract)
  }
})

function shouldShowTag(tag) {
  const currentUrl = new URL(window.location.href)
  const unlistedTag = currentUrl.searchParams.get('unlisted-tag')
  return !(JSON.parse(tag.dataset.unlisted)) || (tag.dataset.slug === unlistedTag)
}

for (let element of document.querySelectorAll('.work-tag')) {
  const tag = element.dataset.slug
  element.addEventListener('click', () => selectTag(element, tag))
  element.addEventListener('mouseenter', () => mouseEnterTag(element, tag))
  element.addEventListener('mouseleave', () => mouseLeaveTag(element, tag))
}
