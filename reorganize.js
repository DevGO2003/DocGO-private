const fs = require('fs');
const path = require('path');

const basePath = 'P:\\DevGO2003\\DocGO-private\\frontend\\web-app\\src\\app\\(repositories)\\repositories';
const sourcePath = path.join(basePath, '[repositoryId]', 'files');
const targetPath = basePath;

const folders = ['_components', '_services', '_hooks', '_types', '_constants'];

console.log('Reorganizing structure...\n');

folders.forEach(folder => {
  const src = path.join(sourcePath, folder);
  const dst = path.join(targetPath, folder);
  
  if (fs.existsSync(src)) {
    console.log(`Moving ${folder}...`);
    
    // Remove destination if exists
    if (fs.existsSync(dst)) {
      fs.rmSync(dst, { recursive: true, force: true });
    }
    
    // Move folder
    fs.renameSync(src, dst);
    console.log(`  ✓ Moved to ${dst}`);
  } else {
    console.log(`  ✗ ${folder} not found`);
  }
});

console.log('\n✅ Done!');
