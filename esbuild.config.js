require('esbuild').build({
  entryPoints: ['src/ai-reviews-el.js'],
  outfile: "dist/ai-reviews-el.js",
  bundle: true,
  // minify: true,
  // treeShaking: true,
  // legalComments: "linked"
}).catch(() => process.exit(1))