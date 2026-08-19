

// --- CONSOLIDATED FROM: ./generate-catalog.ts ---

import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

interface FileCatalog {
  filePath: string;
  exportedFunctions: string[];
  importedSymbols: { module: string; symbols: string[] }[];
}

// Recursively fetch all TypeScript files in the project
function getTsFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (
      file === 'node_modules' ||
      file === '.git' ||
      file === 'dist' ||
      file === 'build'
    ) {
      continue;
    }

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      getTsFiles(filePath, fileList);
    } else if (
      (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) &&
      !filePath.endsWith('.d.ts')
    ) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

// AST Analysis for a single TypeScript file
function analyzeFile(filePath: string): FileCatalog {
  const code = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    filePath,
    code,
    ts.ScriptTarget.Latest,
    true
  );

  const exportedFunctions: string[] = [];
  const importedSymbols: { module: string; symbols: string[] }[] = [];

  function visit(node: ts.Node) {
    // Extract Imported Symbols
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;
      const symbols: string[] = [];

      if (node.importClause) {
        if (node.importClause.name) {
          symbols.push(`default:${node.importClause.name.text}`);
        }
        if (node.importClause.namedBindings) {
          if (ts.isNamedImports(node.importClause.namedBindings)) {
            node.importClause.namedBindings.elements.forEach((e) => {
              symbols.push(e.name.text);
            });
          } else if (ts.isNamespaceImport(node.importClause.namedBindings)) {
            symbols.push(`* as ${node.importClause.namedBindings.name.text}`);
          }
        }
      }
      importedSymbols.push({ module: moduleSpecifier, symbols });
    }

    // Extract Exported Function Declarations: export function foo() {}
    if (ts.isFunctionDeclaration(node)) {
      const isExported = node.modifiers?.some(
        (m) => m.kind === ts.SyntaxKind.ExportKeyword
      );
      if (isExported && node.name) {
        exportedFunctions.push(node.name.text);
      }
    }

    // Extract Exported Arrow Functions/Expressions: export const bar = () => {}
    if (ts.isVariableStatement(node)) {
      const isExported = node.modifiers?.some(
        (m) => m.kind === ts.SyntaxKind.ExportKeyword
      );
      if (isExported) {
        for (const decl of node.declarationList.declarations) {
          if (
            decl.name &&
            ts.isIdentifier(decl.name) &&
            decl.initializer &&
            (ts.isArrowFunction(decl.initializer) ||
              ts.isFunctionExpression(decl.initializer))
          ) {
            exportedFunctions.push(decl.name.text);
          }
        }
      }
    }

    // Extract Named Export Clauses: export { funcA, funcB }
    if (
      ts.isExportDeclaration(node) &&
      node.exportClause &&
      ts.isNamedExports(node.exportClause)
    ) {
      for (const elem of node.exportClause.elements) {
        exportedFunctions.push(elem.name.text);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return { filePath, exportedFunctions, importedSymbols };
}

function buildCatalog(rootDir: string) {
  const files = getTsFiles(rootDir);
  const catalog = files.map((file) =>
    analyzeFile(path.relative(rootDir, file))
  );

  fs.writeFileSync('catalog.json', JSON.stringify(catalog, null, 2));
  console.log(
    `Successfully indexed ${catalog.length} files into catalog.json`
  );
}

buildCatalog(process.cwd());
