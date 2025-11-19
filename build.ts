await Bun.build({
  entrypoints: ['index.ts'],
  target: 'bun',
  minify: true,
  outdir: 'dist',
});

Bun.write(
  `./dist/sysdump.bat`,
  `@echo off
npm i -g bun && bun /index.js`
);

console.log('Build complete!');
