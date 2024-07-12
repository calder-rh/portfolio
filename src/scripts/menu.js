import $ from 'jquery'

const menuIcon = $('#menu')
const closeMenu = $('#close-menu')
const nav = $('nav')
const navAndChildren = $('nav, nav *')


function toggleMenu() {
  navAndChildren.css('transition', '0.25s ease-out')
  setTimeout(() => navAndChildren.css('transition', '0s'), '0.25s')
  nav.toggleClass('closed')
}

menuIcon.click(toggleMenu)
closeMenu.click(toggleMenu)