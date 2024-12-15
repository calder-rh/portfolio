import $ from 'jquery'

const menu = $('#menu')
const close = $('#close-menu')
const nav = $('nav')
const bg = $('#menu-bg-scaler')

const headerContainer = document.querySelector('#header-container')
const headerHeight = window.getComputedStyle(document.documentElement).getPropertyValue('--header-height');


let shouldICareAboutMouseenter = true


close.on('mouseenter', () => {
  if (shouldICareAboutMouseenter) {
    nav.addClass('ish')
  }
})

close.on('mouseleave', () => {
  if (nav.hasClass('open')) {
    nav.removeClass('ish')
    shouldICareAboutMouseenter = true
  }
})

function doClose() {
  nav.removeClass('open').addClass('closed')
  shouldICareAboutMouseenter = false
  nav.removeClass('ish reverse')
}

close.on('click', doClose)



menu.on('mouseenter', () => {
  if (nav.hasClass('closed') && shouldICareAboutMouseenter) {
    bg.addClass('show')
    setTimeout(() => nav.addClass('ish'))
  }
})

menu.on('mouseleave', () => {
  if (nav.hasClass('closed')) {
    nav.removeClass('ish')
    shouldICareAboutMouseenter = true
  }
})

menu.on('click', () => {
  bg.addClass('show')
  setTimeout(() => {
    nav.removeClass('closed width-snap').addClass('open')
    shouldICareAboutMouseenter = false;
    nav.removeClass('ish reverse')
  })
})


let lastWidth = document.documentElement.clientWidth
function handleResize() {
  const width = document.documentElement.clientWidth
  nav.toggleClass('thin', width <= 780)
  if (lastWidth > 780 && width <= 780) {
    nav.removeClass('open').addClass('closed')
    nav.removeClass('ish reverse')  
  }
  lastWidth = width
}


$(document).ready(handleResize)
$(window).on('resize', handleResize)

menu.on('transitionstart', () => {
  if (!nav.hasClass('closed') || nav.hasClass('ish')) {
    headerContainer.style.height = `100vh`
  }
})

menu.on('transitionend', () => {
  if (nav.hasClass('closed') && !nav.hasClass('ish')) { 
    bg.removeClass('show')
    headerContainer.style.height = headerHeight
  }
})
