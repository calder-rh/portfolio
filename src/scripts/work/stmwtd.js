import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(Flip, MorphSVGPlugin);

const frames = ["piece", "words", "letters"]

const svgs = {
  piece: document.getElementById('piece-frame').innerHTML,
  words: document.getElementById('words-frame').innerHTML,
  letters: document.getElementById('letters-frame').innerHTML
};

const frameEl = document.getElementById("frame")




// const states = {}
// for (let frameName of frames) {
//   frameEl.innerHTML = svgs[frameName]
//   states[frameName] = Flip.getState('#frame *:not(.morph)')
// }

const slider = document.getElementById("slider")

const opacities = {
  piece: {words: 0, letters: 0},
  words: {words: 1, letters: 0},
  letters: {words: 1, letters: 1},
}

frameEl.innerHTML = svgs.piece
document.getElementById("words").style.opacity = 0
document.getElementById("letters").style.opacity = 0

const tl = gsap.timeline({ paused: true })

for (let i = 1; i < frames.length; i++) {
  const frameName = frames[i]
  const prevFrameName = frames[i - 1]

  MorphSVGPlugin.convertToPath("#frame polygon");

  // const oldMorphs = {};
  // document.querySelectorAll('#frame .morph').forEach(p => {
  //   oldMorphs[p.dataset.morphId] = p;
  // });

  // MorphSVGPlugin.convertToPath("#frame polygon");

  // const newMorphs = {};
  // document.querySelectorAll('#frame .morph').forEach(p => {
  //   newMorphs[p.dataset.morphId] = p;
  // });

  // tl.add(() => {
  //   frameEl.innerHTML = svgs[frameName];
  // }, i);

  // const state = states[prevFrameName]
  // frameEl.innerHTML = svgs[frameName];
  // tl.add(
  //   Flip.from(state, {
  //     targets: '#frame *:not(.morph)',
  //     duration: 1,
  //     ease: 'linear',
  //     absolute: true,
  //   }),
  //   i - 1
  // )

  // tl.to({}, { duration: 1 })

  
  // tl.add(
  //   Flip.to(endState, {
  //     duration: 1,
  //     ease: 'linear',
  //     absolute: true,
  //   })
  // )
  const state = Flip.getState('#frame *');
  frameEl.innerHTML = svgs[frameName];
  tl.add(
    Flip.from(state, {
      targets: "#frame *",
      duration: 1,
      ease: 'linear',
      absolute: true,
    }),
  )

  // tl.fromTo(
  //   "#words",
  //   {opacity: opacities[prevFrameName].words},
  //   {opacity: opacities[frameName].words, duration: 1},
  //   i - 1
  // )

  // tl.fromTo(
  //   "#letters",
  //   {opacity: opacities[prevFrameName].letters},
  //   {opacity: opacities[frameName].letters, duration: 1},
  //   i - 1
  // )

  // for (let key in oldMorphs) {
  //   if (newMorphs[key]) {
  //     tl.fromTo(
  //       `[data-morph-id="${key}"]`,
  //       { morphSVG: oldMorphs[key].getAttribute("d") },
  //       { morphSVG: newMorphs[key], duration: 1, ease: 'linear' },
  //       i - 1
  //     );
  //   }
  // }
}



// gsap.set("#words", {opacity: 0})
// gsap.set("#letters", {opacity: 0})

slider.addEventListener("input", () => {
  tl.progress(slider.value);
});