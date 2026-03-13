import { gsap } from "gsap";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

gsap.registerPlugin(MorphSVGPlugin);



const frameContainer = document.getElementById("frame-container")
const slider = document.getElementById("slider")

const tl = gsap.timeline({ paused: true })

const opacities = [
  {words: 0, connectors: 0, letters: 0},
  {words: 1, connectors: 0, letters: 0},
  {words: 1, connectors: 0, letters: 0},
  {words: 1, connectors: 1, letters: 0},
  {words: 0, connectors: 1, letters: 1},
]

const durations = [
  1, 1, 0.5, 1
]

function animIDs(el, ancestors=[]) {
  if (ancestors.length !== 0) {
    const idStr = ancestors.join('-')
    el.dataset.animId = idStr
  }
  let unnamedIndex = 1
  const existingChildNames = []
  for (let child of el.children) {
    const childAncestors = [...ancestors]
    const childNameBase = (() => {
      if (child.dataset.name !== undefined) return child.dataset.name
      else if (child.hasAttribute('id')) return child.id
      else return `el${unnamedIndex++}`
    })()
    let childName = childNameBase
    let disambiguator = 2
    while (existingChildNames.includes(childName)) {
      childName = `${childNameBase}${disambiguator++}`
    }
    childAncestors.push(childName)
    existingChildNames.push(childName)
    animIDs(child, childAncestors)
  }
}

document.addEventListener("DOMContentLoaded", () => {
  for (let i = 1; i <= 4; i++) {
    animIDs(document.getElementById(`frame-${i}`).content.querySelector('svg'))
  }

  const frames = [1, 2, 3, 3, 4].map(n => document.getElementById(`frame-${n}`).innerHTML);

  const morphses = []
  for (let frame of frames) {
    frameContainer.innerHTML = frame
    MorphSVGPlugin.convertToPath("polygon")

    const morphs = {}
    for (let p of document.querySelectorAll('#frame-container path[data-anim-id]')) {
      morphs[p.dataset['animId']] = p
    }
    
    morphses.push(morphs)
  }

  frameContainer.innerHTML = frames[0]
  MorphSVGPlugin.convertToPath("polygon")

  let lastTime = 0
  for (let i = 1; i < frames.length; i++) {
    const morphs = morphses[i]
    for (let key in morphs) {
      tl.to(
        `[data-anim-id="${key}"]`,
        { morphSVG: morphs[key].getAttribute("d"), duration: durations[i - 1], ease: 'linear' },
        lastTime
      );
    }

    for (let layerName of ['words', 'connectors', 'letters']) {
      tl.fromTo(
        `#${layerName}`,
        {opacity: opacities[i-1][layerName]},
        {opacity: opacities[i][layerName], duration: durations[i - 1]},
        lastTime
      )
    }
    lastTime += durations[i-1]
  }

  gsap.set("#words", {opacity: 0})
  gsap.set("#connectors", {opacity: 0})
  gsap.set("#letters", {opacity: 0})
})



slider.addEventListener("input", () => {
  tl.progress(slider.value);
});