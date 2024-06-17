require('esbuild').build({
  entryPoints: ['src/ai-reviews.js', 'src/ai-reviews-db.js'],
  // outfile: "dist/ai-reviews.min.js",
  outdir: "dist",
  bundle: true,
  // minify: true,
  // treeShaking: true,
  legalComments: "linked"
}).catch(() => process.exit(1))