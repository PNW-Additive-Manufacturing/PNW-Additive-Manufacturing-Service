# Additive Manufacturing Service CRON Jobs

- [x] Delete unused models (request deleted, or model purged) from the datastore (every day).
- [x] Perform model-analysis using a queue system.
<!-- 3. Clear temporary files (produced from FarmAPI). -->

## Getting Started

A few environment variables are required. DOTENV is included.
```
# .env

# A PostgresSQL connection string. 
DB_CONNECTION=
MODEL_UPLOAD_DIR=
FARM_API_URL=http://localhost:8080
# Amount of days a model persists until it should be purged.
MODEL_LIFESPAN=267
```

```
npm install
npm run run
```

