// CommonJS deliberately: Next.js's bundled `postcss-load-config` does not
// unwrap an ESM `export default` here, leaving `plugins` undefined.
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
