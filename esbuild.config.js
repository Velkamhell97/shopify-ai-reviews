require('esbuild').build({
  entryPoints: ['src/ai-reviews-js.js'],
  outfile: 'dist/ai-reviews-js.js',
  bundle: true,
}).catch(() => process.exit(1))