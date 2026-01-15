const menu = document.getElementById('menu')
const close = document.getElementById('close-menu')
const nav = document.querySelector('nav')
const bg = document.getElementById('menu-bg-scaler')

const headerContainer = document.querySelector('#header-container')
const headerHeight = window.getComputedStyle(document.documentElement).getPropertyValue('--header-height');


let shouldICareAboutMouseenter = true


close.addEventListener('mouseenter', () => {
  if (shouldICareAboutMouseenter) {
    nav.classList.toggle('ish', true)
  }
})

close.addEventListener('mouseleave', () => {
  if (nav.classList.contains('open')) {
    nav.classList.toggle('ish', false)
    shouldICareAboutMouseenter = true
  }
})

function doClose() {
  nav.classList.toggle('open', false)
  nav.classList.toggle('closed', true)
  shouldICareAboutMouseenter = false
  nav.classList.toggle('ish', false)
}

close.addEventListener('click', doClose)



menu.addEventListener('mouseenter', () => {
  if (nav.classList.contains('closed') && shouldICareAboutMouseenter) {
    bg.classList.toggle('show', true)
    setTimeout(() => nav.classList.toggle('ish', true))
  }
})

menu.addEventListener('mouseleave', () => {
  if (nav.classList.contains('closed')) {
    nav.classList.toggle('ish', false)
    shouldICareAboutMouseenter = true
  }
})

menu.addEventListener('click', () => {
  bg.classList.toggle('show', true)
  setTimeout(() => {
    nav.classList.toggle('closed', false)
    nav.classList.toggle('ewidth-snap', false)
    nav.classList.toggle('open', true)
    shouldICareAboutMouseenter = false;
    nav.classList.toggle('ish', false)
  })
})


let lastWidth = document.documentElement.clientWidth
function handleResize() {
  const width = document.documentElement.clientWidth
  nav.classList.toggle('thin', width <= 780)
  if (lastWidth > 780 && width <= 780) {
    nav.classList.toggle('open', false)
    nav.classList.toggle('closed', true)
  }
  lastWidth = width
}


document.addEventListener('ready', handleResize)
window.addEventListener('resize', handleResize)

menu.addEventListener('transitionstart', (e) => {
  if (e.target !== menu) return
  if (!nav.classList.contains('closed') || nav.classList.contains('ish')) {
    headerContainer.style.height = `100vh`
  }
})

menu.addEventListener('transitionend', (e) => {
  if (e.target !== menu) return
  if (nav.classList.contains('closed') && !nav.classList.contains('ish')) { 
    bg.classList.toggle('show', false)
    headerContainer.style.height = headerHeight
  }
})
