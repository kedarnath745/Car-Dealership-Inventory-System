/**
 * Vercel entry point for the backend service (see the root vercel.json). Vercel's
 * Express detection scans this file for the framework import and serves its default
 * export. The app itself is built in src/app.ts; locally the API starts from
 * src/server.ts (`npm run dev` / `npm start`).
 */
import express from 'express';
import app from './src/server';

export default app satisfies express.Express;
