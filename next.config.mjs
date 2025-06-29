let userConfig = undefined;
try {
  userConfig = await import('./v0-user-next.config');
} catch (e) {
  // ignore error
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: [], // Add your image domains here if needed
  },
  
  // Critical configuration for file uploads
  api: {
    bodyParser: false, // Disable default bodyParser
    responseLimit: '50mb',
    externalResolver: true,
  },
  
  // For Next.js 13.4+ with Server Actions
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
    serverActions: {
      bodySizeLimit: '50mb',
    },
    appDir: true,
  },
  
  // Webpack configuration
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
  
  // Increase timeout for API routes
  staticPageGenerationTimeout: 300,
  
  // Custom headers for API routes
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { 
            key: 'Access-Control-Allow-Methods', 
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' 
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ];
  },
};

function mergeConfig(nextConfig, userConfig) {
  if (!userConfig) {
    return nextConfig;
  }

  for (const key in userConfig) {
    if (
      typeof nextConfig[key] === 'object' &&
      !Array.isArray(nextConfig[key]) &&
      userConfig[key] !== null &&
      typeof userConfig[key] === 'object' &&
      !Array.isArray(userConfig[key])
    ) {
      nextConfig[key] = {
        ...nextConfig[key],
        ...userConfig[key],
      };
    } else {
      nextConfig[key] = userConfig[key];
    }
  }

  return nextConfig;
}

export default mergeConfig(nextConfig, userConfig);