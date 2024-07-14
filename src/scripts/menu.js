import $ from 'jquery'

const menu = $('#menu')
const close = $('#close-menu')
const nav = $('nav')

let shouldICareAboutMouseenter = true

let lastWidth = document.documentElement.clientWidth


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

close.on('click', () => {
  nav.removeClass('open').addClass('closed')
  shouldICareAboutMouseenter = false
  nav.removeClass('ish reverse')
})



menu.on('mouseenter', () => {
  if (nav.hasClass('closed') && shouldICareAboutMouseenter) {
    nav.addClass('background')
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
  nav.addClass('background')
  setTimeout(() => {
    nav.removeClass('closed').addClass('open')
    shouldICareAboutMouseenter = false;
    nav.removeClass('ish reverse')
  })
})



function resize() {
  const width = document.documentElement.clientWidth
  nav.toggleClass('thin', width <= 780)
  if (width <= 600) {
    nav.addClass('width-snap')
  } else {
    nav.removeClass('width-snap')
  }
  lastWidth = width
}

$(document).ready(resize)
$(window).on('resize', resize)

menu.on('transitionend', (event) => {
  if (nav.hasClass('closed') && !nav.hasClass('ish')) { 
    nav.removeClass('background')
  }
})