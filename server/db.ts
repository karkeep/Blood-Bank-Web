import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";
import * as dotenv from "dotenv";

// Load environment variables before checking DATABASE_URL
dotenv.config({ path: process.cwd() + '/.env' });

// Check if Firebase is being used - if so, we don't need PostgreSQL
const useFirebase = process.env.USE_FIREBASE === 'true';

// Initialize dummy objects for type compatibility when using Firebase
let pool = null;
let db = null;

// Only connect to PostgreSQL if not using Firebase
if (!useFirebase) {
  // Configure Neon with WebSocket constructor
  neonConfig.webSocketConstructor = ws;

  // Add a fallback value if DATABASE_URL is not set from .env
  if (!process.env.DATABASE_URL) {
    console.log("Warning: DATABASE_URL not found in environment. Using fallback configuration.");
    process.env.DATABASE_URL = "postgres://prabeshkarkee@localhost:5432/bloodbank?sslmode=disable";
  }

  try {
    console.log("Connecting to PostgreSQL database...");
    console.log("Database URL:", process.env.DATABASE_URL);
    
    // Create the pool with a connection timeout
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      connectionTimeoutMillis: 5000  // 5 second timeout
    });
    
    // Testing connection
    if (process.env.NODE_ENV === 'development') {
      pool.connect()
        .then(client => {
          console.log("Successfully connected to PostgreSQL database");
          client.release();
        })
        .catch(err => {
          console.error("Error connecting to PostgreSQL database:", err.message);
          
          if (err.message.includes('ECONNREFUSED') || err.code === 'ECONNREFUSED') {
            console.error("Connection refused. Make sure PostgreSQL is running on the specified port and host.");
          }
        });
    }
    
    // Initialize Drizzle ORM
    db = drizzle({ client: pool, schema });
  } catch (error) {
    console.error("Failed to initialize database connection:", error);
    // Create dummy objects if connection fails
    pool = null;
    db = null;
  }
} else {
  console.log("Using Firebase Realtime Database - PostgreSQL connection skipped");
}

export { pool, db };