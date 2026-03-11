import { promises as fs } from "node:fs";
import path from "node:path";

const files = [
  "node_modules/fabric/tsconfig.json",
  "node_modules/fabric/tsconfig-extensions.json",
];

function patchModuleResolution(contents) {
  // TypeScript deprecated "node" then "node10"; "node16" is the safe forward value.
  return contents.replace(
    /("moduleResolution"\s*:\s*)"(node|node10)"(\s*\/\*.*?\*\/)?/g,
    (_m, prefix, _value, comment = "") => `${prefix}"node16"${comment}`,
  );
}

function ensureIgnoreDeprecations(contents) {
  if (/"ignoreDeprecations"\s*:/.test(contents)) return contents;
  // Insert near the top of compilerOptions to keep diffs stable.
  return contents.replace(
    /("compilerOptions"\s*:\s*\{\s*\n)/,
    `$1    "ignoreDeprecations": "6.0",\n`,
  );
}

async function patchFile(relPath) {
  const absPath = path.resolve(process.cwd(), relPath);

  let original;
  try {
    original = await fs.readFile(absPath, "utf8");
  } catch (err) {
    if (err && (err.code === "ENOENT" || err.code === "ENOTDIR")) return false;
    throw err;
  }

  let patched = patchModuleResolution(original);
  patched = ensureIgnoreDeprecations(patched);
  if (patched === original) return false;

  await fs.writeFile(absPath, patched, "utf8");
  return true;
}

let changed = 0;
for (const relPath of files) {
  if (await patchFile(relPath)) changed += 1;
}

if (changed > 0) {
  // Keep output minimal; npm will show this once per install.
  console.log(`[postinstall] Patched fabric tsconfig (${changed} file${changed === 1 ? "" : "s"})`);
}
