/* eslint-disable @typescript-eslint/no-var-requires */
// Use CommonJS module system
const { ncp } = require('ncp');
const path = require('path');

const sourceDir = path.join(__dirname, 'src', 'views');
const destDir = path.join(__dirname, 'dist', 'views');

ncp(sourceDir, destDir, (err) => {
  if (err) {
    console.error('Error copying views:', err);
  } else {
    console.log(`Successfully copied views from ${sourceDir} to ${destDir}`);
  }
});
