// add-morph-ids.mjs
import fs from "fs";
import { JSDOM } from "jsdom";

// usage: node --experimental-modules add-morph-ids.mjs input.svg output.svg
const [,, inputFile, outputFile] = process.argv;

if (!inputFile || !outputFile) {
  console.error("Usage: node add-morph-ids.mjs input.svg output.svg");
  process.exit(1);
}

const svgText = fs.readFileSync(inputFile, "utf8");

// Parse SVG as XML
const dom = new JSDOM(svgText, { contentType: "image/svg+xml" });
const document = dom.window.document;

// Collect all <path> elements
const paths = [...document.querySelectorAll("path")];

// Find max existing data-morph-id
let maxId = 0;
for (const path of paths) {
  const id = path.getAttribute("data-morph-id");
  if (id && !isNaN(id)) {
    maxId = Math.max(maxId, Number(id));
  }
}

// Assign missing data-morph-id incrementally
let nextId = maxId + 1;
for (const path of paths) {
  if (!path.hasAttribute("data-morph-id")) {
    path.setAttribute("data-morph-id", String(nextId++));
  }
}

// Write updated SVG to output file
fs.writeFileSync(outputFile, dom.serialize(), "utf8");

console.log(`Updated SVG saved to ${outputFile}`);
