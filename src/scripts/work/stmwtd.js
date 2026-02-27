import { gsap } from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(MorphSVGPlugin);



const frameContainer = document.getElementById("frame-container")
const slider = document.getElementById("slider")

const tl = gsap.timeline({ paused: true })

const opacities = [
  {words: 0, letters: 0},
  {words: 1, letters: 0},
  {words: 1, letters: 1},
]



document.addEventListener("DOMContentLoaded", () => {
  for (let frame of ['piece-frame', 'words-frame', 'letters-frame']) {
    const paths = document.getElementById(frame).content.querySelectorAll('path')
    let i = 1
    for (let path of paths) {
      if (path.dataset.morphId === undefined) {
        path.dataset.morphId = `morph-${i++}`
      }
    }
  }

  const frames = [
    document.getElementById('piece-frame').innerHTML,
    document.getElementById('words-frame').innerHTML,
    document.getElementById('letters-frame').innerHTML,
  ]

  const morphses = []
  for (let frame of frames) {
    frameContainer.innerHTML = frame
    MorphSVGPlugin.convertToPath("polygon")

    const morphs = {}
    for (let p of document.querySelectorAll('#frame-container path[data-morph-id]')) {
      morphs[p.dataset.morphId] = p
    }
    
    morphses.push(morphs)
  }

  console.log(morphses)

  frameContainer.innerHTML = frames[0]
  MorphSVGPlugin.convertToPath("polygon")

  for (let i = 1; i < frames.length; i++) {
    const morphs = morphses[i]
    for (let key in morphs) {
      tl.to(
        `[data-morph-id="${key}"]`,
        { morphSVG: morphs[key].getAttribute("d"), duration: 1, ease: 'linear' },
        i - 1
      );
    }


    tl.fromTo(
      "#words",
      {opacity: opacities[i-1].words},
      {opacity: opacities[i].words, duration: 1},
      i - 1
    )

    tl.fromTo(
      "#letters",
      {opacity: opacities[i-1].letters},
      {opacity: opacities[i].letters, duration: 1},
      i - 1
    )
  }

  gsap.set("#words", {opacity: 0})
  gsap.set("#letters", {opacity: 0})
})



slider.addEventListener("input", () => {
  tl.progress(slider.value);
});