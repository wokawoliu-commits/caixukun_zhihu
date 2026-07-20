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
    .replaceAll('"/assets/', '"assets/')
    .replaceAll('"/downloads/', '"downloads/')
    .replaceAll('"/og-education-observatory.png', '"og-education-observatory.png')
    .replaceAll('"/og.png', '"og.png');
  fs.writeFileSync(target, html);
}

console.log(`Prepared GitHub Pages files in ${root}`);
