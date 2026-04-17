const path = require('path');

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
    // If you use `MDXProvider`, uncomment the following line.
    // providerImportSource: "@mdx-js/react",
  },
})

const nextConfig = {
  // Append the default value with md extensions
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  experimental: {
    appDir: true,
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './app/components'),
      '@/constants': path.resolve(__dirname, './app/_constants'),
      '@/articles': path.resolve(__dirname, './articles'),
      '@/helperFunctions': path.resolve(__dirname, './helperFunctions'),
    };
    return config;
  },
}

module.exports = withMDX(nextConfig);