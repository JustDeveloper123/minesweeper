module.exports = {
  plugins: [
    require('postcss-sort-media-queries')({
      sort: 'desktop-first', // sort: mobile-first | desktop-first | custom function
    }),
    require('autoprefixer'),
    require('tailwindcss'),
  ],
};
