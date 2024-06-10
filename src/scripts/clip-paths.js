import random from "./random";

function center() {
  return random(47, 53);
}

function handle(squareness) {
  return random(squareness - 3, squareness + 3);
}

function randomAnchor(squareness) {
  const middleValue = center();
  return {
    low: middleValue - handle(squareness),
    middle: middleValue,
    high: middleValue + handle(squareness)
  }
}

export default function randomOvalPath(squareness) {
  const { low: tl, middle: t, high: tr } = randomAnchor(squareness);
  const { low: rt, middle: r, high: rb } = randomAnchor(squareness);
  const { low: bl, middle: b, high: br } = randomAnchor(squareness);
  const { low: lt, middle: l, high: lb } = randomAnchor(squareness);
  const pathStr = `M ${t} 0 C ${tr} 0, 100 ${rt}, 100 ${r} C 100 ${rb}, ${br} 100, ${b} 100 C ${bl} 100, 0 ${lb}, 0 ${l} C 0 ${lt}, ${tl} 0, ${t} 0`;
  return pathStr;
}
