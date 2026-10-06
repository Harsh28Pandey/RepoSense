import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const clientSrcDir = path.resolve(__dirname, '../../client/src');

const forbiddenPricingPatterns = [
  { regex: /\b(pro plan|enterprise plan|free tier|pricing|subscription|billing|upgrade plan|tier)\b/i, message: 'Forbidden pricing/plan/tier text found' }
];

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

      for (const rule of forbiddenPricingPatterns) {
        if (rule.regex.test(content)) {
          const lines = content.split('\n');
          lines.forEach((line, index) => {
            // Ignore legitimate code comments if any, but flag UI text
            if (rule.regex.test(line) && !line.includes('test-no-pricing')) {
              errors.push(`${path.relative(clientSrcDir, fullPath)}:${index + 1} - ${rule.message}: "${line.trim()}"`);
            }
          });
        }
      }
    }
  }
}

console.log('🔍 Auditing code for strict prohibition of pricing, plan, tier, or billing text...');
walkDir(clientSrcDir);

if (errors.length > 0) {
  console.error(`❌ Pricing Audit FAILED with ${errors.length} violation(s):\n`);
  errors.forEach((err) => console.error(`  - ${err}`));
  process.exit(1);
} else {
  console.log(`✅ Pricing Audit PASSED! All ${scannedCount} files are completely free of pricing/plan text.`);
  process.exit(0);
}
