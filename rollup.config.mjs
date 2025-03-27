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
      dir: './dist/package',
      entryFileNames: (chunk) => `${chunk.name}.cjs`,
    },
    {
      format: 'es',
      dir: './dist/package',
      entryFileNames: (chunk) => `${chunk.name}.js`,
    },
  ],
  input: { index: './src/index.ts', wrapper: './src/wrapper.ts' },
  plugins: [
    typescript({
      tsconfig: 'tsconfig.d.json',
    }),
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
        for (const entryPoint of Object.values(pkg.exports)) {
          entryPoint.types = removeDistPackage(entryPoint.types);
          entryPoint.require = removeDistPackage(entryPoint.require);
          entryPoint.default = removeDistPackage(entryPoint.default);
        }
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
});
