const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

const BUILD_TYPES = {
  bookmarklet: {
    output: 'dist/bookmarklet.min.js',
    manifestPath: null
  },
  extension: {
    output: 'dist/extension',
    manifestPath: 'src/extension/manifest.json'
  }
};

async function build(type = 'bookmarklet') {
  console.log(`🔨 Building ${type}...`);
  
  try {
    // Run TypeScript compiler
    execSync('npm run typecheck', { stdio: 'inherit' });
    
    // Run Rollup build
    execSync('rollup -c', { stdio: 'inherit' });
    
    // Type-specific post-processing
    if (type === 'extension') {
      await buildExtension();
    } else if (type === 'bookmarklet') {
      await processBookmarklet();
    }
    
    console.log(`✅ Build complete: ${BUILD_TYPES[type].output}`);
  } catch (error) {
    console.error('❌ Build failed:', error.message);
    process.exit(1);
  }
}

async function buildExtension() {
  // Copy manifest and other extension files
  const manifest = {
    manifest_version: 3,
    name: "UpworkIQ - Job Analysis Tool",
    version: "1.0.0",
    description: "AI-powered job analysis for Upwork freelancers",
    permissions: ["activeTab"],
    content_scripts: [{
      matches: ["*://*.upwork.com/jobs/*"],
      js: ["content.js"],
      run_at: "document_end"
    }],
    icons: {
      "16": "icon16.png",
      "48": "icon48.png",
      "128": "icon128.png"
    }
  };
  
  await fs.mkdir('dist/extension', { recursive: true });
  await fs.writeFile(
    'dist/extension/manifest.json',
    JSON.stringify(manifest, null, 2)
  );
  
  // Copy icons if they exist
  const iconDir = 'src/extension/icons';
  try {
    const icons = await fs.readdir(iconDir);
    for (const icon of icons) {
      await fs.copyFile(
        path.join(iconDir, icon),
        path.join('dist/extension', icon)
      );
    }
  } catch (e) {
    console.warn('⚠️  No icons found, skipping...');
  }
}

async function processBookmarklet() {
  // Read the minified bookmarklet
  const bookmarkletPath = 'dist/bookmarklet.min.js';
  let content = await fs.readFile(bookmarkletPath, 'utf8');
  
  // Ensure it's properly formatted as a bookmarklet
  if (!content.startsWith('javascript:')) {
    content = 'javascript:' + content;
  }
  
  // Write back
  await fs.writeFile(bookmarkletPath, content);
  
  // Create a human-readable version with installation instructions
  const readme = `# UpworkIQ Bookmarklet

## Installation

1. Copy the entire code below:
\`\`\`javascript
${content}
\`\`\`

2. Create a new bookmark in your browser
3. Set the name to "UpworkIQ"
4. Paste the code as the URL
5. Save the bookmark

## Usage

1. Navigate to any Upwork job page
2. Click the UpworkIQ bookmark
3. View the analysis below the job title

## File Size: ${(content.length / 1024).toFixed(2)}KB
`;
  
  await fs.writeFile('dist/BOOKMARKLET_README.md', readme);
}

// Run build
const buildType = process.argv[2] || 'bookmarklet';
if (!BUILD_TYPES[buildType]) {
  console.error(`Invalid build type: ${buildType}`);
  console.log(`Available types: ${Object.keys(BUILD_TYPES).join(', ')}`);
  process.exit(1);
}

build(buildType);