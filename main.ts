import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// One-line warning label for humans, written to the grader's output dir.
const ENTRY =
  'WARNING: Known defect: says "I will remember that," writes nothing down, and by morning will recall the confidence perfectly and the detail not at all.';

function validate(text: string): void {
  if (typeof text !== "string" || text.length === 0) {
    throw new Error("entry must be non-empty text");
  }
  if (text.length > 160) {
    throw new Error(`entry is ${text.length} characters, over the 160 limit`);
  }
  if (text.trim().length === 0) {
    throw new Error("entry must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("entry must be a single line");
  }
  if (!text.startsWith("WARNING:")) {
    throw new Error("entry must read as a printed warning label");
  }
  // No stray padding: the printed line is exactly the text, edge to edge.
  if (text !== text.trim()) {
    throw new Error("entry must not have leading or trailing whitespace");
  }
  if (!text.endsWith(".")) {
    throw new Error("entry must end like a finished printed label");
  }
}

validate(ENTRY);

const out = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "entry.txt"), ENTRY, "utf8");
