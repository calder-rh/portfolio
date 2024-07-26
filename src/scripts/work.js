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

function fillColumns() {
  

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
  element.scrollIntoViewIfNeeded()
  for (let otherWorkTag of workTags) {
    const isThis = otherWorkTag == element
    otherWorkTag.classList.toggle('open', isThis)
    otherWorkTag.classList.toggle('closed', !isThis)
    otherWorkTag.classList.remove('short', 'ish')
  }
  for (let workItem of workItems) {
    const hasTag = workItem.dataset.tags.includes(tag)
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
    const hasTag = workItem.dataset.tags.includes(tag)
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
  const tag = getURLTag() || 'all'
  const element = document.querySelector(`[data-tag="${tag}"]`)
  if (element) {
    selectTag(element, tag)
  }
})

for (let element of document.querySelectorAll('.work-tag')) {
  const tag = element.dataset.tag
  element.addEventListener('click', () => selectTag(element, tag))
  element.addEventListener('mouseenter', () => mouseEnterTag(element, tag))
  element.addEventListener('mouseleave', () => mouseLeaveTag(element, tag))
}


