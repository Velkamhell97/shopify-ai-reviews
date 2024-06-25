require('esbuild').build({
  entryPoints: ['src/ai-reviews.css'],
  outfile: "dist/ai-reviews.min.css",
  // outdir: "dist",
  bundle: true,
  minify: true,
  // treeShaking: true,
  // legalComments: "linked"
}).catch(() => process.exit(1))