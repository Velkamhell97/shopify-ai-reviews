require('esbuild').build({
  entryPoints: ['src/ai-reviews.js'],
  outfile: "dist/ai-reviews.js",
  // outdir: "dist",
  bundle: true,
  minify: true,
  // treeShaking: true,
  // legalComments: "linked"
}).catch(() => process.exit(1))