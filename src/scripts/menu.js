import $ from 'jquery'

const menu = $('#menu')
const close = $('#close-menu')
const nav = $('nav')
const bg = $('#menu-bg-scaler')

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

close.on('click', () => {
  nav.removeClass('open').addClass('closed')
  shouldICareAboutMouseenter = false
  nav.removeClass('ish reverse')
})



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



function handleResize() {
  const width = document.documentElement.clientWidth
  nav.toggleClass('thin', width <= 780)
}


let resizeTimeout = null

function resize() {
  if (resizeTimeout) {
    clearTimeout(resizeTimeout)
    resizeTimeout = null
  } else {
    nav.addClass('no-transitions')
  }
  resizeTimeout = setTimeout(() => {
    nav.removeClass('no-transitions')
    resizeTimeout = null
  }, 100)
  handleResize()
}

$(document).ready(resize)
$(window).on('resize', resize)

menu.on('transitionstart', (event) => {
  console.log('um')
})

menu.on('transitionend', (event) => {
  if (nav.hasClass('closed') && !nav.hasClass('ish')) { 
    bg.removeClass('show')
  }
})