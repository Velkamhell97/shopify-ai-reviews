require('esbuild').build({
  entryPoints: ['firebase/index.js'],
  outfile: 'dist/ai-reviews.js',
  bundle: true,
}).catch(() => process.exit(1))