// Birthday message split into 12 natural sentence fragments.
// Reading order = assignedNumber. Dynamic split for any 1-12 player count.
export const SENTENCES = [
  "Happy birthday.",
  "I once read that love is not measured by how long we stay together,",
  "but by how deeply we grow through everything we face together.",
  "And when I look back at all the laughter, the silence,",
  "the difficult days, and the small moments in between,",
  "I realize how much those moments became some of the most meaningful parts of my life.",
  "Thank you for being part of my days in ways words could never fully explain.",
  "For every joy you brought, every comfort you gave,",
  "and every memory we created together.",
  "I hope life continues to be gentle with you,",
  "and I hope you never forget how appreciated, cherished, and deeply loved you are.",
  "Happy birthday.",
];

// Split sentences into N balanced fragments (1 <= N).
// If N >= 12, each fragment is one sentence (last extra fragments duplicate the final sentence).
// If N < 12, sentences are grouped consecutively into N near-equal chunks.
export function getFragmentsForCount(n) {
  const total = SENTENCES.length;
  if (n <= 0) return [];
  if (n === 1) return [SENTENCES.join(" ")];
  if (n >= total) {
    const out = SENTENCES.slice();
    while (out.length < n) out.push(SENTENCES[total - 1]);
    return out;
  }
  const out = [];
  const baseSize = Math.floor(total / n);
  const remainder = total % n;
  let idx = 0;
  for (let i = 0; i < n; i++) {
    const size = baseSize + (i < remainder ? 1 : 0);
    out.push(SENTENCES.slice(idx, idx + size).join(" "));
    idx += size;
  }
  return out;
}

// Backwards-compat helper used as fallback if assignedFragment is not yet written.
export const MESSAGE_FRAGMENTS = SENTENCES;
export const getFragment = (assignedNumber) =>
  SENTENCES[(assignedNumber - 1) % SENTENCES.length];
