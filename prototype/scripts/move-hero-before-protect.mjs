import { readFileSync, writeFileSync } from 'fs';

const path = 'c:/Users/yanad/homebuyers-compass-platform/prototype/app/results/ResultsPageBody.tsx';
let content = readFileSync(path, 'utf8');

// 1. Extract hero block (the motion.div only, not the ternary). Lines in file: 1012-1271 (0-indexed: 1011-1270)
const lines = content.split('\n');
const heroStartLine = 1011;  // 0-based: line 1012 in editor
const heroEndLine = 1270;    // 0-based: line 1271 in editor
const heroBlock = lines.slice(heroStartLine, heroEndLine + 1);
// Indent by 4 spaces for insertion inside snapshot card
const heroBlockIndented = heroBlock.map((line) => '    ' + line).join('\n');

// 2. Insert before "Protect your buying power now". Find the unique anchor: the closing </div> and <p> swipe hint, then the next <div> that contains "Protect your buying power now"
const protectAnchor = `<p className="sm:hidden text-center text-[10px] text-slate-400 mt-1.5">← swipe to see all cards →</p>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-3.5 sm:p-4 shadow-sm">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700">
                <Lightbulb className="h-3.5 w-3.5" />
                Protect your buying power now`;

const insertContent = `

            {/* ── Savings summary + Educational preparedness (moved before Protect your buying power) ── */}
            ${heroBlockIndented}
`;

if (!content.includes(protectAnchor)) {
  console.error('Anchor for "Protect your buying power now" not found');
  process.exit(1);
}

content = content.replace(
  protectAnchor,
  `</p>
            </div>

            ${heroBlockIndented}

            <div className="mt-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-3.5 sm:p-4 shadow-sm">
              <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-700">
                <Lightbulb className="h-3.5 w-3.5" />
                Protect your buying power now`
);

// Fix: I accidentally replaced the opening <p> and </div> - the anchor included "← swipe..." so we need to restore the structure. Let me re-read and do a simpler replace: just insert the hero block between </div> and the <div className="mt-4 rounded-2xl...
// Redo: use a more minimal anchor and only insert between two specific lines.
console.log('Insert done. Checking...');
const idx = content.indexOf('Protect your buying power now');
console.log('Protect your buying power now at:', idx);
if (idx === -1) {
  console.error('Broke the file - Protect your buying power now missing');
  process.exit(1);
}

// 3. Remove the hero block from its old position (now at different line numbers because we inserted content). Find and replace the ternary so first-time shows nothing there.
const oldHeroComment = '      {/* ── Hero verdict block ─────────────────────────────────────── */}';
const oldTernaryStart = content.indexOf(oldHeroComment);
if (oldTernaryStart === -1) {
  console.error('Hero verdict block comment not found');
  process.exit(1);
}

// Find the end of the ternary: "      )}" that closes the ternary after the placeholder div
const afterComment = content.slice(oldTernaryStart);
const ternaryEndMatch = afterComment.match(/\n      \)\)\s*\n\n      \{\/\* ── Sticky nav/);
if (!ternaryEndMatch) {
  console.error('Could not find end of ternary (before Sticky nav)');
  process.exit(1);
}
const ternaryEndIndex = oldTernaryStart + ternaryEndMatch.index + ternaryEndMatch[0].indexOf(')');
const ternaryBlock = content.slice(oldTernaryStart, ternaryEndIndex + 2); // include "\n      )}\n"

// Replace with: only show placeholder when NOT (first-time with results)
const replacement = `      {/* Hero verdict + savings summary moved into snapshot card above (before Protect your buying power) */}
      {!hasResults || resType !== 'first-time' ? (
        <div className="relative h-28 sm:h-32 overflow-hidden rounded-2xl mb-4 sm:mb-5">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgba(30,58,95,0.85) 0%, rgba(30,64,175,0.75) 50%, rgba(59,130,246,0.6) 100%), url(https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1400&q=80)',
            }}
          />
          <div className="absolute inset-0 flex items-center px-6 sm:px-10">
            <p className="text-white text-lg sm:text-xl font-semibold opacity-90">
              {firstName ? \`\${firstName}'s Savings Snapshot\` : 'Your Savings Snapshot'}
            </p>
          </div>
        </div>
      ) : null}`;

// Find exact range of the full ternary including the opening {hasResults && ...
const lineStart = content.slice(0, oldTernaryStart).split('\n').length;
let depth = 0;
let pos = oldTernaryStart;
const open = content.indexOf('{hasResults && resType === \'first-time\' ? (', pos);
if (open === -1) {
  console.error('Ternary start not found');
  process.exit(1);
}
// Extract from comment through the closing ); for the ternary
const blockStart = oldTernaryComment;
const blockEnd = '\n      )}\n\n      {/* ── Sticky nav';
const blockEndIdx = content.indexOf(blockEnd);
if (blockEndIdx === -1) {
  console.error('Block end not found');
  process.exit(1);
}
const fullBlock = content.slice(oldTernaryStart, blockEndIdx + 1); // +1 to include the \n

content = content.replace(fullBlock, replacement + '\n\n');

writeFileSync(path, content, 'utf8');
console.log('Done. Hero block moved before Protect your buying power now; old position replaced with conditional placeholder.');
console.log('Verifying: Protect your buying power now still present:', content.includes('Protect your buying power now'));
console.log('Verifying: Hero content in new place:', content.includes('in potential savings identified across') && content.indexOf('Protect your buying power now') > content.indexOf('in potential savings identified across'));
