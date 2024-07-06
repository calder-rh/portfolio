import random from '@src/scripts/random.js'

export function adjustColor({r, g, b}, ds, dv) {
  const gr = g - r;
  const br = b - r
  return {
    r: r * dv,
    g: (r + gr * ds) * dv,
    b: (r + br * ds) * dv,
  }
}

function lerp(x, y, a) {
  return x + a * (y - x)
}

export function colorLerp({r: r1, g: g1, b: b1}, {r: r2, g: g2, b: b2}, a) {
  return {
    r: lerp(r1, r2, a),
    g: lerp(g1, g2, a),
    b: lerp(b1, b2, a)
  }
}

export function tocColor() {
  return adjustColor({r: 183, g: 188, b: 194}, random(0.8, 1.1), random(0.95, 1.02))
}

export function cssString({r, g, b}) {
  return `rgb(${r}, ${g}, ${b})`
}