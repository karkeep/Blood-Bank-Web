import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import * as dotenv from "dotenv";
import { extendStorageWithBloodBankMethods } from "./bloodbank-storage";

// Load environment variables from .env file
dotenv.config({ path: process.cwd() + '/.env' });

// Initialize blood bank storage
extendStorageWithBloodBankMethods();

// Debug - check if environment variables are loaded
console.log('==== Server Environment ====');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '[SET]' : '[NOT SET]');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '[SET]' : '[NOT SET]');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID || '[NOT SET]');
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL ? '[SET]' : '[NOT SET]');
console.log('FIREBASE_PRIVATE_KEY:', process.env.FIREBASE_PRIVATE_KEY ? '[SET]' : '[NOT SET]');
console.log('USE_MOCK_FIREBASE:', process.env.USE_MOCK_FIREBASE || 'false');
console.log('ALLOW_INVALID_TOKENS:', process.env.ALLOW_INVALID_TOKENS || 'false');
console.log('============================');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add CORS headers for development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    
    next();
  });
}

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Log all incoming requests
  console.log(`[REQUEST] ${req.method} ${path}`);
  
  // Capture the response for logging
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusColor = statusCode >= 500 ? "\x1b[31m" : // Red for 5xx
                       statusCode >= 400 ? "\x1b[33m" : // Yellow for 4xx
                       statusCode >= 300 ? "\x1b[36m" : // Cyan for 3xx
                       statusCode >= 200 ? "\x1b[32m" : // Green for 2xx
                       "\x1b[37m"; // White for others
    const resetColor = "\x1b[0m";
    
    let logLine = `${statusColor}[RESPONSE] ${req.method} ${path} ${res.statusCode}${resetColor} in ${duration}ms`;
    
    // For API routes, also log the response
    if (path.startsWith("/api")) {
      if (capturedJsonResponse) {
        // Try to get message from response for error codes
        const message = statusCode >= 400 && capturedJsonResponse.message ? 
                      ` - ${capturedJsonResponse.message}` : '';
        
        logLine += message;
        
        // For detailed logging, add the full response (limited to keep logs manageable)
        const responseStr = JSON.stringify(capturedJsonResponse);
        if (responseStr.length <= 120) {
          console.log(`[RESPONSE DATA] ${responseStr}`);
        } else {
          console.log(`[RESPONSE DATA] ${responseStr.substring(0, 100)}...`);
        }
      }
    }

    console.log(logLine);
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    console.error('[SERVER ERROR]', err);
    
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ 
      message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  });

  // Fallback route for API 404s
  app.use('/api/*', (req, res) => {
    res.status(404).json({ message: `API route not found: ${req.path}` });
  });

  // Static file serving and client-side routing setup
  if (process.env.NODE_ENV === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Determine the port to use with fallbacks
  const port = process.env.PORT || (process.env.NODE_ENV === 'development' ? 5173 : 5000);
  
  // Start the server on the configured port
  server.listen(port, () => {
    log(`Blood Bank server started on port ${port} in ${process.env.NODE_ENV} mode`);
  }).on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      log(`Port ${port} is in use. Please close other applications using this port and try again.`);
    } else {
      console.error(`Failed to start server: ${err.message}`);
    }
    process.exit(1);
  });
})();
