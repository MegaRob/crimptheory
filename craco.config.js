// craco.config.js
const tailwindcss = require('tailwindcss');
const autoprefixer = require('autoprefixer');

module.exports = {
  style: {
    // This section is generally okay, but the webpack.configure below is more robust
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  webpack: {
    configure: (webpackConfig) => {
      // Find the rule that handles CSS files.
      // Create React App typically has a 'oneOf' rule for different file types.
      const cssRule = webpackConfig.module.rules.find(
        (rule) => rule.oneOf
      ).oneOf.find(
        (rule) =>
          rule.test && rule.test.toString().includes('.css') && !rule.test.toString().includes('.module.css')
      );

      if (cssRule) {
        // Find the 'postcss-loader' within the 'use' array of the CSS rule.
        const postcssLoader = cssRule.use.find((loader) =>
          typeof loader === 'object' && loader.loader && loader.loader.includes('postcss-loader')
        );

        if (postcssLoader) {
          // Explicitly set the PostCSS plugins for this loader.
          // This ensures Tailwind and Autoprefixer are applied during the build.
          postcssLoader.options.postcssOptions.plugins = [
            tailwindcss,
            autoprefixer,
          ];
        }
      }
      return webpackConfig;
    },
  },
};
