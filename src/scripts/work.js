function setupTags(updateHistory) {
  for (let tag of document.querySelectorAll('.work-tag')) {
    if (shouldShowTag(tag)) {
      tag.style.display = 'block';
    } else {
      tag.remove()
    }
  }

  const {tag, implicitAll} = getURLTag()
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
  setURLTag(tagElement.dataset.titleName, tag, {updateHistory, implicitAll})
}

function setURLTag(titleName, tag, { updateHistory = true, implicitAll = true } = {}) {
  const hyphenTag = tag.replace(' ', '-')
  const url = new URL(window.location.href)
  if (implicitAll && tag == 'all') url.searchParams.delete('tag')
  else url.searchParams.set('tag', hyphenTag)
  if (updateHistory) window.history.pushState({titleName, tag}, '', url)
  if (implicitAll && tag == 'all') {
    document.title = 'Calder Ruhl Hansen'
  } else {
    let pageTitle = titleName
    document.title = `${pageTitle} – Calder Ruhl Hansen`
  }
  document.getElementById('menu-work').classList.toggle('underline', !implicitAll)
}

function getURLTag() {
  const url = new URL(window.location.href)
  const tag = url.searchParams.get('tag')
  if (tag === null) {
    return {
      tag: 'all',
      implicitAll: true
    }
  } else {
    return {
      tag,
      implicitAll: false
    }
  }
}

window.addEventListener('popstate', (event) => {
  // const {titleName, tag} = event.state
  setupTags(false)
  setIntroContainer()
});

const lockup = document.getElementById('lockup')
const workLink = document.getElementById('menu-work')
const intro = document.getElementById('intro')
const introContainer = document.getElementById('intro-container')
const topTagSeparator = document.getElementById('top-tag-separator')
const cols = document.getElementById('work-cols')
const waitingRoom = document.getElementById('waiting-room')
const workTagContainer = document.querySelector('#tags')
const workTags = document.querySelectorAll('.work-tag')
const workItems = document.querySelectorAll('.work-item')
const nonDraftWorkItems = document.querySelectorAll('.work-item:not(.draft)')
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
















/*
           _                           _ 
  ___ ___ | |_   _ _ __ ___  _ __  ___| |
 / __/ _ \| | | | | '_ ` _ \| '_ \/ __| |
| (_| (_) | | |_| | | | | | | | | \__ \_|
 \___\___/|_|\__,_|_| |_| |_|_| |_|___(_)
*/

// Sizes

const baseColumnWidth = 600
const columnGap = 20
const itemPadding = 1.5
const gapBetweenRows = remToPx(0.6)
const gapWithinRows = gapBetweenRows

// Utilities

// Older version: calculates the width based on how many columns there are, rather than how many there should be. Keeping it commented in case I realize I need it later
// function columnWidth() {
//   const numColumns = columns.querySelectorAll('.column').length
//   const columnGap = 20
//   const columnsWidth = columns.offsetWidth 
//   const columnWidth = (columnsWidth - (columnGap * (numColumns - 1))) / numColumns
//   return columnWidth
// }

function numColumns() {
  const columnsWidth = cols.offsetWidth
  return (Math.ceil((columnsWidth - baseColumnWidth) / (baseColumnWidth + columnGap)) + 1) || 1
}

function columnWidth() {
  const columnsWidth = cols.offsetWidth
  return (columnsWidth - (columnGap * (numColumns() - 1))) / numColumns()
}

function contentWidth() {
  return columnWidth() - remToPx(itemPadding * 2)
}

// Variables / trackers

let prevNumColumns = 0

// Step 1: create the columns, size them, and move the items to the waiting room

addEventListener('DOMContentLoaded', createColumns)

