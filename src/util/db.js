// db.js
import { MongoClient } from 'mongodb';
import uri, { databasename, mongoConnection } from './uri.js'

const DATABASE = databasename;
const CONNECTION = mongoConnection;
const POSTS = 'posts';
const COUNTER = 'counter';

let db = null;

// Create a single MongoClient instance
export const client = new MongoClient(mongoConnection); // connection

// Create and reuse a single database connection
export async function getDB(database = DATABASE) {
  if (db) return db;          // reuse existing connection

  await client.connect();     // connect once
  db = client.db(database);   // store db globally
  return db;
}

// Return the "posts" collection
export function getPostsCollection() {
  if (!db) throw new Error("Database not connected. Call connect() first.");
  return db.collection(POSTS);
}

// Return the "counter" collection
export function getCounterCollection() {
  if (!db) throw new Error("Database not connected. Call connect() first.");
  return db.collection(COUNTER);
}

