/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Treat TypeScript errors as warnings during build
    tsconfigPath: './tsconfig.json',
  },
};

module.exports = nextConfig;
