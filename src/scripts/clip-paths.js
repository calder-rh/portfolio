import random from "./random";

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

export default function randomOvalPath() {
  const { low: tl, middle: t, high: tr } = randomAnchor();
  const { low: rt, middle: r, high: rb } = randomAnchor();
  const { low: bl, middle: b, high: br } = randomAnchor();
  const { low: lt, middle: l, high: lb } = randomAnchor();
  const pathStr = `M ${t} 0 C ${tr} 0, 100 ${rt}, 100 ${r} C 100 ${rb}, ${br} 100, ${b} 100 C ${bl} 100, 0 ${lb}, 0 ${l} C 0 ${lt}, ${tl} 0, ${t} 0`;
  return pathStr;
}