function createColumns() {
  window.requestAnimationFrame(() => {
    cols.dataset.numColumns = numColumns()
    
    if (numColumns !== prevNumColumns) {
      prevNumColumns = numColumns()
    
      moveToWaitingRoom()

      for (let i = 0; i < numColumns(); i++) {
        const d = document.createElement("div")
        d.classList.add("column")
        cols.append(d)
      }

      waitingRoom.style.width = `${columnWidth()}px`

      layoutImages()
    }
  })
}

function moveToWaitingRoom() {
  for (let item of workItems) {
    waitingRoom.append(item)
  }
  cols.textContent = ""
}

// Step 2: Layout the images in the items

function layoutImages() {
  for (let workItem of workItems) {
    const rowsElement = workItem.querySelector('.work-rows')
    const slidesElement = workItem.querySelector('.work-slides')

    if (rowsElement) {
      const rows = rowsElement.querySelectorAll('.work-row')
      for (let row of rows) {
        const images = Array.from(row.querySelectorAll('.work-image'))
        const totalImageWidth = contentWidth() - gapWithinRows * (images.length - 1)
  
        const aspectRatios = images.map((image) => Number(image.querySelector('.img').dataset.aspect))
        const totalAspectRatio = aspectRatios.reduce((partialSum, a) => partialSum + a, 0)
  
        const height = totalImageWidth / totalAspectRatio
  
        for (let i = 0; i < images.length; i++) {
          const image = images[i]
          const width = aspectRatios[i] * height
          image.style.setProperty("--work-image-width", `${width}px`)
        }
      }
    } else if (slidesElement) {
      const images = slidesElement.querySelectorAll('.work-image')
      for (let image of images) {
        const aspectRatio = Number(image.querySelector('.img').dataset.aspect)
        const height = contentWidth() / aspectRatio
        image.style.setProperty("--work-image-height", `${height}px`)
      }
    }
  }

  resizeWorkItems()
}

// Step 3: resize the work items to fit

function nonImageWorkContentHeight(workItem) {
  return workItem.querySelector(".work-title").clientHeight +
    (workItem.querySelector(".work-description")?.clientHeight ?? 0)
    + remToPx(2)
}

function changeWorkItemHeight(workItem, imageHeight) {
  workItem.style.setProperty('--item-height', `${workItem.clientHeight}px`)
  const nonImageHeight = nonImageWorkContentHeight(workItem)
  const totalHeight = imageHeight + nonImageHeight
  workItem.style.setProperty('--content-height', `${totalHeight}px`)
  // todo figure out why 4 rem works here…
  workItem.style.setProperty('--open-ish-content-height', `${(totalHeight - remToPx(3)) * 0.8}px`)
}

function resizeWorkItems() {
  workItems.forEach((item) => {
    item.classList.remove('closable')

    const contentHeight = (() => {
      const contentHeight = item.querySelector('.work-images')?.clientHeight
      if (JSON.parse(item.dataset.data).draft) return Math.max((item.querySelector('.work-title-contents').innerHTML.length) * 8, contentHeight)
      else return contentHeight
    })()

    changeWorkItemHeight(item, contentHeight)
  })
  workItems.forEach(item => {
    item.dataset.fullHeight = item.offsetHeight
    item.classList.add('closable')
  })
  
  fillColumns()
}

// Step 4: set up the columns

function fillColumns() {
  const tags = Array.from(workTags).map(element => element.dataset.slug)
  const columns = cols.querySelectorAll('.column')
  setHideOthers()

  function initialColumnHeights() {
    return new Array(numColumns()).fill(0)
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
      if (!(tag in tagDict)) continue
      const tagItem = tagDict[tag]
      const prioritizeBalance = JSON.parse(tagItem.dataset.unlisted)
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
      
    columns[shortestColumnIndex].append(workItem)
    for (let [tag, heights] of Object.entries(columnHeights)) {
      const hasTag = tags.includes(tag)
      heights[shortestColumnIndex] += hasTag ? fullHeight : minHeight
    }
  }
}











window.addEventListener('resize', resize)

