import esbuild from 'esbuild'
import tsPaths from 'esbuild-ts-paths'
import { nodeExternalsPlugin } from 'esbuild-node-externals'

const config = {
  entryPoints: ['src/main.ts'],
  bundle: true,
  outfile: 'dist/main.js',
  platform: 'node',
  target: 'node14',
  plugins: [tsPaths(), nodeExternalsPlugin()],
  format: 'esm',
}

await esbuild.build(config)
