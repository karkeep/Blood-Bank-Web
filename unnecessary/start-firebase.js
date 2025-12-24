#!/usr/bin/env node

/**
 * start-firebase.js - A wrapper script to start the application with Firebase
 * 
 * This script ensures that Firebase is properly configured and initialized
 * before starting the application.
 */

import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get current directory (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

// Set up environment variables for Firebase
process.env.USE_FIREBASE = 'true';

// Check if Firebase credentials exist
const credentialsPath = path.join(process.cwd(), 'firebase-credentials.json');
if (!fs.existsSync(credentialsPath)) {
  console.error('\x1b[31m%s\x1b[0m', 'ERROR: Firebase credentials not found!');
  console.error('\x1b[33m%s\x1b[0m', `Expected file: ${credentialsPath}`);
  console.error('\x1b[33m%s\x1b[0m', 'Please download your service account JSON from Firebase Console:');
  console.error('\x1b[33m%s\x1b[0m', '1. Go to Firebase Console > Project Settings > Service Accounts');
  console.error('\x1b[33m%s\x1b[0m', '2. Click "Generate New Private Key"');
  console.error('\x1b[33m%s\x1b[0m', '3. Save the file as "firebase-credentials.json" in the project root');
  process.exit(1);
}

// Check if database URL is configured
if (!process.env.FIREBASE_DATABASE_URL) {
  console.error('\x1b[31m%s\x1b[0m', 'ERROR: Firebase Database URL not configured!');
  console.error('\x1b[33m%s\x1b[0m', 'Please set FIREBASE_DATABASE_URL in your .env file');
  process.exit(1);
}

console.log('\x1b[32m%s\x1b[0m', '✓ Firebase credentials found');
console.log('\x1b[32m%s\x1b[0m', `✓ Firebase Database URL: ${process.env.FIREBASE_DATABASE_URL}`);

console.log('\x1b[36m%s\x1b[0m', 'Starting application with Firebase...');

// Start the application with Firebase enabled
const dev = process.argv.includes('--dev');
const command = dev ? 'tsx' : 'node';
const args = dev ? ['server/index.ts'] : ['dist/index.js'];

// Use the full path to the command in node_modules/.bin
const commandPath = path.join(process.cwd(), 'node_modules', '.bin', command);

const child = spawn(commandPath, args, {
  env: {
    ...process.env,
    USE_FIREBASE: 'true',
    NODE_ENV: dev ? 'development' : 'production'
  },
  stdio: 'inherit'
});

child.on('close', (code) => {
  process.exit(code);
});
