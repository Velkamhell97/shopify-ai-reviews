require('esbuild').build({
  entryPoints: ['src/ai-reviews.js'],
  outfile: "dist/ai-reviews.min.js",
  bundle: true,
  minify: true,
  // treeShaking: true,
  // legalComments: "linked"
}).catch(() => process.exit(1))