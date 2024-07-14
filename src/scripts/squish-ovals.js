import $ from 'jquery'
import random from "./random"

const columnWidth = 300

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

    squish.css('width', `${minWidth}px`)
    squish.css('height', `${minHeight}px`)
    // squish.css('width', `${random(90, 100)}%`)
    // squish.css('left', `${random(-5, 5)}px`)
  }
}

function putOvalsInWaitingRoom() {
  const squishList = $('.squish')
  squishList.appendTo('#oval-waiting-room')
}


function parabolicPadding(i, numColumns) {
  const maxPadding = 50
  const a = i / (numColumns - 1)
  return (1 + 4 * a * (a - 1)) * maxPadding
}

let prevNumColumns = 0
let numColumns

function setupColumns() {
  window.requestAnimationFrame(() => {
    const bodyWidth = $('body').width()
    numColumns = Math.floor(bodyWidth / columnWidth)

    if (numColumns == 0) numColumns = 1

    if (numColumns !== prevNumColumns) {
      prevNumColumns = numColumns
      const columnsContainer = $('#oval-columns')
    
      putOvalsInWaitingRoom()
      columnsContainer.empty()

      const columnsArray = []
      const paddingAdjustment = (numColumns % 2 == 0) ? parabolicPadding(numColumns / 2, numColumns) : 0
      
      const heights = []
      for (let i = 0; i < numColumns; i++) {
        let d = $('<div>', {id: `col${i}`, class: 'oval-column'})
        const padding = parabolicPadding(i, numColumns) - paddingAdjustment
        heights.push(padding)
        d.css('padding-top', padding)
        d.appendTo(columnsContainer)
        columnsArray.push(d)
      }
      
      const firstItems = new Array(numColumns).fill(false)
      squishList.each((_, squish) => {
        const minIndex = heights.reduce((minIdx, currentValue, currentIndex, arr) => {
          return currentValue < arr[minIdx] ? currentIndex : minIdx
        }, 0)
        $(columnsArray[minIndex]).append(squish)
        heights[minIndex] += $(squish).data('max-height')
        if (!firstItems[minIndex]) {
          firstItems[minIndex] = true
          $(squish).data('min-width', 100)
        }
        if (numColumns === 1) {
          $(squish).css('--oval-scale', '1.05')
        }
      })
    }
  })
}


function squishOvals() {
  window.requestAnimationFrame(() => {
    const mobile = document.documentElement.clientWidth < 500
    const short = document.documentElement.clientHeight < 800

    squishList.each((idx, element) => {
      const maxHeight = $(element).data('max-height') * (mobile? 0.7 : 1)
      const minHeight = short ? maxHeight : $(element).data('min-height')
      const maxWidth = $(element).data('max-width')
      const minWidth = short ? maxWidth : $(element).data(numColumns === 1 ? 'sc-min-width' : 'min-width')
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


function ready() {
  setupSquishes()
  setupColumns()
  squishOvals()
  const params = new URLSearchParams(window.location.search)
}

function resize() {
  setupColumns()
  squishOvals()
}

$(document).ready(ready)
$(window).on('scroll', squishOvals)
$(window).on('resize', resize)

