import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.join(__dirname, '../../');
const clientDir = path.join(rootDir, 'client/src');
const serverSrcDir = path.join(rootDir, 'server/src');

const forbiddenPatterns = [
  { pattern: /MOCK_REPOS|MOCK_PRS|MOCK_ISSUES/i, name: 'Mock Data Export/Import' },
  { pattern: /setDemoUser/i, name: 'Demo User Flag' },
  { pattern: /session_demo_1/i, name: 'Demo Session ID' },
  { pattern: /Math\.random/i, name: 'Math.random in UI/Services' },
  { pattern: /harsh-developer/i, name: 'Hardcoded Developer Username' },
  { pattern: /my-ecommerce-app/i, name: 'Hardcoded Demo Repo Name' },
  { pattern: /faker/i, name: 'Faker Library Usage' }
];

function scanDirectory(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      scanDirectory(filePath, fileList);
    } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
      // Exclude LandingPage.jsx static preview exemption (F1 rule: static example in landing page allowed)
      if (filePath.includes('LandingPage.jsx')) continue;
      fileList.push(filePath);
    }
  }
  return fileList;
}

function runNoDummyCheck() {
  console.log('====================================================');
  console.log(' CI CHECK: NO DUMMY DATA SCAN');
  console.log('====================================================');

  const filesToScan = [
    ...scanDirectory(clientDir),
    ...scanDirectory(serverSrcDir)
  ];

  let violations = 0;

  for (const file of filesToScan) {
    const content = fs.readFileSync(file, 'utf8');

    for (const rule of forbiddenPatterns) {
      if (rule.pattern.test(content)) {
        const relPath = path.relative(rootDir, file);
        console.error(`[FORBIDDEN DUMMY PATTERN] "${rule.name}" found in ${relPath}`);
        violations++;
      }
    }
  }

  if (violations > 0) {
    console.error(`\n[FAIL] Found ${violations} forbidden dummy data pattern violations! Exiting code 1.`);
    process.exit(1);
  } else {
    console.log(`\n[PASS] Scanned ${filesToScan.length} source files. 0 dummy data violations found!`);
    process.exit(0);
  }
}

runNoDummyCheck();
