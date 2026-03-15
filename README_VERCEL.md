# Vercel Deployment Guide

This application is configured for Vercel deployment, but there is one critical limitation:

## SQLite Database Limitation
The application currently uses **SQLite** (`better-sqlite3`) for data storage. 
**Vercel's file system is read-only and ephemeral.** This means:
1. The database will reset every time the serverless function restarts.
2. You cannot save new movies or categories permanently on Vercel using SQLite.

### Recommended Solution
To make the app fully functional on Vercel, you should migrate the database to a hosted service:
- **Firebase Firestore**: Recommended for this app as it's already in the dependencies.
- **Supabase / PostgreSQL**: A great alternative for relational data.
- **MongoDB Atlas**: Good for document-based storage.

## Deployment Steps
1. Push this code to a GitHub repository.
2. Connect the repository to Vercel.
3. Vercel will automatically detect the `vercel.json` and build the app.
4. Add your environment variables (like `GEMINI_API_KEY`, `VITE_IMGBB_API_KEY`, etc.) in the Vercel Dashboard.

## Vercel Configuration
The `vercel.json` file handles:
- Routing `/api/*` requests to the Express server.
- Serving the static frontend built by Vite.
