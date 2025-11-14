import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const WATCH_DIRS = ['pages'];
const WATCH_FILES = ['styles.css', 'build.js', 'marked-definition-list.js', 'marked-tweet.js'];

let buildTimeout = null;

function rebuild() {
  // Debounce rebuilds
  clearTimeout(buildTimeout);
  buildTimeout = setTimeout(() => {
    console.log('\n🔄 Changes detected, rebuilding...\n');
    spawn('node', ['build.js'], { stdio: 'inherit' });
  }, 100);
}

export function watchFiles() {
  // Watch directories
  for (const dir of WATCH_DIRS) {
    if (fs.existsSync(dir)) {
      fs.watch(dir, { recursive: true }, (eventType, filename) => {
        if (filename && filename.endsWith('.md')) {
          rebuild();
        }
      });
      console.log(`👀 Watching ${dir}/`);
    }
  }
  
  // Watch individual files
  for (const file of WATCH_FILES) {
    if (fs.existsSync(file)) {
      fs.watch(file, rebuild);
      console.log(`👀 Watching ${file}`);
    }
  }
  
  console.log('\n✨ Watching for changes... (Press Ctrl+C to stop)\n');
}

