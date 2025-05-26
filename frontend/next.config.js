/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/thumbs/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/originals/**",
      },
      {
        protocol: "http",
        hostname: "backend",
        port: "8000",
        pathname: "/thumbs/**",
      },
      {
        protocol: "http",
        hostname: "backend",
        port: "8000",
        pathname: "/originals/**",
      },
      {
        protocol: "http",
        hostname: "backend",
        port: "8000",
        pathname: "/api/**",
      },
    ],
  },
  async rewrites() {
    // Use INTERNAL_API_URL for server-side API rewrites when running in Docker
    // This allows the Next.js server to communicate with the backend via Docker network
    const apiUrl = process.env.INTERNAL_API_URL || "http://localhost:8000";

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/api/:path*`,
      },
      {
        source: "/originals/:path*",
        destination: `${apiUrl}/originals/:path*`,
      },
      {
        source: "/thumbs/:path*",
        destination: `${apiUrl}/thumbs/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
