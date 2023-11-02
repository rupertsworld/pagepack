#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import deindent from './deindent.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const inputDirectory = process.argv[2] ? process.argv[2] : 'pages';
const args = process.argv.slice(3);

// Get the index of '--out-dir' and '--public-dir' arguments in the process.argv array
const outDirIndex = process.argv.indexOf('--out-dir');
const publicDirIndex = process.argv.indexOf('--public-dir');

// Set default values
let outputDirectory = 'dist';
let publicDirectory = 'public';

// Check if '--out-dir' argument exists and retrieve its value
if (outDirIndex !== -1 && process.argv.length > outDirIndex + 1) {
  outputDirectory = process.argv[outDirIndex + 1];
}

// Check if '--public-dir' argument exists and retrieve its value
if (publicDirIndex !== -1 && process.argv.length > publicDirIndex + 1) {
  publicDirectory = process.argv[publicDirIndex + 1];
}

console.log('Starting pagepack...');

const createDistDirectory = async () => {
  try {
    await fs.rm(outputDirectory, { recursive: true });
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('Error deleting "dist" directory:', error);
      process.exit(1);
    }
  }
};

const copyPublicFilesToDist = async () => {
  try {
    const publicDirExists = await checkDirectory(publicDirectory);
    if (publicDirExists) {
      await fs.mkdir(outputDirectory, { recursive: true });
      await copyFolder(publicDirectory, outputDirectory);
      console.log(`- Updated public pages.`);
    } else {
      await fs.mkdir(outputDirectory);
    }
  } catch (error) {
    console.error('Error copying files from public to dist:', error);
  }
};

const copyFolder = async (src, dest) => {
  const entries = await fs.readdir(src, { withFileTypes: true });
  await fs.mkdir(dest, { recursive: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    entry.isDirectory()
      ? await copyFolder(srcPath, destPath)
      : await fs.copyFile(srcPath, destPath);
  }
};

const checkDirectory = async (directory) => {
  try {
    const stats = await fs.stat(directory);
    return stats.isDirectory();
  } catch (error) {
    return false;
  }
};

const processDirectory = async (directory, currentPath = '') => {
  try {
    const items = await fs.readdir(directory);

    for (const item of items) {
      const itemPath = path.join(directory, item);
      const itemStats = await fs.stat(itemPath);

      if (itemStats.isDirectory()) {
        const newPath = path.join(currentPath, item);
        await processDirectory(itemPath, newPath);
      } else if (path.extname(itemPath) === '.js') {
        const { name } = path.parse(itemPath);
        const outputPath =
          name === 'index'
            ? path.join(outputDirectory, `${currentPath}`, 'index.html')
            : path.join(
                outputDirectory,
                `${currentPath}`,
                path.basename(item, '.js'),
                'index.html'
              );

        try {
          const modulePath = path.resolve(itemPath);
          const module = await import(modulePath);
          const moduleFunction = module.default;

          const result = moduleFunction();
          await fs.mkdir(path.dirname(outputPath), { recursive: true });
          await fs.writeFile(outputPath, deindent(result));
          console.log(`- ${itemPath} -> ${outputPath}`);
        } catch (error) {
          console.error(`Error processing ${itemPath}: ${error}`);
        }
      }
    }
  } catch (error) {
    console.error('Error reading directory:', error);
  }
};

const main = async () => {
  await createDistDirectory();
  await copyPublicFilesToDist();

  if (!inputDirectory || !(await checkDirectory(inputDirectory))) {
    console.error('Please provide a valid input directory.');
    process.exit(1);
  }

  try {
    await fs.mkdir(outputDirectory, { recursive: true });
  } catch (err) {
    if (err.code !== 'EEXIST') {
      console.error('Error creating output directory:', err);
      process.exit(1);
    }
  }

  await processDirectory(inputDirectory);
  console.log('✨ Your website is ready.');
};

main();
