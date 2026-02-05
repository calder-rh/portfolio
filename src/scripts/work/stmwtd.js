import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(Flip, MorphSVGPlugin);

const svgs = {
  piece: document.querySelector('#piece-frame').innerHTML,
  words: document.querySelector('#words-frame').innerHTML,
  letters: document.querySelector('#letters-frame').innerHTML
};

const opacities = {
  piece: {words: 0, letters: 0},
  words: {words: 1, letters: 0},
  letters: {words: 1, letters: 1},
}

let currentFrame

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("frame").innerHTML = svgs.piece
  document.getElementById("words").style.opacity = 0
  document.getElementById("letters").style.opacity = 0
  currentFrame = "piece"
})

function swapSVG(name) {
  MorphSVGPlugin.convertToPath(
    "#frame polygon"
  );

  const state = Flip.getState('#frame *:not(.morph)');

  const oldMorphs = {};
  document.querySelectorAll('#frame .morph').forEach(p => {
    oldMorphs[p.dataset.morphId] = p;
  });

  console.log(oldMorphs)

  document.querySelector('#frame').innerHTML = svgs[name];

  MorphSVGPlugin.convertToPath(
    "#frame polygon"
  );

  const newMorphs = {};
  document.querySelectorAll('#frame .morph').forEach(p => {
    newMorphs[p.dataset.morphId] = p;
  });

  const tl = gsap.timeline()

  tl.add(
    Flip.from(state, {
      targets: "#frame *:not(.morph)",
      duration: 1,
      ease: 'power1.inOut',
      absolute: true,
    }),
    0
  )

  tl.fromTo(
    "#words",
    {opacity: opacities[currentFrame].words},
    {opacity: opacities[name].words, duration: 1},
    0
  )

  tl.fromTo(
    "#letters",
    {opacity: opacities[currentFrame].letters},
    {opacity: opacities[name].letters, duration: 1},
    0
  )

  for (let key in oldMorphs) {
    if (newMorphs[key]) {
      console.log(oldMorphs[key])
      tl.fromTo(
        // oldMorphs[key],
        `[data-morph-id="${key}"]`,
        // "#shapes",
        { morphSVG: oldMorphs[key].getAttribute("d") },
        { morphSVG: newMorphs[key], duration: 1, ease: 'power1.inOut' },
        0
      );
    }
  }

  currentFrame = name
}

// function swapSVG(name) {
//   document.getElementById('frame').innerHTML = svgs[name];
// }


// const piece = document.getElementById("piece")
// const words = document.getElementById("words-diagram")
// const letters = document.getElementById("letters-diagram")

document.addEventListener("keydown", (ev) => {
  if (ev.key === "s") {swapSVG("piece")}
  else if (ev.key === "d") {swapSVG("words")}
  else if (ev.key === "f") {swapSVG("letters")}
})

// TODO next step: concatenate two of these into one timeline.