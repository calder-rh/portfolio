import $ from 'jquery'

const elementToToc = {}
const childrenOnscreen = {}
const onScreen = []
let autoJump = true

let callback = (entries, observer) => {
  let x = 0

  entries.forEach((entry) => {
    x += 1
    const tocItem = $(elementToToc[entry.target.id])
    const ancestors = $(tocItem).data('data').ancestors
    if (entry.isIntersecting) {
      onScreen.push(tocItem[0])
      tocItem.addClass('onscreen')
      for (let id of ancestors) {
        if (id) childrenOnscreen[id]++;
      }
    } else {
      const onScreenIndex = onScreen.indexOf(tocItem[0])
      if (onScreenIndex > -1) {
        onScreen.splice(onScreenIndex, 1)
      } 
      tocItem.removeClass('onscreen')
      for (let id of ancestors) {
        if (id && childrenOnscreen[id] > 0) childrenOnscreen[id]--;
      }
    }
  })

  if (autoJump && onScreen.length) {
    const middleElement = onScreen[Math.floor(onScreen.length / 2)]
    // middleElement.scrollIntoView({behavior: 'smooth', block: 'center'})
    middleElement.scrollIntoViewIfNeeded()
  }

  for (let id in childrenOnscreen) {
    const headingElement = $(`#toc-${id}`)
    if (childrenOnscreen[id]) {
      headingElement.addClass('child-onscreen')
    } else {
      headingElement.removeClass('child-onscreen')
    }
  }
}

let observer = new IntersectionObserver(callback, {threshold: 0});

for (let tocItem of $('.toc-item')) {
  const data = $(tocItem).data('data')
  const elementID = data.id
  const element = $('#' + elementID)[0]
  elementToToc[elementID] = tocItem
  if (data.type === 'heading') childrenOnscreen[elementID] = 0
  observer.observe(element)
}

$(document).ready(() => {
  $('.toc-image img').each((_, image) => {
    if ($(image).width() > 146) {
      $(image).css('width', '146px')
      $(image).css('height', 'auto')
    }
  })
  $('.toc-image').each((_, element) => {
    $(element).css('visibility', 'visible')
  })
})

const toc = $('#toc')
const tocTopShape = $('#toc-top')
const tocTopText = $('#top-text')

$(window).on('scroll', () => {
  requestAnimationFrame(() => {
    const scrollAmount = $(document).scrollTop()
    const tocScrollAmount = toc.scrollTop()
    const tocTop = Math.max(86 - Math.max(scrollAmount, 0), 0)
    const tocPaddingTop = Math.max(100 - Math.max(scrollAmount - 86, 0), 0)
    toc.css('top', `${tocTop}px`)
    toc.css('padding-top', `${tocPaddingTop}px`)
    tocTopShape.css('top', `${-tocPaddingTop}px`)
    tocTopText.css('opacity', (scrollAmount > 186 || tocScrollAmount > tocPaddingTop) ? '1' : '0')
  })
})

toc.on('scroll', () => {
  const scrollAmount = $(document).scrollTop()
  const tocScrollAmount = toc.scrollTop()
  const tocPaddingTop = Math.max(100 - Math.max(scrollAmount - 86, 0), 0)
  tocTopText.css('opacity', (scrollAmount > 186 || tocScrollAmount > tocPaddingTop) ? '1' : '0')
})

tocTopShape.on('click', () => {
  autoJump = false;
  toc.scrollTop(0)
  setTimeout(() => {autoJump = true}, 1000)
})