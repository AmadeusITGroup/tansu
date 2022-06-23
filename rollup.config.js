import typescript from '@rollup/plugin-typescript';

export default [
  {
    output: [
      {
        file: './dist/package/index.cjs.js',
        format: 'cjs',
      },
      {
        file: './dist/package/index.es.js',
        format: 'es',
      },
    ],
    input: './src/index.ts',
    plugins: [typescript()],
  },
];
