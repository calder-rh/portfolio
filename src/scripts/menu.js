import $ from 'jquery'

const menuIcon = $('#menu')
const closeMenu = $('#close-menu')
const nav = $('nav')
const navAndChildren = $('nav, nav:hover, nav *')

const alwaysTransitioning = $('#menu .oval.link, #close-menu, #menu .oval.link:hover')
function setAlwaysThings () {
  alwaysTransitioning.css('transition', 'scale 0.2s, top 0.2s, right 0.2s, bottom 0.2s')
  $('nav.closed #menu').css('transition', 'scale 0.2s')
}

function toggleMenu() {
  navAndChildren.css('transition', '0.25s ease-out')
  $('nav.closed #menu').css('transition', 'scale 0.25s ease-out')
  setAlwaysThings();
  setTimeout(() => {navAndChildren.css('transition', '0s'); setAlwaysThings()}, 0.25)
  nav.toggleClass('closed')
}

let lastWidth = document.documentElement.clientWidth
function resize() {
  const width = document.documentElement.clientWidth
  if ((width < 780) != (lastWidth < 780)) {
    navAndChildren.css('transition', 'none')
    setTimeout(() => {navAndChildren.css('transition', '0.25s ease-out'); setAlwaysThings();}, 0.25)
  }
  lastWidth = width;
}

menuIcon.click(toggleMenu)
closeMenu.click(toggleMenu)
$(window).on('resize', resize)