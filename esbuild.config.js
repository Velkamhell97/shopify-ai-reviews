require('esbuild').build({
  entryPoints: ['src/ai-reviews.js'],
  outfile: 'dist/ai-reviews.js',
  bundle: true,
}).catch(() => process.exit(1))