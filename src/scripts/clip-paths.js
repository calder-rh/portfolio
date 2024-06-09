function random(min, max) {
  return Math.random() * (max - min) + min;
}

function center() {
  return random(47, 53);
}

function handle() {
  return random(25, 35)
}

function randomAnchor() {
  const middleValue = center();
  return {
    low: middleValue - handle(),
    middle: middleValue,
    high: middleValue + handle()
  }
}

function generateClipPaths() {
  const ovals = document.querySelectorAll('.oval-path');
  ovals.forEach((oval) => {
    const { low: tl, middle: t, high: tr } = randomAnchor();
    const { low: rt, middle: r, high: rb } = randomAnchor();
    const { low: bl, middle: b, high: br } = randomAnchor();
    const { low: lt, middle: l, high: lb } = randomAnchor();

    const pathStr = `M ${t} 0 C ${tr} 0, 100 ${rt}, 100 ${r} C 100 ${rb}, ${br} 100, ${b} 100 C ${bl} 100, 0 ${lb}, 0 ${l} C 0 ${lt}, ${tl} 0, ${t} 0`;

    oval.setAttribute('d', pathStr);
  })
}

// function addClipPaths() {
//   const ovals = document.querySelectorAll('.oval');
//   ovals.forEach((oval) => {
//     const clipPathId = oval.id.replace('oval', 'path');
//     oval.style.clipPath = `url(#${clipPathId})`;
//     // const clipPath = generateRandomClipPath();
//     // console.log(clipPath);
//     // oval.style.clipPath = clipPath;
//     // oval.style.WebkitClipPath = clipPath;
//   });
// }

document.addEventListener('DOMContentLoaded', generateClipPaths);
// window.addEventListener('resize', addClipPaths);