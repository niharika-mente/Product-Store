# Elasticsearch Integration Guide

This document outlines the Elasticsearch integration for the Product Store application, detailing deployment, data synchronization, and fallback strategies.

## 1. Deployment and Infrastructure

Elasticsearch is now a part of the core infrastructure to provide advanced full-text search capabilities, including fuzzy matching and relevance scoring.

### Local Development
For local development, Elasticsearch is included in the root `docker-compose.yml`. You can start it alongside MongoDB using:

```bash
docker-compose up -d
```

### Environment Variables
To connect the backend to Elasticsearch, ensure the following environment variables are set (as detailed in `BACKEND/.env.example`):

- `ELASTICSEARCH_NODE`: The URL of the Elasticsearch instance (e.g., `http://localhost:9200`).
- `ELASTICSEARCH_USERNAME` (Optional): Username for basic authentication.
- `ELASTICSEARCH_PASSWORD` (Optional): Password for basic authentication.

## 2. Data Sync Strategy

The synchronization between MongoDB (the primary data store) and Elasticsearch (the search index) is handled in real-time via explicit controller hooks, supplemented by a manual bulk sync script.

### Real-Time Synchronization
To avoid complex Mongoose middleware and keep the logic explicit, the synchronization happens directly in `BACKEND/controllers/product.controller.js`:
- **Create**: After a product is successfully saved to MongoDB, it is indexed in Elasticsearch via `indexProduct()`.
- **Update**: Upon updating a product, the new data is pushed to Elasticsearch.
- **Delete**: The project uses soft deletes (`isDeleted: true`). When a product is soft-deleted in MongoDB, it is explicitly removed from the Elasticsearch index via `deleteProductFromIndex()`.

### Bulk / Initial Synchronization
For existing deployments or disaster recovery, a bulk synchronization script is provided. It fetches all non-deleted products from MongoDB and indexes them into Elasticsearch.

To run the bulk sync:
```bash
cd BACKEND
npm run start:sync # (or node scripts/syncElasticsearch.js)
```
*Note: This script requires `MONGO_URI` to be set in your environment.*

## 3. Fallback Handling

Search functionality is critical, so a graceful fallback mechanism has been implemented. 

- **Initialization Check**: If `ELASTICSEARCH_NODE` is not provided in the environment (e.g., during testing or unconfigured deployments), the Elasticsearch client is not initialized.
- **Query Fallback**: In `searchProducts`, if the Elasticsearch client is uninitialized, unreachable, or returns an error, the backend automatically falls back to the legacy MongoDB `$regex` search.
- **Test Environments**: The Elasticsearch client is explicitly disabled when `NODE_ENV === 'test'` to prevent connection timeouts and keep unit tests fast and independent of external search infrastructure.
