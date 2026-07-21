import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Static file serving plugin for uploads (dev only)
const uploadsStaticPlugin = () => ({
  name: 'uploads-static-plugin',
  configureServer(server) {
    server.middlewares.use('/uploads', (req, res, next) => {
      try {
        // CRITICAL FIX: Decode URL first to handle encoded spaces
        let decodedUrl = decodeURIComponent(req.url || '');

        // CRITICAL FIX: Properly construct path - when middleware captures '/uploads',
        // req.url becomes '/data/filename.png', so we need to add 'uploads' back
        const uploadsPath = path.join(process.cwd(), 'public', 'uploads', decodedUrl);

        console.log('📁 Static file request:', {
          originalUrl: req.url,
          decodedUrl: decodedUrl,
          requestedPath: `/uploads${decodedUrl}`,
          fullPath: uploadsPath,
          exists: fs.existsSync(uploadsPath)
        });

        if (fs.existsSync(uploadsPath)) {
          const stats = fs.statSync(uploadsPath);

          if (stats.isFile()) {
            // Serve the file with appropriate headers
            const ext = path.extname(uploadsPath).toLowerCase();
            const mimeTypes = {
              '.jpg': 'image/jpeg',
              '.jpeg': 'image/jpeg',
              '.png': 'image/png',
              '.gif': 'image/gif',
              '.svg': 'image/svg+xml',
              '.webp': 'image/webp',
              '.pdf': 'application/pdf',
              '.txt': 'text/plain'
            };

            const mimeType = mimeTypes[ext] || 'application/octet-stream';

            // CRITICAL: Set proper headers
            res.setHeader('Content-Type', mimeType);
            res.setHeader('Cache-Control', 'public, max-age=31536000');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');

            console.log(`✅ Serving file: ${uploadsPath} (${mimeType})`);

            const fileStream = fs.createReadStream(uploadsPath);
            fileStream.pipe(res);
            return;

          } else if (stats.isDirectory()) {
            // List directory contents for debugging
            const files = fs.readdirSync(uploadsPath);
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(JSON.stringify({
              directory: decodedUrl,
              files: files,
              message: 'Directory listing for debugging'
            }));
            return;
          }
        }

        // File not found
        console.warn('📁 File not found:', uploadsPath);
        res.statusCode = 404;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify({
          error: 'File not found',
          requestedPath: `/uploads${decodedUrl}`,
          fullPath: uploadsPath,
          originalUrl: req.url,
          decodedUrl: decodedUrl
        }));

      } catch (error) {
        console.error('❌ Error in uploads middleware:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.end(JSON.stringify({
          error: 'Server error in uploads middleware',
          details: error.message,
          requestedUrl: req.url
        }));
      }
    });
  }
});

// API proxy configuration
const apiProxyPlugin = (env) => ({
  name: 'api-proxy-plugin',
  configureServer(server) {
    const apiBaseUrl = env.VITE_API_URL || 'http://localhost:4041';
    console.log(`Proxying API requests to: ${apiBaseUrl}`);

    server.middlewares.use('/api', (req, res, next) => {
      const target = `${apiBaseUrl}${req.url}`;
      console.log(`Proxying request to: ${target}`);

      fetch(target, {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
      })
      .then(apiRes => {
        res.statusCode = apiRes.status;
        apiRes.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        return apiRes.text();
      })
      .then(body => {
        res.end(body);
      })
      .catch(err => {
        console.error('API proxy error:', err);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'API proxy error', details: err.message }));
      });
    });
  }
});

// RESTORED: Custom plugin to handle content JSON files properly for CMS
const contentJsonPlugin = () => ({
  name: 'content-json-plugin',
  resolveId(id) {
    // Exclude content JSON files from being processed by Vite's JSON plugin
    if (id.includes('/content/') && id.endsWith('.json')) {
      return null; // Let them be handled as regular modules
    }
  },
  load(id) {
    // Handle content JSON files as raw text that gets parsed at runtime
    if (id.includes('/content/') && id.endsWith('.json')) {
      try {
        const content = fs.readFileSync(id, 'utf-8');
        // Validate JSON without processing it through Vite's JSON plugin
        JSON.parse(content);
        return `export default ${content}`;
      } catch (error) {
        console.error(`Error loading content JSON file ${id}:`, error);
        // Return empty valid structure instead of failing
        return `export default { "title": "Error loading content", "sections": [] }`;
      }
    }
  }
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      uploadsStaticPlugin(),
      apiProxyPlugin(env),
      contentJsonPlugin()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      open: false,
      historyApiFallback: true,
      cors: true, // Enable CORS
      watch: {
        // Watch content directories for changes but don't process them through JSON plugin
        ignored: ['!**/content/**', '!**/public/uploads/**']
      }
    },
    build: {
      // Ensure uploads directory is copied during build
      copyPublicDir: true,
    },

    esbuild: {
      // Strip console.* and debugger from production bundles (dev is untouched).
      // Removes the project's ~120 ungated debug logs; the app surfaces real errors
      // through its ErrorBoundary, not the console.
      drop: mode === 'production' ? ['console', 'debugger'] : [],
    },

    // Ensure public directory assets are properly served
    publicDir: 'public',

    // Define for build environment
    define: {
      // Add any global constants here if needed
    },

    // CSS configuration
    css: {
      postcss: './postcss.config.js',
    },

    // RESTORED: More specific asset handling - exclude content JSON from asset processing
    assetsInclude: ['**/*.md', 'public/**/*.json'], // Only include JSON files in public directory as assets
  };
});