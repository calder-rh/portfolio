import $ from 'jquery'
import {colorLerp, cssString} from '@src/scripts/color-utils'

const elementToToc = {}
const childrenOnscreen = {}

let callback = (entries, observer) => {
  let x = 0

  entries.forEach((entry) => {
    x += 1
    const tocItem = $(elementToToc[entry.target.id])
    const ancestors = $(tocItem).data('data').ancestors
    if (entry.isIntersecting) {
      tocItem.addClass('onscreen')
      for (let id of ancestors) {
        if (id) childrenOnscreen[id]++;
      }
    } else {
      tocItem.removeClass('onscreen')
      for (let id of ancestors) {
        if (id && childrenOnscreen[id] > 0) childrenOnscreen[id]--;
      }
    }
  })

  for (let id in childrenOnscreen) {
    const headingElement = $(`#toc-${id}`)
    if (childrenOnscreen[id]) {
      console.log('hi')
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