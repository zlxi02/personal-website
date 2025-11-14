import { spawn } from 'child_process';
import { watchFiles } from './watcher.js';

// Initial build
console.log('Starting development mode...\n');
spawn('node', ['build.js'], { stdio: 'inherit' });

// Watch for changes
watchFiles();

