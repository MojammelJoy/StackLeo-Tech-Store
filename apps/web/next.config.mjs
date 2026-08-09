// StackLeo Web — Next.js configuration.
//
// Deliberately does NOT set `output: "standalone"`: that mode recreates
// pnpm's symlinked node_modules via real filesystem symlinks, which
// requires elevated privileges on Windows (see apps/web/Dockerfile's own
// comment). The Dockerfile instead uses `pnpm deploy` to produce a
// pruned, production-only node_modules — no standalone output needed.

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
