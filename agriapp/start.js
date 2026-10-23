const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure D:\temp exists for caching
const tempDir = 'D:\\temp';
if (!fs.existsSync(tempDir)) {
  try {
    fs.mkdirSync(tempDir, { recursive: true });
  } catch (e) {
    // ignore
  }
}

// Redirect temp environment variables to D: drive (which has 88GB+ free)
process.env.TEMP = tempDir;
process.env.TMP = tempDir;

const args = process.argv.slice(2);
const expoCli = path.resolve(__dirname, '../node_modules/expo/bin/cli');

console.log('[AgriFlow Expo]: Using temp directory at ' + tempDir + ' with 8GB heap allocation...');

const child = spawn(process.execPath, [
  '--max-old-space-size=8192',
  expoCli,
  'start',
  ...args
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    TEMP: tempDir,
    TMP: tempDir,
    NODE_OPTIONS: ((process.env.NODE_OPTIONS || '') + ' --max-old-space-size=8192').trim(),
  },
});

child.on('exit', (code) => {
  process.exit(code !== null ? code : 0);
});
