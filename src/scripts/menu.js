import $ from 'jquery'

const menu = $('#menu')
const close = $('#close-menu')
const nav = $('nav')

const speed = 0.1

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
  nav.removeClass('open').addClass('closed ish reverse')
  shouldICareAboutMouseenter = false
  setTimeout(() => nav.removeClass('no-transitions ish reverse'), 1)
})



menu.on('mouseenter', () => {
  if (nav.hasClass('closed') && shouldICareAboutMouseenter) {
    nav.addClass('ish')
  }
})

menu.on('mouseleave', () => {
  if (nav.hasClass('closed')) {
    nav.removeClass('ish')
    shouldICareAboutMouseenter = true
  }
})

menu.on('click', () => {
  nav.removeClass('closed').addClass('open ish reverse')
  shouldICareAboutMouseenter = false;
  setTimeout(() => nav.removeClass('no-transitions ish reverse'), 1)
})



function resize() {
  const width = document.documentElement.clientWidth
  nav.toggleClass('thin', width <= 780)
}

$(document).ready(resize)
$(window).on('resize', resize)