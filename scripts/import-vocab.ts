import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { parseVocabFile } from "../lib/vocab";

const file = process.argv[2];

if (!file) {
  console.error("Usage: npm run import:vocab -- ./data/source.json");
  process.exit(1);
}

const input = readFileSync(file, "utf8");
const type = file.toLowerCase().endsWith(".json") ? "json" : "csv";
const entries = parseVocabFile(input, type);

console.log(JSON.stringify({ file: basename(file), count: entries.length, entries }, null, 2));
