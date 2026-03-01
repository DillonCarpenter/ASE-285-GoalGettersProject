import dotenv from "dotenv";

const envPath = process.platform === 'win32' ? './.env' : '../.env';

// Load environment variables
dotenv.config({
  quiet: true,
  path: envPath,
});



// Validate required variables
const user = process.env.MONGO_USER;
if (!user) throw new Error("MONGO_USER is not defined");

const password = process.env.MONGO_PASSWORD;
if (!password) throw new Error("MONGO_PASSWORD is not defined");

const cluster = process.env.MONGO_CLUSTER;
if (!cluster) throw new Error("MONGO_CLUSTER is not defined");
const connection = process.env.CONNECTION_STRING;
if (!connection) throw new Error("CONNECTION_STRING is not defined")

export const databasename = process.env.MONGO_DATABASE || "todoapp";
export const mongoConnection = connection;

// Construct the MongoDB connection string
const uri = `mongodb+srv://${user}:${password}@cluster0.${cluster}.mongodb.net/`;


// Export the URI
export default uri;