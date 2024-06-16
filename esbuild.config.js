require('esbuild').build({
  entryPoints: ['src/ai-reviews-2.js'],
  outfile: 'dist/ai-reviews-2.js',
  bundle: true,
}).catch(() => process.exit(1))