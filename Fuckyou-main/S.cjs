const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { builtinModules } = require('module');

const BUILTIN_MODULES = new Set(builtinModules || []);

function getPackageName(specifier) {
  if (
    !specifier ||
    specifier.startsWith('.') ||
    specifier.startsWith('/') ||
    specifier.startsWith('@/') ||
    specifier.startsWith('~/') ||
    specifier.startsWith('#') ||
    BUILTIN_MODULES.has(specifier)
  ) {
    return null;
  }
  const parts = specifier.split('/');
  if (specifier.startsWith('@')) {
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : null;
  }
  return parts[0];
}

function getTsFiles(dir, fileList = []) {
  try {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      if (['node_modules', '.git', 'dist', 'build', '.next'].includes(file)) continue;

      try {
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          getTsFiles(filePath, fileList);
        } else if ((filePath.endsWith('.ts') || filePath.endsWith('.tsx')) && !filePath.endsWith('.d.ts')) {
          fileList.push(filePath);
        }
      } catch {
        continue;
      }
    }
  } catch {
    // Skip restricted directories
  }
  return fileList;
}

function analyzeFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const code = fs.readFileSync(filePath, 'utf-8');

    const exportedFunctions = [];
    const importedSymbols = [];

    const importRegex = /import\s+(?:([\w$]+)\s*,?\s*)?(?:\{([^}]+)\})?\s*(?:\*\s+as\s+([\w$]+))?\s*from\s*['"]([^'"]+)['"]/g;
    let match;
    while ((match = importRegex.exec(code)) !== null) {
      const [, defaultImport, namedImports, nsImport, moduleSpecifier] = match;
      const symbols = [];

      if (defaultImport) symbols.push(`default:${defaultImport}`);
      if (nsImport) symbols.push(`* as ${nsImport}`);
      if (namedImports) {
        namedImports.split(',').forEach((s) => {
          const sym = s.trim().split(/\s+as\s+/)[0];
          if (sym) symbols.push(sym);
        });
      }
      importedSymbols.push({ module: moduleSpecifier, symbols });
    }

    const funcRegex = /export\s+(?:async\s+)?function\s+([\w$]+)/g;
    while ((match = funcRegex.exec(code)) !== null) {
      exportedFunctions.push(match[1]);
    }

    const constFuncRegex = /export\s+const\s+([\w$]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[\w$]+)\s*=>/g;
    while ((match = constFuncRegex.exec(code)) !== null) {
      exportedFunctions.push(match[1]);
    }

    const exportClauseRegex = /export\s*\{([^}]+)\}/g;
    while ((match = exportClauseRegex.exec(code)) !== null) {
      match[1].split(',').forEach((s) => {
        const sym = s.trim().split(/\s+as\s+/)[0];
        if (sym) exportedFunctions.push(sym);
      });
    }

    return {
      filePath,
      exportedFunctions: [...new Set(exportedFunctions)],
      importedSymbols,
    };
  } catch {
    return null;
  }
}

function buildCatalog() {
  const rootDir = process.cwd();
  const files = getTsFiles(rootDir);
  const catalog = [];
  const externalPackages = new Set();

  for (const file of files) {
    const analysis = analyzeFile(file);
    if (analysis) {
      for (const item of analysis.importedSymbols) {
        const pkg = getPackageName(item.module);
        if (pkg) externalPackages.add(pkg);
      }
      catalog.push({
        ...analysis,
        filePath: path.relative(rootDir, file),
      });
    }
  }

  const missingPackages = [];
  for (const pkg of externalPackages) {
    try {
      require.resolve(pkg, { paths: [rootDir] });
    } catch {
      missingPackages.push(pkg);
    }
  }

  if (missingPackages.length > 0) {
    console.log(`Installing missing dependencies: ${missingPackages.join(', ')}...`);
    try {
      execSync(`npm install ${missingPackages.join(' ')}`, { stdio: 'inherit', cwd: rootDir });
      console.log('Packages successfully downloaded.\n');
    } catch {
      console.warn('Warning: Some packages could not be installed. Continuing...\n');
    }
  }

  fs.writeFileSync('catalog.json', JSON.stringify(catalog, null, 2));
  console.log(`Successfully indexed ${catalog.length} files into catalog.json`);
}

buildCatalog();
