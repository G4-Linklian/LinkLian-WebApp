// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   output: 'standalone',
//   assetPrefix: '',
// };

// module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  assetPrefix: '',
  typescript: {
    ignoreBuildErrors: true, // ข้ามการเช็ก Type
  },
  eslint: {
    ignoreDuringBuilds: true, // ข้ามการเช็ก Lint
  },
}

module.exports = nextConfig
