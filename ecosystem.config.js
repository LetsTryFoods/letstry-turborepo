module.exports = {
  apps: [
    {
      name: "frontend",
      script: "./apps/frontend/.next/standalone/apps/frontend/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "admin",
      script: "./apps/admin/.next/standalone/apps/admin/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
    },
    {
      name: "backend",
      script: "./apps/backend/dist/main.js",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};
