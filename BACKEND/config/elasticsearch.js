import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';
dotenv.config();

let client = null;

if (process.env.ELASTICSEARCH_NODE && process.env.NODE_ENV !== 'test') {
  try {
    client = new Client({
      node: process.env.ELASTICSEARCH_NODE,
      auth: process.env.ELASTICSEARCH_USERNAME ? {
        username: process.env.ELASTICSEARCH_USERNAME,
        password: process.env.ELASTICSEARCH_PASSWORD,
      } : undefined,
    });
    console.log("Elasticsearch client initialized");
  } catch (err) {
    console.error("Elasticsearch initialization failed", err.message);
  }
} else {
  console.log("Elasticsearch node not configured. Search will fallback to MongoDB.");
}

export default client;
