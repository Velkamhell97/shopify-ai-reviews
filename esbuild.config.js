require('esbuild').build({
  entryPoints: ['dist/ai-reviews.js'],
  outfile: "dist/ai-reviews.js",
  bundle: true,
  // minify: true,
  // treeShaking: true,
  // legalComments: "linked"
}).catch(() => process.exit(1))