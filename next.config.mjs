/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/products/download/:downloadVerificationId",
        destination: "/api/download/:downloadVerificationId",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;