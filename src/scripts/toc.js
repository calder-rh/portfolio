import $ from 'jquery'

const elementToToc = {}
const childrenOnscreen = {}
const onScreen = []
let autoJump = true

const toc = $('#toc')
const tocTopShape = $('#toc-top')
const tocTopText = $('#top-text')
const tocItem = $('.toc-item')

function jump() {
  const middleElement = onScreen[Math.floor(onScreen.length / 2)]
  middleElement.scrollIntoViewIfNeeded()
}

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
    jump()
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
  if (toc.hasClass('small')) {
    tocTopShape.css('opacity', tocScrollAmount > tocPaddingTop ? '0' : '1')
  }
})

tocTopShape.on('click', () => {
  autoJump = false;
  setTimeout(() => {autoJump = true}, 1000)
  setTimeout(() => window.scrollTo(0, 0), 0)
  setTimeout(() => toc.scrollTop(0), 0)
  window.scrollTop(0)
  toc.scrollTop(0)
})

toc.on('click', () => {
  if (toc.hasClass('small')) {
    toc.removeClass('small')
    autoJump = true
    jump()
    tocTopShape.css('opacity', '1')
  }
})

$('#toc-close').on('click', () => {
  const tocScrollAmount = toc.scrollTop()
  const scrollAmount = $(document).scrollTop()
  const tocPaddingTop = Math.max(100 - Math.max(scrollAmount - 86, 0), 0)
  tocTopShape.css('opacity', tocScrollAmount > tocPaddingTop ? '0' : '1')
  toc.addClass('small')
  autoJump = !toc.hasClass('small')
})

tocItem.on('click', () => {
  if (document.documentElement.clientWidth <= 1300) {
    toc.addClass('small')
  }
  autoJump = false;
  setTimeout(() => {autoJump = true}, 1000)
})

