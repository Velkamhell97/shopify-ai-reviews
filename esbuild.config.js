require('esbuild').build({
  entryPoints: ['src/ai-reviews-fb.js'],
  outfile: 'dist/ai-reviews-fb.js',
  bundle: true,
}).catch(() => process.exit(1))