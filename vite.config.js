import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'
import tailwindConfig from './tailwind.config.js'

const [schema, host] = process.env.GITPOD_WORKSPACE_URL ? process.env.GITPOD_WORKSPACE_URL.split('://') : [null, null]
const publicUrl = `3000-${host}`

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  plugins: [svelte()],
  define: {
    __STAMP_CONTRACT__: '"FMRHYgSijiUNBrFy-XqyNNXenHsCV0ThR4lGAPO4chA"',
    __BAR_CONTRACT__: '"VFr3Bk-uM-motpNNkkFg4lNW1BMmSfzqsVO551Ho4hA"',
    __VOUCH_DAO__: '"_z0ch80z_daDUFqC9jHjfOL8nekJcok4ZRkE_UesYsk"',
    __TRADE_SOURCE_ID__: '"x0ojRwrcHBmZP20Y4SY0mgusMRx-IYTjg5W8c3UFoNs"',
    __TRADE_SOURCE_OLD__: '"BzNLxND_nJEMfcLWShyhU4i9BnzEWaATo6FYFsfsO0Q"'
  },
  server: {
    hmr: {
      clientPort: host ? 443 : 3000,
      host: host
        ? publicUrl
        : "localhost",
    }
  },
  css: {
    postcss: {
      plugins: [tailwind(tailwindConfig), autoprefixer],
    }

  }
})
