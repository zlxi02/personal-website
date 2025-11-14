import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import { gfmHeadingId } from 'marked-gfm-heading-id';
import markedFootnote from 'marked-footnote';
import { markedDefinitionList } from './marked-definition-list.js';
import { markedTweet } from './marked-tweet.js';

// Configure marked
marked.use(gfmHeadingId());
marked.use(markedFootnote());
marked.use(markedDefinitionList());
marked.use(markedTweet());

const PAGES_DIR = 'pages';
const DIST_DIR = 'dist';
const ASSETS_DIR = 'assets';

// Ensure dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  fs.mkdirSync(DIST_DIR, { recursive: true });
}

// Copy assets to dist
function copyAssets() {
  if (fs.existsSync(ASSETS_DIR)) {
    const distAssetsDir = path.join(DIST_DIR, ASSETS_DIR);
    if (fs.existsSync(distAssetsDir)) {
      fs.rmSync(distAssetsDir, { recursive: true });
    }
    fs.cpSync(ASSETS_DIR, distAssetsDir, { recursive: true });
    console.log('✓ Copied assets');
  }
  
  // Copy public folder to dist
  const PUBLIC_DIR = 'public';
  if (fs.existsSync(PUBLIC_DIR)) {
    const distPublicDir = path.join(DIST_DIR, PUBLIC_DIR);
    if (fs.existsSync(distPublicDir)) {
      fs.rmSync(distPublicDir, { recursive: true });
    }
    fs.cpSync(PUBLIC_DIR, distPublicDir, { recursive: true });
    console.log('✓ Copied public files');
  }
}

// Read CSS file
const styles = fs.readFileSync('styles.css', 'utf-8');

// HTML template
function htmlTemplate(content, title = '') {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link rel="icon" type="image/png" href="public/Screenshot 2025-11-13 at 23.29.37.png">
  <style>${styles}</style>
</head>
<body>
  ${content}
</body>
</html>`;
}

// Process a single markdown file
function processMarkdownFile(filePath, relativePath) {
  const markdown = fs.readFileSync(filePath, 'utf-8');
  const html = marked.parse(markdown);
  
  // Extract title from first h1 or use filename
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1] : path.basename(relativePath, '.md');
  
  const fullHtml = htmlTemplate(html, title);
  
  // Determine output path
  const outputPath = path.join(
    DIST_DIR,
    relativePath.replace(/\.md$/, '.html')
  );
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  fs.writeFileSync(outputPath, fullHtml);
  console.log(`✓ Built ${relativePath}`);
}

// Recursively process all markdown files
function processDirectory(dir, baseDir = PAGES_DIR) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(fullPath, baseDir);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      const relativePath = path.relative(baseDir, fullPath);
      processMarkdownFile(fullPath, relativePath);
    }
  }
}

// Generate RSS feed
function generateRSS() {
  const writingDir = path.join(PAGES_DIR, 'writing');
  if (!fs.existsSync(writingDir)) {
    return;
  }
  
  const posts = [];
  const files = fs.readdirSync(writingDir);
  
  for (const file of files) {
    if (file.endsWith('.md')) {
      const filePath = path.join(writingDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const titleMatch = content.match(/^#\s+(.+)$/m);
      const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
      
      if (titleMatch && dateMatch) {
        posts.push({
          title: titleMatch[1],
          date: dateMatch[1],
          link: `/writing/${file.replace('.md', '.html')}`,
          file: file
        });
      }
    }
  }
  
  // Sort by date descending
  posts.sort((a, b) => b.date.localeCompare(a.date));
  
  let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>My Personal Website</title>
    <link>https://yoursite.com</link>
    <description>Personal blog and writings</description>
`;
  
  for (const post of posts) {
    rss += `    <item>
      <title>${post.title}</title>
      <link>https://yoursite.com${post.link}</link>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    </item>
`;
  }
  
  rss += `  </channel>
</rss>`;
  
  fs.writeFileSync(path.join(DIST_DIR, 'rss.xml'), rss);
  console.log('✓ Generated RSS feed');
}

// Main build process
console.log('Building site...\n');
copyAssets();
processDirectory(PAGES_DIR);
generateRSS();
console.log('\n✨ Build complete!');

