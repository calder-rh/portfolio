import random from "./random";

function squishOvals() {
  window.requestAnimationFrame(() => {
    document.querySelectorAll('.squish').forEach((element) => {
      const position = element.getBoundingClientRect().top / document.documentElement.clientHeight;
      const mobile = document.documentElement.clientWidth < 500;
      const minHeight = 50;
      const maxHeight = mobile ? 300 : 500;
      if (position < 0) {
        element.style.height = `${maxHeight}px`;
      } else if (position > 1) {
        element.style.height = `${minHeight}px`;
      } else {
        const a = (1 - position);
        const newHeight = maxHeight * a + minHeight * (1 - a);
        element.style.height = `${newHeight}px`;
      }
    })
  });
}

document.addEventListener("DOMContentLoaded", squishOvals);
document.addEventListener("scroll", squishOvals);
window.addEventListener("resize", squishOvals);