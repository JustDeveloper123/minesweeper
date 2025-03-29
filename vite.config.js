import injectHTML from 'vite-plugin-html-inject';
import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import { resolve } from 'path';
import { defineConfig, loadEnv } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

const r = path => resolve(__dirname, path);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    appType: 'spa',
    root: '.',
    base: env.VITE_BASE,
    publicDir: 'public',
    envDir: '.',
    envPrefix: 'VITE_',
    resolve: {
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json'],
      alias: {
        '@': r('./src'),
        '@styles': r('./src/styles'),
        '@js': r('./src/js'),
        '@constants': r('./src/constants'),
        '@assets': r('./src/assets'),
      },
    },

    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          home: r('index.html'),
        },
      },
    },

    server: {
      port: 3000,
      strictPort: false,
      open: false,
    },

    preview: {
      port: 8080,
      strictPort: false,
      open: false,
    },

    plugins: [
      injectHTML({
        debug: {
          logPath: true,
        },
      }),

      ViteImageOptimizer({
        png: {
          quality: 70,
        },
        jpeg: {
          quality: 70,
        },
        jpg: {
          quality: 70,
        },
      }),

      {
        ...imagemin(
          ['./public/images/**/*.{jpg,png,jpeg}'], // path where images are located
          {
            destination: './public/webp', // destination folder of converted images
            plugins: [imageminWebp({ quality: 70 })], // overall conversion quality
          },
        ),
        apply: 'serve',
      },
    ],

    css: {
      preprocessorOptions: {
        scss: {
          // A setting to hide console warning about legacy JS API
          silenceDeprecations: ['legacy-js-api'],
        },
      },
    },
  };
});
