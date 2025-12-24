# Blood Bank Application - Firebase Migration Guide

This document provides instructions on how to migrate the Blood Bank application from PostgreSQL to Firebase Realtime Database.

## Prerequisites

1. Firebase project with Realtime Database enabled
2. Service account credentials (for the migration script)

## Setup Firebase

1. Create a Firebase project at https://console.firebase.google.com/
2. Navigate to "Realtime Database" and create a database
3. Set the database rules by copying the content from `database.rules.json`
4. Go to Project Settings > Service Accounts > Generate new private key
5. Save the downloaded file as `firebase-credentials.json` in the project root

## Environment Configuration

Create a `.env` file based on the `.env.example` with your Firebase configuration:

```
# Firebase Configuration
USE_FIREBASE=true
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_DATABASE_URL=https://your-project-id-default-rtdb.firebaseio.com
```

## Migration

To migrate existing data from PostgreSQL to Firebase:

```
npm run migrate:firebase
```

This script will:
1. Read data from PostgreSQL
2. Convert and format the data for Firebase
3. Write the data to your Firebase Realtime Database

## Switching Between Storage Implementations

The application can use either PostgreSQL or Firebase as the data storage:

- To use Firebase: Set `USE_FIREBASE=true` in your `.env` file or environment variables
- To use PostgreSQL: Set `USE_FIREBASE=false` in your `.env` file

In production, Firebase is used by default.

## Firebase Database Structure

The Firebase Realtime Database follows this structure:

```
{
  "users": {
    "$userId": {
      // User data including id, username, email, bloodType, etc.
    }
  },
  "donorProfiles": {
    "$profileId": {
      // Donor profile data including userId, status, badge, etc.
    }
  },
  "emergencyRequests": {
    "$requestId": {
      // Emergency request data
    }
  },
  "donationRecords": {
    "$recordId": {
      // Donation record data
    }
  },
  "documents": {
    "$documentId": {
      // Document data
    }
  }
}
```

The security rules for the database are defined in `database.rules.json`.

## Running with Firebase

To run the application with Firebase:

```
# Development with Firebase
USE_FIREBASE=true npm run dev

# Production (uses Firebase by default)
npm run build
npm run start
```

## Client-Side Firebase Integration

The client already has Firebase integration in:
- `client/src/lib/firebase/config.ts` (Firebase initialization)
- `client/src/lib/firebase/database.ts` (Database operations)

Make sure the Firebase configuration in `config.ts` matches your Firebase project.
