module.exports = {
  root: './src',
  base: '/',
  server: {
    port: 3000,
    open: true,
  },
  build: {
    outDir: '../dist',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
};