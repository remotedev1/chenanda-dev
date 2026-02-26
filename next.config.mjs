/** @type {import('next').NextConfig} */
const nextConfig = {
  //todo 
  allowedDevOrigins: ["http://localhost:3000"],
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "ik.imagekit.io", port: "" },
      { protocol: "https", hostname: "unsplash.com", port: "" },
      { protocol: "https", hostname: "images.unsplash.com", port: "" },
    ],
  },
   async headers() {
    return [
      {
        source: "/videos/(.*)", // all files inside /public/videos/
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
