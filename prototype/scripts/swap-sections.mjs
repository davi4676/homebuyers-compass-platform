import { readFileSync, writeFileSync } from 'fs';

const path = 'c:/Users/yanad/homebuyers-compass-platform/prototype/app/results/ResultsPageBody.tsx';
const content = readFileSync(path, 'utf8');

const heroMarker = '      {/* ── Hero verdict block';
const aboveFoldMarker = '      {/* ═══════════════════════════════════════════════════════════════\n          ABOVE FOLD: 3 core sections only';
const lenderGapMarker = '      {/* ── Lender gap alert — always visible';

const heroStart = content.indexOf(heroMarker);
const aboveFoldStart = content.indexOf(aboveFoldMarker);
const lenderGapStart = content.indexOf(lenderGapMarker);

console.log('heroStart:', heroStart);
console.log('aboveFoldStart:', aboveFoldStart);
console.log('lenderGapStart:', lenderGapStart);
console.log('heroBlock length:', aboveFoldStart - heroStart);
console.log('aboveFoldBlock length:', lenderGapStart - aboveFoldStart);

// Extract the two blocks
const before = content.slice(0, heroStart);           // everything before hero block
const heroBlock = content.slice(heroStart, aboveFoldStart); // hero block content
const aboveFoldBlock = content.slice(aboveFoldStart, lenderGapStart); // above fold content
const after = content.slice(lenderGapStart);          // everything after (lender gap + rest)

// New order: above fold first, then hero block
const newContent = before + aboveFoldBlock + heroBlock + after;

writeFileSync(path, newContent, 'utf8');
console.log('Done! Sections swapped successfully.');
