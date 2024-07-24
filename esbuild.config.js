require('esbuild').build({
  entryPoints: ['src/wheel-fortune.js'],
  outfile: "dist/wheel-fortune.js",
  bundle: true,
  // minify: true,
  // treeShaking: true,
  // legalComments: "linked"
}).catch(() => process.exit(1))