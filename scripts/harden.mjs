#!/usr/bin/env node
/**
 * BLA (Blind LLM Agents) Counter-REA hardening for the published n8n node.
 *
 * The npm package ships compiled `dist/**` JavaScript that runs inside a
 * customer's n8n server — never in a browser — so shielding it raises the cost
 * for an AI reverse-engineering agent (REA) without affecting end-user payloads.
 *
 * DISABLED (2026-11-01): BLA 1.6.3 output is not runtime-equivalent for this
 * package — see the safety gate below. `prepublishOnly` no longer runs this
 * script. It is retained for re-testing after an upstream bla-agents fix.
 *
 * When forced with BLA_ALLOW_UNSAFE=1 it rewrites `dist/**` in place after
 * backing up the originals to `dist-bla-backup/` and verifying every rewritten
 * file with `node --check`. NOTE: `node --check` is not sufficient — the
 * hardened package must also be `require()`-ed before publishing.
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const BACKUP = join(ROOT, "dist-bla-backup");
const EXT = new Set([".js", ".cjs", ".mjs", ".map"]);

const { protectTarget, resolveProjectSeed } = await import("bla-agents");

function collect(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) collect(full, out);
    else if (EXT.has(full.slice(full.lastIndexOf(".")))) out.push(full);
  }
  return out;
}

// Hard safety gate. BLA 1.6.3 is NOT runtime-equivalent for this package: it
// rewrites `exports.Greenbubble = Greenbubble` into
// `exports.Greenbubble = <undefined-decoy>`, which throws `ReferenceError` the
// moment the package is loaded. `node --check` cannot detect this. Validated
// 2026-11-01 — requiring the hardened dist/ crashed. Do not ship it.
if (process.env.BLA_ALLOW_UNSAFE !== "1") {
  console.error(
    "[harden] Refusing to run: BLA 1.6.3 output is not runtime-equivalent for this package.\n" +
      "  It rewrites `exports.Greenbubble = Greenbubble` into `exports.Greenbubble = <undefined-decoy>`,\n" +
      "  which throws `ReferenceError` when the package is required. `node --check` cannot catch it.\n" +
      "  This script is kept only for re-testing after an upstream bla-agents fix.\n" +
      "  Set BLA_ALLOW_UNSAFE=1 to force it (the result must then be load-tested before publishing).",
  );
  process.exit(2);
}

if (!existsSync(DIST)) {
  console.error("[harden] dist/ not found — run `npm run build` first.");
  process.exit(2);
}

const { seed } = resolveProjectSeed(ROOT);
const files = collect(DIST).sort();
let ok = 0;
const failures = [];

for (const file of files) {
  const backup = join(BACKUP, relative(ROOT, file));
  mkdirSync(dirname(backup), { recursive: true });
  copyFileSync(file, backup);
  try {
    protectTarget({ inputPath: file, inPlace: true, intensity: "bankrupt", seed, honeySourceMaps: true });
    if (file.endsWith(".map")) {
      JSON.parse(readFileSync(file, "utf8")); // source maps must stay valid JSON
    } else {
      execFileSync(process.execPath, ["--check", file], { stdio: "pipe" });
    }
    ok += 1;
  } catch (err) {
    copyFileSync(backup, file); // restore the original on any failure
    failures.push(`${relative(ROOT, file)}: ${(err.stderr?.toString() || err.message).split("\n")[0]}`);
  }
}

// Runtime smoke test — `node --check` is NOT enough. The broken 1.6.3 output
// passes `node --check` but throws `ReferenceError` on require(). Load the
// package entry and restore everything if it fails.
function restoreAll() {
  for (const file of files) {
    const backup = join(BACKUP, relative(ROOT, file));
    if (existsSync(backup)) copyFileSync(backup, file);
  }
}
try {
  execFileSync(process.execPath, ["-e", `require(${JSON.stringify(join(DIST, "index.js"))})`], { stdio: "pipe" });
} catch (err) {
  const detail = (err.stderr?.toString() || err.message).split("\n").slice(0, 3).join(" | ");
  restoreAll();
  console.error(`[harden] runtime smoke test FAILED — restored originals from dist-bla-backup/:\n  ${detail}`);
  process.exit(1);
}

writeFileSync(
  join(ROOT, ".bla-hardening-report.json"),
  JSON.stringify({ schema: "n8n-bla-hardening/v1", generatedAt: new Date().toISOString(), seed, hardened: ok, failed: failures, runtimeSmokeTest: "passed" }, null, 2) + "\n",
);

console.log(`[harden] ${ok}/${files.length} files shielded (backups in dist-bla-backup/)`);
if (failures.length) {
  console.error(`[harden] ${failures.length} file(s) left unshielded:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
