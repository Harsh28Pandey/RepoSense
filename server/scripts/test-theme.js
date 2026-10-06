import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientSrcDir = path.resolve(__dirname, '../../client/src');

const forbiddenPatterns = [
  { regex: /\bdark:/i, message: 'Found "dark:" mode class modifier' },
  { regex: /\bbg-black\b/i, message: 'Found "bg-black" class' },
  { regex: /\bbg-gray-[89]00\b|\bbg-gray-950\b/i, message: 'Found dark gray background class' },
  { regex: /\bbg-slate-[89]00\b|\bbg-slate-950\b/i, message: 'Found dark slate background class' },
  { regex: /\bbg-zinc-/i, message: 'Found zinc background class' },
  { regex: /\bbg-neutral-[89]00\b|\bbg-neutral-950\b/i, message: 'Found dark neutral background class' },
  { regex: /bg-\[#(0B|11|1A|26|000|0)[\w]*\]/i, message: 'Found dark raw hex background' },
  { regex: /border-\[#(26|2A|1A)[\w]*\]/i, message: 'Found dark raw hex border' },
  { regex: /\btext-3xl\b|\btext-4xl\b|\btext-5xl\b|\btext-6xl\b/i, message: 'Found font size above 24px (text-3xl+)' },
];

const allowedHexes = new Set([
  'eef1f5', 'f7f8fa', 'fafbfc', 'e8ecf1', 'd3d9e2',
  '1f2a37', '5b6778', '8792a2', '2f6fde', '2459b8',
  'eff6ff', '2e8b57', 'f0fdf4', 'b7791f', 'fefce8',
  'c93c3c', 'fef2f2', 'dc2626', 'f87171', '2563eb',
  '8b96a5', 'bac2ce', 'ddeee4', 'd97706', 'f59e0b',
  'fee2e2', 'ef4444', 'fef3c7', 'eceef1', '1c2430',
  '4a5565', 'f5f6f8', 'f9fafb', 'e4e7ec', 'd2d7df',
  '2b5fd9', 'b91c1c', '236a42', 'ffffff', 'fff', '00000000'
]);

let errors = [];
let scannedCount = 0;

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.css')) {
      scannedCount++;
      const content = fs.readFileSync(fullPath, 'utf8');

      for (const rule of forbiddenPatterns) {
        if (rule.regex.test(content)) {
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            if (rule.regex.test(line)) {
              errors.push(`${path.relative(clientSrcDir, fullPath)}:${index + 1} - ${rule.message}: "${line.trim()}"`);
            }
          });
        }
      }

      const hexMatches = content.matchAll(/#([0-9a-fA-F]{3,8})/g);
      for (const match of hexMatches) {
        const hex = match[1].toLowerCase();
        if (!allowedHexes.has(hex) && hex !== 'ffffff' && hex !== 'fff') {
          const lineNumber = content.substring(0, match.index).split('\n').length;
          errors.push(`${path.relative(clientSrcDir, fullPath)}:${lineNumber} - Unauthorized raw hex colour "#${hex}" outside token set.`);
        }
      }
    }
  }
}

console.log('🔍 Auditing client theme tokens, font sizes, and dark mode classes...');
walkDir(clientSrcDir);

if (errors.length > 0) {
  console.error(`❌ Theme Audit FAILED with ${errors.length} violation(s):\n`);
  errors.forEach((err) => console.error(`  - ${err}`));
  process.exit(1);
} else {
  console.log(`\n✅ Theme Audit PASSED! All ${scannedCount} files strictly adhere to the single light design token system.`);
  process.exit(0);
}
