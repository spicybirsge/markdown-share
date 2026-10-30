/** @type {import('next').NextConfig} */
const nextConfig = {
  // `/share/<id>.md` returns the raw markdown so agents can fetch a share as a
  // plain file. The rewrite is required: `/share/[id]` would otherwise match
  // "abc.md" as the share id and render the reader, which then 404s. `beforeFiles`
  // guarantees this runs ahead of that dynamic route.
  async rewrites() {
    return {
      beforeFiles: [{ source: "/share/:id.md", destination: "/api/share/:id" }],
    };
  },
};

export default nextConfig;
