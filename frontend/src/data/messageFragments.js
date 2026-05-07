// Birthday message split into 12 fragments. Reading order = assignedNumber.
export const MESSAGE_FRAGMENTS = [
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

export const getFragment = (assignedNumber) => {
  const idx = (assignedNumber - 1) % MESSAGE_FRAGMENTS.length;
  return MESSAGE_FRAGMENTS[idx];
};
