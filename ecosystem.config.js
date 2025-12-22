module.exports = {
  apps: [
    {
      name: "frontend",
      cwd: "/var/www/letstry-turborepo/apps/frontend",
      script: "./.next/standalone/apps/frontend/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "admin",
      cwd: "/var/www/letstry-turborepo/apps/admin",
      script: "./.next/standalone/apps/admin/server.js",
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
