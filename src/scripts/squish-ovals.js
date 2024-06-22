import $ from 'jquery';
import random from "./random";

const columnWidth = 400;

const squishList = $('.squish');

function setupSquishes() {
  for (let i = 0; i < squishList.length; i++) {
    let squish = $(squishList[i]);
    squish.data('order', i);
    const maxHeight = random(400, 600);
    squish.data('max-height', maxHeight);
    squish.data('power', 1);

    squish.css('height', `${maxHeight}px`);
    // squish.css('width', `${random(90, 100)}%`);
    // squish.css('left', `${random(-5, 5)}px`);
  }
}

function putOvalsInWaitingRoom() {
  const squishList = $('.squish');
  squishList.appendTo('#oval-waiting-room');
}

let prevNumColumns = 0;

function parabolicPadding(i, numColumns) {
  const maxPadding = 50;
  const a = i / (numColumns - 1);
  return (1 + 4 * a * (a - 1)) * maxPadding;
}

function setupColumns() {
  window.requestAnimationFrame(() => {
    const bodyWidth = $('#content').width();
    let numColumns = Math.floor(bodyWidth / columnWidth);
    if (numColumns == 0) numColumns = 1;

    if (numColumns !== prevNumColumns) {
      prevNumColumns = numColumns;
      const columnsContainer = $('#oval-columns');
    
      putOvalsInWaitingRoom();
      columnsContainer.empty()

      const columnsArray = [];
      const paddingAdjustment = (numColumns % 2 == 0) ? parabolicPadding(numColumns / 2, numColumns) : 0;

      const heights = [];
      for (let i = 0; i < numColumns; i++) {
        let d = $('<div>', {id: `col${i}`, class: 'oval-column'});
        const padding = parabolicPadding(i, numColumns) - paddingAdjustment;
        heights.push(padding);
        d.css('padding-top', padding);
        d.appendTo(columnsContainer);
        columnsArray.push(d);
      }

      squishList.each((index, squish) => {
        const minIndex = heights.reduce((minIdx, currentValue, currentIndex, arr) => {
          return currentValue < arr[minIdx] ? currentIndex : minIdx;
        }, 0);
        $(columnsArray[minIndex]).append(squish);
        heights[minIndex] += $(squish).data('max-height');
      })

      // $('.oval-column').each((index, column) => {
      //   $(column).css('width', `${bodyWidth / numColumns}px`);
      // })
    }
  });
}


function squishOvals() {
  window.requestAnimationFrame(() => {
    squishList.each((idx, element) => {
      const position = element.getBoundingClientRect().top / document.documentElement.clientHeight;
      const mobile = document.documentElement.clientWidth < 500;
      const minHeight = 50;
      const maxHeight = $(element).data('max-height') * (mobile? 0.7 : 1);
      if (position < 0) {
        element.style.height = `${maxHeight}px`;
      } else if (position > 1) {
        element.style.height = `${minHeight}px`;
      } else {
        const a = (1 - position) ** $(element).data('power');
        const newHeight = maxHeight * a + minHeight * (1 - a);
        element.style.height = `${newHeight}px`;
      }
    })
  });
}

// document.addEventListener("DOMContentLoaded", squishOvals);
// document.addEventListener("mousewheel", squishOvals);

function ready() {
  setupSquishes();
  setupColumns();
  squishOvals();
}

function resize() {
  setupColumns();
  squishOvals();
}

$(document).ready(ready);
$(window).on('scroll', squishOvals);
$(window).on('resize', resize);
