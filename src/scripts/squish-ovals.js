import $ from 'jquery'
import random from "./random"

const squishList = $('.squish')

function setupSquishes() {
  for (let i = 0; i < squishList.length; i++) {
    let squish = $(squishList[i])
    squish.data('order', i)
    const minHeight = random(80, 120)
    const maxHeight = random(200, 350)
    const {minWidth, maxWidth} = (() => {
      if (random(0, 1) > 0.75) {
        return {
          minWidth: random(30, 60),
          maxWidth: 100
        }
      } else {
        return {
          minWidth: 100,
          maxWidth: 100
        }
      }
    })()
    const singleColumnMinWidth = random(30, 100)
    const squishStart = random(0.5, 0.8)
    squish.data('min-height', minHeight)
    squish.data('max-height', maxHeight)
    squish.data('min-width', minWidth)
    squish.data('sc-min-width', singleColumnMinWidth)
    squish.data('max-width', maxWidth)
    squish.data('squish-start', squishStart)
    squish.data('power', 1)

    squish.css('width', `${maxWidth}px`)
    squish.css('height', `${maxHeight}px`)
  }
}


function squishOvals() {
  window.requestAnimationFrame(() => {
    const mobile = document.documentElement.clientWidth < 500
    const short = document.documentElement.clientHeight < 800

    squishList.each((idx, element) => {
      const maxHeight = $(element).data('max-height') * (mobile? 0.7 : 1)
      const minHeight = short ? maxHeight : $(element).data('min-height')
      const maxWidth = $(element).data('max-width')
      const minWidth = short ? maxWidth : $(element).data($('#ovals').data('numColumns') === 1 ? 'sc-min-width' : 'min-width')
      const squishStart = $(element).data('squish-start')
      const squishEnd = squishStart - (maxHeight - minHeight) / document.documentElement.clientHeight

      const position = element.getBoundingClientRect().top / document.documentElement.clientHeight
      const a = (position - squishStart) / (squishEnd - squishStart)

      if (a < 0) {
        element.style.height = `${minHeight}px`
        element.style.width = `${minWidth}%`
      } else if (a > 1) {
        element.style.height = `${maxHeight}px`
        element.style.width = `${maxWidth}%`
      } else {
        const newHeight = maxHeight * a + minHeight * (1 - a)
        const newWidth = maxWidth * a + minWidth * (1 - a)
        element.style.height = `${newHeight}px`
        element.style.width = `${newWidth}%`
      }
    })
  })
}

function firstSquishes() {
  $('.column').each((idx, item) => {
		let firstChild = $($(item).children()[0])
		firstChild.data('min-width', 100)
	})
}

function ready() {
  setupSquishes()
  $('#oval-cols')[0].dispatchEvent(new Event('items-ready'))
  squishOvals()
}

$(document).ready(ready)
$('#oval-cols').on('columns-loaded', firstSquishes)
$(window).on('scroll', squishOvals)
$(window).on('resize', squishOvals)

