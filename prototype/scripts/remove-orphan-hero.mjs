import { readFileSync, writeFileSync } from 'fs';

const path = 'c:/Users/yanad/homebuyers-compass-platform/prototype/app/results/ResultsPageBody.tsx';
const content = readFileSync(path, 'utf8');
const lines = content.split('\n');

// Find the line with REMOVED_DUPLICATE_HERO_MIDDLE (0-based)
const markerIdx = lines.findIndex((l) => l.includes('REMOVED_DUPLICATE_HERO_MIDDLE'));
if (markerIdx === -1) {
  console.error('Marker not found');
  process.exit(1);
}

// Find the line with "Sticky nav" comment; orphan ends the line before it
const stickyIdx = lines.findIndex((l, i) => i > markerIdx && l.includes('Sticky nav: minimal CTAs'));
if (stickyIdx === -1) {
  console.error('Sticky nav comment not found');
  process.exit(1);
}
const endIdx = stickyIdx - 1; // remove through the line before Sticky nav

// Remove lines from markerIdx through endIdx (inclusive)
const newLines = [...lines.slice(0, markerIdx), ...lines.slice(endIdx + 1)];
writeFileSync(path, newLines.join('\n'), 'utf8');
console.log('Removed lines', markerIdx + 1, 'through', endIdx + 1);