function resize() {
  resizeIntroContainer()
  createColumns()
  for (let item of document.querySelectorAll('.work-images')) {
    layoutImages(item)
  }
  resizeWorkItems()
}

function resizeIntroContainer() {
  introContainer.style.setProperty('--intro-container-height', `${intro.clientHeight}px`)
  introContainer.classList.remove('loading')
}






function nextSlide(workItem) {
  const slidesElement = workItem.querySelector(".work-slides")
  const images = workItem.querySelectorAll('.work-image')
  images[0].classList.add("closed")
  images[1].classList.remove("closed")
  setTimeout(() => {
    slidesElement.append(images[0])
  }, 500)
  
  const wrapper = workItem.querySelector('.work-content-wrapper')
  wrapper.classList.add('slide-transition')
  const aspectRatio = Number(images[1].querySelector('.img').dataset.aspect)
  const newHeight = contentWidth() / aspectRatio
  setTimeout(() => changeWorkItemHeight(workItem, newHeight), 1)
  setTimeout(() => wrapper.classList.remove('slide-transition'), 500)
}

// from chatgpt
function verticalVisibility(el) {
  const { top, bottom, height } = el.getBoundingClientRect();

  const visiblePx =
    Math.min(bottom, window.innerHeight) -
    Math.max(top, 0);

  return Math.max(0, visiblePx) / height;
}


let globalSlideshowIndex = Math.floor(Math.random() * 10)

function nextSlideSomewhere() {
  if (document.hidden) return
  const candidates = Array.from(workItems).filter((workItem) => (
    !(workItem.classList.contains('closed')) &&
    workItem.querySelector('.work-slides') &&
    verticalVisibility(workItem) > 0.3
  ))
  if (candidates.length === 0) return
  
  const selection = candidates[globalSlideshowIndex % candidates.length]
  nextSlide(selection)
  globalSlideshowIndex++
}

setTimeout(() => setInterval(nextSlideSomewhere, 6000), 3000)





function setHideOthers(tag = null) {
  if (tag === null) {
    const url = new URL(window.location.href)
    tag = url.searchParams.get('tag')
  }
  const tagElement = tagDict[tag || 'all']
  cols.classList.toggle('hide-others', numColumns() == 1 || JSON.parse(tagElement.dataset.unlisted))
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

  // const currentOffsetHeight = currentIntro?.offsetHeight || 0
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
  const {tag, implicitAll} = getURLTag()
  introContainer.classList.toggle('closed', !implicitAll)
  topTagSeparator.classList.toggle('closed', !implicitAll)
}

addEventListener('DOMContentLoaded', () => {
  setupTags(true)

  setTimeout(resizeIntroContainer, 150)

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
  element.addEventListener('click', () => {
    const {currentTag} = getURLTag();
    selectTag(tag, currentTag)
    setURLTag(element.dataset.titleName, tag, {updateHistory: true, implicitAll: false})
    setIntroContainer()
    window.scrollTo({top: 0, left: 0, behavior: "smooth"});
  })
  element.addEventListener('mouseenter', () => mouseEnterTag(element, tag))
  element.addEventListener('mouseleave', () => mouseLeaveTag(element, tag))
}

import { set } from "astro:schema";
import { doClose } from "./menu.js";

lockup.addEventListener('click', (event) => {
  event.preventDefault()
  const {tag: currentTag} = getURLTag();
  selectTag('all', currentTag)
  setURLTag(null, 'all', {updateHistory: true, implicitAll: true})
  setIntroContainer()
  window.scrollTo({top: 0, left: 0, behavior: "smooth"});
  setTimeout(doClose)
})

workLink.addEventListener('click', (event) => {
  event.preventDefault()
  const {tag: currentTag} = getURLTag();
  selectTag('all', currentTag)
  setURLTag('Work', 'all', {updateHistory: true, implicitAll: false})
  setIntroContainer()
  window.scrollTo({top: 0, left: 0, behavior: "smooth"});
  setTimeout(doClose)
})