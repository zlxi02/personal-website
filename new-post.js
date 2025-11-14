import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createNewPost() {
  console.log('Create a new blog post\n');
  
  const title = await question('Title: ');
  if (!title) {
    console.log('Title is required!');
    rl.close();
    return;
  }
  
  // Generate filename from title
  const date = new Date().toISOString().split('T')[0];
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  const filename = `${date}-${slug}.md`;
  const writingDir = 'pages/writing';
  
  // Ensure writing directory exists
  if (!fs.existsSync(writingDir)) {
    fs.mkdirSync(writingDir, { recursive: true });
  }
  
  const filepath = path.join(writingDir, filename);
  
  // Check if file already exists
  if (fs.existsSync(filepath)) {
    console.log(`\n❌ File already exists: ${filename}`);
    rl.close();
    return;
  }
  
  // Create markdown template
  const template = `# ${title}

Write your content here...

`;
  
  fs.writeFileSync(filepath, template);
  console.log(`\n✓ Created ${filename}`);
  console.log(`📝 Edit the file at: ${filepath}`);
  
  rl.close();
}

createNewPost();

