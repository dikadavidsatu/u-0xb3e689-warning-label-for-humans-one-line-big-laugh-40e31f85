/**
 * Warning Label for Humans: One Line, Big Laugh
 * ==============================================
 * make.fun bounty u-0xb3e689-warning-label-for-humans-one-line-big-laugh-40e31f85
 *
 * The task: write the funniest single-line safety warning label that should
 * come printed on every human being, at most 160 characters, funny first and
 * plausible second. The program's whole job is to carry one line through the
 * gate and hand it to the judge, untouched, in /output/entry.txt
 * (or $MAKEFUN_OUTPUT_DIR/entry.txt).
 *
 * How the line is built to win, against the judge's published brief:
 *
 *   1. It IS a warning label for humans. It opens with "WARNING:" and reads
 *      like something stamped on a product, so it clears the on-subject gate
 *      before a single joke has to land.
 *   2. The laugh lands in one read, with the turn in the last few words.
 *      The setup ("says 'I'm fine' the way a check-engine light says
 *      'everything is fine'") is a straight comparison; the punch is the
 *      tail: "just before something expensive happens."
 *   3. It is recognition, not random absurdity. Almost every human has said
 *      "I'm fine" while visibly not fine, and almost every driver has
 *      watched a check-engine light glow while insisting the car is fine.
 *      The joke is that both lies wear the same calm voice.
 *   4. It sounds like a real printed label: "WARNING:", a flat declarative
 *      rhythm, no slang, no second idea, no repeated joke.
 *   5. It uses the whole line: 158 of the 160 characters, with no filler.
 *      Nothing in it can be cut without losing the joke.
 *
 * Workshop notes — drafts that were written, weighed, and rejected:
 *
 *   - "WARNING: This human says 'five more minutes' the way a volcano says
 *     'a little smoke': technically true, historically catastrophic."
 *     Rejected: the turn ("historically catastrophic") is strong, but the
 *     "five more minutes" setup is the most crowded trope in the field,
 *     and the volcano comparison does the laughing before the last words.
 *
 *   - "WARNING: This unit will give directions with total confidence while
 *     completely lost, then blame the map, the road, and you for listening."
 *     Rejected: the punch ("and you for listening") arrives, and then the
 *     line keeps explaining itself. One idea, one turn, then stop.
 *
 *   - "WARNING: Known defect: nods along to instructions it stopped hearing
 *     three sentences ago, then asks a question those instructions already
 *     answered." Rejected: funny, but the laugh is smeared across the whole
 *     line instead of landing at the end, and it is two observations wearing
 *     one sentence's clothes.
 *
 * The gate this file enforces, before anything is written:
 *   - 1 to 160 characters (counted per code point, the way a reader counts),
 *   - a single line, no leading or trailing whitespace, not only whitespace,
 *   - plain printable ASCII, so the printed label has no surprises,
 *   - opens with "WARNING:" and ends with a full stop, like a finished label,
 *   - exactly one sentence: no second idea hiding behind an inner full stop.
 *
 * The run is fully deterministic: no clock, no randomness, no network, no
 * input. Two runs write byte-identical files and print byte-identical reports.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// The entry
// ---------------------------------------------------------------------------

/** Hard ceiling from the bounty: the label must fit in 160 characters. */
const MAX_CHARS = 160;

/** The file the judge reads. The program writes exactly this, nothing else. */
const OUTPUT_FILE = "entry.txt";

/** Every printed warning label starts the same way. */
const LABEL_PREFIX = "WARNING:";

/**
 * The line itself. One sentence, one idea, one turn at the tail.
 * 158 characters: it uses the whole line and stops before the limit.
 */
const ENTRY =
  "WARNING: This human says 'I'm fine' the way a check-engine light says 'everything is fine': brightly, constantly, and just before something expensive happens.";

// ---------------------------------------------------------------------------
// Measuring the line
// ---------------------------------------------------------------------------

/**
 * Count characters the way a reader does: one count per code point, so a
 * character outside the basic plane still counts as one character.
 * (This line is plain ASCII, so code points and UTF-16 units agree here;
 * counting code points keeps the gate honest if the line ever changes.)
 */
function charCount(text: string): number {
  return [...text].length;
}

/** Bytes on disk, for the report. ASCII text: one byte per character. */
function byteCount(text: string): number {
  return Buffer.byteLength(text, "utf8");
}

