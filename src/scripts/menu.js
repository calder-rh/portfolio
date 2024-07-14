import $ from 'jquery'

const menu = $('#menu')
const close = $('#close-menu')
const nav = $('nav')
const bg = $('#menu-background')

let shouldICareAboutMouseenter = true

let lastWidth = document.documentElement.clientWidth

let transitioning = false


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



function positionBackground() {
  const width_factor = 1.6
  const height_factor = 1.6
  const {left, top, width, height} = menu[0].getBoundingClientRect()
  const bg_left = left - 0.5 * (width_factor - 1) * width
  const bg_top = top - 0.5 * (height_factor - 1) * height
  const bg_width = width * width_factor
  const bg_height = height * height_factor
  // bg.css({
  //   left: `${bg_left}px`,
  //   top: `${bg_top}px`,
  //   width: `${bg_width}px`,
  //   height: `${bg_height}px`
  // })
  bg.css({
    left: `${bg_left}px`,
    top: `${bg_top}px`,
    width: `${bg_width}px`,
    height: `${bg_height}px`
  })

  if (transitioning) window.requestAnimationFrame(positionBackground)
}


function resize() {
  const width = document.documentElement.clientWidth
  nav.toggleClass('thin', width <= 780)
  if (width <= 600) {
    nav.addClass('width-snap')
  } else {
    nav.removeClass('width-snap')
  }
}

$(document).ready(resize)
$(window).on('resize', resize)

menu.on('transitionstart', (event) => {
  transitioning = true
  window.requestAnimationFrame(positionBackground)
})

menu.on('transitionend', (event) => {
  transitioning = false
  window.requestAnimationFrame(positionBackground)
  if (nav.hasClass('closed') && !nav.hasClass('ish')) { 
    bg.removeClass('show')
  }
})