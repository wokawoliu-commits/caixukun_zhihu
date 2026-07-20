import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const client = path.join(root, "dist", "client");

if (!fs.existsSync(path.join(client, "index.html"))) {
  throw new Error("Static export is missing dist/client/index.html");
}

for (const file of ["index.html", "index.rsc", "404.html", "_headers", "favicon.svg", "file.svg", "globe.svg", "window.svg", "og-education-observatory.png", "og.png"]) {
  const source = path.join(client, file);
  if (fs.existsSync(source)) fs.copyFileSync(source, path.join(root, file));
}

for (const directory of ["assets", "downloads"]) {
  const source = path.join(client, directory);
  const target = path.join(root, directory);
  if (fs.existsSync(source)) {
    fs.rmSync(target, { recursive: true, force: true });
    fs.cpSync(source, target, { recursive: true });
  }
}

for (const file of ["index.html", "index.rsc", "404.html"]) {
  const target = path.join(root, file);
  if (!fs.existsSync(target)) continue;
  const html = fs.readFileSync(target, "utf8")
    .replaceAll('"/assets/', '"./assets/')
    .replaceAll('"/downloads/', '"./downloads/')
    .replaceAll('"/og-education-observatory.png', '"./og-education-observatory.png')
    .replaceAll('"/og.png', '"./og.png');
  fs.writeFileSync(target, html);
}

// Vinext's runtime preload helper is emitted with a root-relative prefix.
// GitHub Pages serves this app below /xuequ/fenxi1/, so make those preload
// URLs document-relative as well; otherwise the page shell renders but the
// client comparison bundle is requested from the domain root and never runs.
const assets = path.join(root, "assets");
if (fs.existsSync(assets)) {
  for (const file of fs.readdirSync(assets)) {
    if (!file.endsWith(".js")) continue;
    const target = path.join(assets, file);
    const source = fs.readFileSync(target, "utf8");
    const rewritten = source.replaceAll("return`/`+e", "return`./`+e");
    if (rewritten !== source) fs.writeFileSync(target, rewritten);
  }
}

console.log(`Prepared GitHub Pages files in ${root}`);
