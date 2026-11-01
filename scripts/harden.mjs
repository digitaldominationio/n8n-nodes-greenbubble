#!/usr/bin/env node
/**
 * BLA (Blind LLM Agents) Counter-REA hardening for the published n8n node.
 *
 * The npm package ships compiled `dist/**` JavaScript that runs inside a
 * customer's n8n server — never in a browser — so shielding it raises the cost
 * for an AI reverse-engineering agent (REA) without affecting end-user payloads.
 *
 * Rewrites `dist/**` in place after backing up the originals to
 * `dist-bla-backup/` and verifying every rewritten file with `node --check`.
 *
 * Usage: npm run harden
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

writeFileSync(
  join(ROOT, ".bla-hardening-report.json"),
  JSON.stringify({ schema: "n8n-bla-hardening/v1", generatedAt: new Date().toISOString(), seed, hardened: ok, failed: failures }, null, 2) + "\n",
);

console.log(`[harden] ${ok}/${files.length} files shielded (backups in dist-bla-backup/)`);
if (failures.length) {
  console.error(`[harden] ${failures.length} file(s) left unshielded:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
