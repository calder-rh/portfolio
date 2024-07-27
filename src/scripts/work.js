function setURLTag(tag) {
  const hyphenTag = tag.replace(' ', '-')
  const url = new URL(window.location.href)
  url.searchParams.set('tag', hyphenTag)
  window.history.pushState({}, '', url)
}

function getURLTag() {
  const url = new URL(window.location.href)
  return (url.searchParams.get('tag') || 'all').replace('-', ' ')
}



const cols = document.getElementById('work-cols')
const workTagContainer = document.querySelector('#tags')
const workTags = document.querySelectorAll('.work-tag')
const workItems = document.querySelectorAll('.work-item')
const workItemArray = Array.from(workItems)


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
let imageSectionsLoaded = 0

function imageLoad() {
  if (totalImages === 0) {
    resizeWorkItems()
  } else {
    for (let item of document.querySelectorAll('.work-images')) {
      item.addEventListener('images-loaded', () => layoutImages(item))
  
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

  imageSectionsLoaded++
  if (imageSectionsLoaded == totalImages) resizeWorkItems()
}

function workItemsWidth() {
  document.querySelectorAll('.work-content-wrapper').forEach((item) => {
    item.style.width = contentWidth()
  })
}

function resizeWorkItems() {
  document.querySelectorAll('.work-content-wrapper').forEach((item) => {
    // const contentHeight = item.querySelector('.work-content-inner')?.clientHeight
    const contentHeight = item.querySelector('.work-title').innerHTML.length * 8

    if (contentHeight) {
      item.style.setProperty('--content-height', `${contentHeight}px`)
    }
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
    if (!prioritizedItemsMap.has(priority)) prioritizedItemsMap.set(priority, [])
    prioritizedItemsMap.get(priority).push(workItem)
  }
  const prioritizedItems = []
  for (let priority of Array.from(prioritizedItemsMap.keys()).sort()) {
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
}

function setupItems() {
  for (let item of workItems) {
    item.classList.remove('closable')
  }
  imageLoad()
}






cols.addEventListener('columns-created', setupItems)
cols.addEventListener('items-ready', fillColumns)
window.addEventListener('resize', resize)







function selectTag(element, tag) {
  setURLTag(tag)
  element.scrollIntoView({block: 'nearest', inline: 'center'})
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




addEventListener('DOMContentLoaded', () => {
  const tag = (getURLTag() || 'all').replace(' ', '-')
  const element = workTagContainer.querySelector(`[data-slug="${tag}"]`)
  if (element) {
    selectTag(element, tag)
  }
})

for (let element of document.querySelectorAll('.work-tag')) {
  const tag = element.dataset.slug
  element.addEventListener('click', () => selectTag(element, tag))
  element.addEventListener('mouseenter', () => mouseEnterTag(element, tag))
  element.addEventListener('mouseleave', () => mouseLeaveTag(element, tag))
}


