import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const htmlPaths = ["web/index.html", "web/game-mobile.html"];
let checked = 0;
for (const relPath of htmlPaths) {
  const htmlPath = path.resolve(relPath);
  const html = fs.readFileSync(htmlPath, "utf8");
  const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)];
  if (scripts.length === 0) {
    throw new Error(`No inline scripts found in ${relPath}`);
  }
  for (const [index, match] of scripts.entries()) {
    new vm.Script(match[1], {
      filename: `${relPath}#script-${index + 1}`,
    });
    checked += 1;
  }
}

console.log(`Frontend lint passed: ${checked} inline script blocks checked.`);
