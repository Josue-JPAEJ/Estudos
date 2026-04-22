import fs from 'node:fs';
import path from 'node:path';

const SRC_DIR = path.join(process.cwd(), 'src');
const jsxFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }

    if (entry.isFile() && fullPath.endsWith('.jsx')) {
      jsxFiles.push(fullPath);
    }
  }
}

walk(SRC_DIR);

const invalidFiles = jsxFiles.filter((file) => {
  const content = fs.readFileSync(file, 'utf8');
  return !content.includes("import React");
});

if (invalidFiles.length > 0) {
  console.error('Arquivos JSX sem import de React:');
  for (const file of invalidFiles) {
    console.error(`- ${path.relative(process.cwd(), file)}`);
  }
  process.exit(1);
}

console.log(`Validação concluída: ${jsxFiles.length} arquivos JSX com import de React.`);
