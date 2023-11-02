#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import deindent from './deindent.js';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const inputDirectory = process.argv[2];
const args = process.argv.slice(3);

// Default values
let outputDirectory = 'dist';
let publicDirectory = 'public';

const createDistDirectory = async () => {
  try {
    await fs.rmdir(outputDirectory, { recursive: true });
    console.log(`'dist' directory deleted successfully.`);
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
      console.log(`'public' folder copied to 'dist' directory successfully.`);
    } else {
      await fs.mkdir(outputDirectory);
      console.log(
        `'dist' directory created successfully as 'public' folder does not exist.`
      );
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
          console.log(
            `Processed ${itemPath} and saved result to ${outputPath}`
          );
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
};

main();
