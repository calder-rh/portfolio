import $ from 'jquery';

const fontSize = 30;
const eachLetterTime = 300;
const spacing = 50;
const letters = $('.menu-letter');
const numLetters = 4;
const totalTime = (numLetters - 1) * spacing + eachLetterTime;

function smooth(x) {
  return (1 + Math.cos(Math.PI * (1 - x))) / 2;
}

function asymmetric_smooth(x) {
  return smooth(x) ** 2;
}

const menuIcon = $('#menu-icon');
const closeMenu = $('#close-menu');

function toggleMenu() {
  const mobile = document.documentElement.clientWidth < 500;

  let closing = menuIcon.hasClass('open');
  menuIcon.toggleClass('open');

  let menuHeight = $('nav').height() - 6;
  let headerHeight = $('#header').height();

  let maxFontHeight = menuHeight / fontSize;
  let startHeight = closing ? maxFontHeight : 1;
  let endHeight = closing ? 1 : maxFontHeight;

  let start = Date.now();
  let timer = setInterval(() => {
    let timePassed = Date.now() - start;

    if (timePassed >= totalTime + 20) {
      clearInterval(timer);

      letters.each((i, letter) => {
        $(letter).css('font-variation-settings', `"HIGH" ${endHeight}`);
      })
      
      return;
    }

    let drawerMove = 0;
    for (let i = 0; i < letters.length; i++) {
      let letter = $(letters[i]);

      let startTime = closing ? i * spacing : (numLetters - i - 1) * spacing;
      let endTime = startTime + eachLetterTime;
      let fontHeight;


      if (timePassed < startTime) {
        fontHeight = startHeight;
      } else if (timePassed > endTime) {
        fontHeight = endHeight;
      } else {
        fontHeight = startHeight + (endHeight - startHeight) * asymmetric_smooth((timePassed - startTime) / eachLetterTime);
      }
      drawerMove += fontHeight * fontSize / numLetters;
      letter.css('font-variation-settings', `"HIGH" ${fontHeight}`);
    }

    let a = closing ? (1 - timePassed / totalTime) : (timePassed / totalTime);
    let menuMove = smooth(a) * (headerHeight + 16);
    drawerMove += menuMove - fontSize - smooth(a) * (mobile ? -10 : 6);
    menuIcon.css('top', `${menuMove}px`);
    $('#nav-drawer').css('bottom', `${-drawerMove}px`);
    let closeMenuMove = headerHeight * 1.5 * (smooth(1 - a));
    $('#close-menu').css('bottom', `${closeMenuMove}px`);
  }, 20)
}


menuIcon.click(toggleMenu);
closeMenu.click(toggleMenu);