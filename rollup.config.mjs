import typescript from '@rollup/plugin-typescript';
import assert from 'assert';
import { readFile } from 'fs/promises';
import { defineConfig } from 'rollup';

const distPackagePrefix = './dist/package/';
const removeDistPackage = (withDistPackage) => {
  assert(withDistPackage.startsWith(distPackagePrefix));
  return `./${withDistPackage.substring(distPackagePrefix.length)}`;
};

export default defineConfig({
  output: [
    {
      format: 'cjs',
      file: './dist/package/index.cjs',
    },
    {
      format: 'es',
      file: './dist/package/index.js',
    },
  ],
  input: './src/index.ts',
  plugins: [
    typescript(),
    {
      name: 'package',
      async buildStart() {
        const pkg = JSON.parse(await readFile('./package.json', 'utf8'));
        delete pkg.private;
        delete pkg.devDependencies;
        delete pkg.scripts;
        delete pkg.husky;
        delete pkg.commitlint;
        delete pkg.files;
        pkg.typings = removeDistPackage(pkg.typings);
        pkg.main = removeDistPackage(pkg.main);
        pkg.module = removeDistPackage(pkg.module);
        pkg.exports.types = removeDistPackage(pkg.exports.types);
        pkg.exports.require = removeDistPackage(pkg.exports.require);
        pkg.exports.default = removeDistPackage(pkg.exports.default);
        this.emitFile({ type: 'asset', fileName: 'package.json', source: JSON.stringify(pkg) });
        this.emitFile({
          type: 'asset',
          fileName: 'README.md',
          source: await readFile('README.md', 'utf-8'),
        });
        this.emitFile({
          type: 'asset',
          fileName: 'LICENSE',
          source: await readFile('LICENSE', 'utf-8'),
        });
      },
    },
  ],
  external: ['signal-polyfill'],
});
