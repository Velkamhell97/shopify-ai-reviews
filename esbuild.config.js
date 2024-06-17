require('esbuild').build({
  entryPoints: ['src/ai-reviews-db.js', 'src/ai-reviews.js'],
  outdir: "dist",
  bundle: true,
}).catch(() => process.exit(1))