// craco.config.js
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

module.exports = {
  style: {
    postcss: {
      // Configure PostCSS for processing CSS files.
      // This ensures Tailwind CSS and Autoprefixer are applied during the build.
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  // Webpack configuration to find and modify PostCSS Loader options.
  // This is a more robust way to ensure Tailwind is correctly processed by Create React App.
  webpack: {
    configure: (webpackConfig) => {
      // Find the PostCSS loader within Webpack's rules.
      const postcssLoaderRule = webpackConfig.module.rules.find(
        (rule) => Array.isArray(rule.oneOf)
      )?.oneOf.find(
        (oneOfRule) =>
          oneOfRule.loader && oneOfRule.loader.includes('postcss-loader')
      );

      if (postcssLoaderRule) {
        // Ensure PostCSS Loader uses our defined plugins.
        // This overrides Create React App's default PostCSS setup to include Tailwind.
        postcssLoaderRule.options.postcssOptions.plugins = [
          tailwindcss,
          autoprefixer,
        ];
      }
      return webpackConfig;
    },
  },
};
