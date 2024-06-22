import $ from 'jquery';

const fontSize = 30;
const eachLetterTime = 300;
const spacing = 50;
const letters = $('.menu-letter');
const numLetters = 4;

function smooth(x) {
  return ((1 + Math.cos(Math.PI * (1 - x))) / 2) ** 2;
}

const menuIcon = $('#menu-icon');
menuIcon.click(() => {
  let closing = menuIcon.hasClass('open');
  menuIcon.toggleClass('open');

  let start = Date.now();
  let timer = setInterval(() => {
    let timePassed = Date.now() - start;

    if (timePassed >= (numLetters - 1) * spacing + eachLetterTime + 20) {
      clearInterval(timer);
      return;
    }

    let windowHeight = document.documentElement.clientHeight;
    let maxFontHeight = Math.min(windowHeight / fontSize, 20);
    for (let i = 0; i < letters.length; i++) {
      let letter = $(letters[i]);

      let startTime = closing ? i * spacing : (numLetters - i - 1) * spacing;
      let endTime = startTime + eachLetterTime;
      let fontHeight;

      let startHeight = closing ? maxFontHeight : 1;
      let endHeight = closing ? 1 : maxFontHeight;

      if (timePassed < startTime) {
        fontHeight = startHeight;
      } else if (timePassed > endTime) {
        fontHeight = endHeight;
      } else {
        fontHeight = startHeight + (endHeight - startHeight) * smooth((timePassed - startTime) / eachLetterTime);
      }
      letter.css('font-variation-settings', `"HIGH" ${fontHeight}`);
    }
  }, 20)
})