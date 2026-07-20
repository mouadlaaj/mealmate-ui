# MealMate UI

React frontend for MealMate.

## Run locally

The backend must be running on `http://localhost:8001`.

```powershell
npm install
npm start
```

Open `http://localhost:3000`.

## Useful commands

```powershell
npm start       # Start the development server
npm test        # Run tests
npm run build   # Create a production build
```

API requests are defined in `src/services/api.js` and use:

```text
http://localhost:8001/api/v1
```

## Run with Docker

From the project root:

```powershell
docker compose up -d --build
```