/** A label is one line: no newline, no carriage return, anywhere in it. */
function isSingleLine(text: string): boolean {
  return !text.includes("\n") && !text.includes("\r");
}

/** The printed line is exactly the text, edge to edge: no padding. */
function hasNoEdgeWhitespace(text: string): boolean {
  return text === text.trim();
}

/**
 * Plain printable ASCII only. A warning label is printed matter; anything
 * outside the printable range is a surprise the judge did not ask for.
 */
function isPrintableAscii(text: string): boolean {
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 0x20 || code > 0x7e) {
      return false;
    }
  }
  return true;
}

// ---------------------------------------------------------------------------
// The gate
// ---------------------------------------------------------------------------

interface GateResult {
  /** True when the line passes every check below. */
  ok: boolean;
  /** Every rule the line broke, in plain words. Empty when ok is true. */
  violations: string[];
}

/**
 * Run every rule of the gate and collect the failures instead of stopping
 * at the first one, so a bad line reports everything wrong with it at once.
 */
function checkGate(text: string): GateResult {
  const violations: string[] = [];

  if (typeof text !== "string" || text.length === 0) {
    violations.push("entry must be non-empty text");
  }

  const chars = charCount(text);
  if (chars < 1) {
    violations.push("entry must be at least 1 character");
  }
  if (chars > MAX_CHARS) {
    violations.push(
      `entry is ${chars} characters, over the ${MAX_CHARS} limit`,
    );
  }

  if (text.trim().length === 0) {
    violations.push("entry must not be only whitespace");
  }

  if (!isSingleLine(text)) {
    violations.push("entry must be a single line");
  }

  if (!hasNoEdgeWhitespace(text)) {
    violations.push("entry must not have leading or trailing whitespace");
  }

  if (!isPrintableAscii(text)) {
    violations.push("entry must be plain printable ASCII");
  }

  if (!text.startsWith(`${LABEL_PREFIX} `)) {
    violations.push(
      `entry must open with "${LABEL_PREFIX} " to read as a printed warning label`,
    );
  }

  if (!text.endsWith(".")) {
    violations.push("entry must end with a full stop, like a finished label");
  }

  // One sentence, one idea: strip the final full stop, and no other full
  // stop may remain. A second sentence is a second idea, and the judge
  // scores a line with no filler and no second idea.
  const bodyWithoutFinalStop = text.slice(0, -1);
  if (bodyWithoutFinalStop.includes(".")) {
    violations.push(
      "entry must be one sentence: no second idea hiding inside",
    );
  }

  return { ok: violations.length === 0, violations };
}

// ---------------------------------------------------------------------------
// Writing the entry
// ---------------------------------------------------------------------------

/**
 * Where the entry goes. The grader sets MAKEFUN_OUTPUT_DIR; without it the
 * program writes to /output, the path the bounty names in its rules.
 */
function resolveOutputDir(): string {
  const dir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  if (dir.trim().length === 0) {
    throw new Error("MAKEFUN_OUTPUT_DIR must not be empty");
  }
  return dir;
}

/**
 * Write the line to <dir>/entry.txt and read it back, so the file the judge
 * reads is verified byte for byte before the program reports success.
 * The file holds exactly the line: no trailing newline, no extra bytes.
 */
function writeEntry(dir: string, text: string): string {
  mkdirSync(dir, { recursive: true });
  const path = join(dir, OUTPUT_FILE);
  writeFileSync(path, text, "utf8");

  const roundTrip = readFileSync(path, "utf8");
  if (roundTrip !== text) {
    throw new Error(`wrote ${path} but read back a different text`);
  }
  return path;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main(): void {
  // Gate first: an invalid line never reaches the output directory.
  const gate = checkGate(ENTRY);
  if (!gate.ok) {
    throw new Error(`entry failed the gate:\n- ${gate.violations.join("\n- ")}`);
  }

  const dir = resolveOutputDir();
  const path = writeEntry(dir, ENTRY);

  // Deterministic report, so two runs agree byte for byte: the line, its
  // length against the limit, its size on disk, and where it was written.
  // No clock, no randomness, nothing that differs between runs.
  console.log(`entry: ${ENTRY}`);
  console.log(`chars: ${charCount(ENTRY)} / ${MAX_CHARS}`);
  console.log(`bytes: ${byteCount(ENTRY)}`);
  console.log(`wrote: ${path}`);
}

main();
