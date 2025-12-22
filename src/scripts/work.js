function setupTags(updateHistory) {
  for (let tag of document.querySelectorAll('.work-tag')) {
    if (shouldShowTag(tag)) {
      tag.style.display = 'block';
    } else {
      tag.remove()
    }
  }

  const tag = getURLTag()
  let tagElement
  for (let element of workTagContainer.querySelectorAll('.work-tag')) {
    const slug = element.dataset.slug
    const intro = tagIntroDict[slug]
    if (slug == tag) {
      currentIntroContainer.appendChild(intro)
      tagElement = element
    } else {
      tagIntroWaitingRoom.append(intro)
    }
  }
  selectTag(tag, tag)
  setURLTag(tagElement.dataset.titleName, tag, updateHistory)
}

function setURLTag(titleName, tag, updateHistory) {
  const hyphenTag = tag.replace(' ', '-')
  const url = new URL(window.location.href)
  url.searchParams.set('tag', hyphenTag)
  if (updateHistory) window.history.pushState({titleName, tag}, '', url)
  let pageTitle = titleName
  document.title = `${pageTitle} – Calder Ruhl Hansen`
}

function getURLTag() {
  const url = new URL(window.location.href)
  return (url.searchParams.get('tag') || 'all')
}

window.addEventListener('popstate', (event) => {
  const {titleName, tag} = event.state
  setupTags(false)
});

const intro = document.getElementById('intro')
const introContainer = document.getElementById('intro-container')
const topTagSeparator = document.getElementById('top-tag-separator')
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
    
    item.style.setProperty('--item-height', `${item.clientHeight}px`)
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

  function initialColumnHeights() {
    return new Array(numColumns).fill(0)
  }

  const columnHeights = {
    all: initialColumnHeights()
  }
  for (let tag of tags) {
    columnHeights[tag] = initialColumnHeights()
  }

  const sortedWorkItems = Array.from(workItems).map(workItem => ({workItem, data: JSON.parse(workItem.dataset.data)})).sort((a, b) => {
    const {data: aData} = a
    const aDraft = aData.draft
    const aPriority = aData.priority
    const aDate = new Date(aData.date)

    const {data: bData} = b
    const bDraft = bData.draft
    const bPriority = bData.priority
    const bDate = new Date(bData.date)

    if (aDraft != bDraft) return aDraft - bDraft
    if (aPriority != bPriority) return aPriority - bPriority
    else return bDate - aDate
  })

  for (let {workItem, data} of sortedWorkItems) {
    const tags = data.tags
    let relevantTags = []
    let prioritizedTag = false
    for (let tag of tags) {
      const tagItem = tagDict[tag]
      const prioritizeBalance = JSON.parse(tagItem.dataset.prioritizeBalance)
      if (prioritizeBalance) {
        if (!prioritizedTag) relevantTags.emp
        prioritizedTag = true
      }
      if (!prioritizedTag || prioritizeBalance) {
        relevantTags.push({tag, tagItem})
      }
    }

    let greatestImbalance = 0
    let greatestImbalanceTag = 'all'
    for (let {tag} of relevantTags) {
      const imbalance = Math.max(...columnHeights[tag]) - Math.min(...columnHeights[tag])
      if (imbalance > greatestImbalance) {
        greatestImbalance = imbalance
        greatestImbalanceTag = tag
      }
    }
    const greatestImbalanceColumnHeights = columnHeights[greatestImbalanceTag]
    const shortestColumnIndex = greatestImbalanceColumnHeights.indexOf(Math.min(...greatestImbalanceColumnHeights))

    const fullHeight = Number(workItem.dataset.fullHeight)
    const minHeight = remToPx(Number(workItem.dataset.minheight))
      
    columns[shortestColumnIndex].appendChild(workItem)
    for (let [tag, heights] of Object.entries(columnHeights)) {
      const hasTag = tags.includes(tag)
      heights[shortestColumnIndex] += hasTag ? fullHeight : minHeight
    }
  }

  cols.dispatchEvent(new Event('columns-filled'))
}

function resizeIntroContainer() {
  introContainer.style.setProperty('--intro-container-height', `${intro.clientHeight}px`)
}

function resize() {
  resizeIntroContainer()
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



function setHideOthers(tag = null) {
  if (tag === null) {
    const url = new URL(window.location.href)
    tag = url.searchParams.get('tag')
  }
  const tagElement = tagDict[tag || 'all']
  const numCols = cols.querySelectorAll('.column').length
  cols.classList.toggle('hide-others', numCols == 1 || JSON.parse(tagElement.dataset.hideOthers))
}


let tagChangeTimeout

function selectTag(tag, oldTag) {
  const element = tagDict[tag]

  element.scrollIntoViewIfNeeded()

  const url = new URL(window.location.href)
  // const selectedIsCurrent = tag === (url.searchParams.get('tag') || 'all')
  const selectedIsCurrent = tag === oldTag

  setHideOthers(tag)

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


function setIntroContainer() {
  const closed = getURLTag() != 'all'
  introContainer.classList.toggle('closed', closed)
  topTagSeparator.classList.toggle('closed', closed)
}


let isClicked = false

addEventListener('DOMContentLoaded', () => {
  setupTags(true)

  resizeIntroContainer()
  setIntroContainer()
  introContainer.classList.toggle('no-transition', false)

  for (let item of nonDraftWorkItems) {
    function expand() {item.classList.add('hovered')}
    function contract() {item.classList.remove('hovered')}

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
  const unlistedTags = currentUrl.searchParams.get('unlisted-tag')?.split(',') ?? []
  return !(JSON.parse(tag.dataset.unlisted)) || (unlistedTags.includes(tag.dataset.slug))
}

for (let element of document.querySelectorAll('.work-tag')) {
  const tag = element.dataset.slug
  element.addEventListener('mousedown', () => {
    const currentTag = getURLTag();
    selectTag(tag, currentTag)
    setURLTag(element.dataset.titleName, tag, true)
    setIntroContainer()
  })
  element.addEventListener('mouseenter', () => mouseEnterTag(element, tag))
  element.addEventListener('mouseleave', () => mouseLeaveTag(element, tag))
}
