# IP Address Checker

A full-stack IP address checker with a Node.js backend and React + Vite + TailwindCSS frontend. The backend performs all IP lookups (current IP, reverse DNS, geolocation, ASN/ISP, and VPN/proxy/data-center flags) and exposes them through simple HTTP endpoints.

## Features

- Detects the current public IP address
- Manual IPv4/IPv6 lookup with validation and clear errors
- Reverse DNS, geo, ASN/ISP, and privacy flags (VPN/Proxy/DataCenter/TOR when available)
- Lookup history persisted in `localStorage`
- Light/dark mode toggle
- Dockerfiles for backend and frontend plus a `docker-compose.yml` for local orchestration
- Designed for deployment to GCP Cloud Run (each service containerized)

## Project Structure

```
backend/       # Node.js (standard library) HTTP server
frontend/      # React + TypeScript + Vite + TailwindCSS UI
Dockerfile     # Provided per service inside respective folders
docker-compose.yml
```

## Backend

### Endpoints

- `GET /ip` → `{ "ip": "1.2.3.4" }` using `x-forwarded-for` or socket address.
- `GET /lookup?ip=<address>` → detailed metadata with reverse DNS, geo, ASN/ISP, and privacy flags.

### Example Responses

IPv4:
```json
{
  "ip": "8.8.8.8",
  "version": 4,
  "reverse": "dns.google",
  "geo": { "country": "United States", "region": "California", "city": "Mountain View" },
  "asn": "AS15169",
  "isp": "Google LLC",
  "flags": { "datacenter": true, "proxy": false, "vpn": false, "tor": false }
}
```

IPv6:
```json
{
  "ip": "2001:4860:4860::8888",
  "version": 6,
  "reverse": "dns.google",
  "geo": { "country": "United States", "region": "California", "city": "Mountain View" },
  "asn": "AS15169",
  "isp": "Google LLC",
  "flags": { "datacenter": true, "proxy": false, "vpn": false, "tor": false }
}
```

(Geo/flag fields depend on the upstream IP data provider.)

### Running the backend locally

```bash
cd backend
npm install   # no external dependencies beyond Node standard library
npm start
# Server listens on PORT (default 8080)
```

Run backend tests:
```bash
cd backend
npm test
```

## Frontend

### Running locally

```bash
cd frontend
npm install
npm run dev -- --host
```

Visit `http://localhost:5173` and ensure `VITE_API_BASE_URL` points to the backend (defaults to `http://localhost:8080`).

### Styling

TailwindCSS utilities are defined in `src/index.css` and configured via `tailwind.config.js`.

## Docker

### Build & Run with Docker Compose

```bash
docker-compose up --build
```
- Frontend: http://localhost:5173
- Backend: http://localhost:8080

### Backend Docker build
```bash
cd backend
docker build -t ip-checker-backend .
```

### Frontend Docker build
```bash
cd frontend
docker build -t ip-checker-frontend .
```

## Deploying to Cloud Run

1. Build images and push to Container Registry / Artifact Registry:
   ```bash
   # Backend
   cd backend
   gcloud builds submit --tag gcr.io/PROJECT_ID/ip-checker-backend

   # Frontend
   cd ../frontend
   gcloud builds submit --tag gcr.io/PROJECT_ID/ip-checker-frontend
   ```
2. Deploy each image:
   ```bash
   gcloud run deploy ip-checker-backend --image gcr.io/PROJECT_ID/ip-checker-backend --allow-unauthenticated --port 8080
   gcloud run deploy ip-checker-frontend --image gcr.io/PROJECT_ID/ip-checker-frontend --allow-unauthenticated --port 5173 \
     --set-env-vars VITE_API_BASE_URL="https://<backend-service-url>"
   ```
3. Update the frontend service environment variable if the backend URL changes.

## Configuration

- `PORT` (backend): port to serve API (defaults to 8080)
- `CORS_ORIGINS` (backend): comma-separated list of allowed origins, default `*`
- `VITE_API_BASE_URL` (frontend): base URL for API requests

## Notes

- All lookups are performed on the backend using Node's `https` client and DNS utilities; the frontend never calls external IP services directly.
- History is stored locally in the browser and limited to the 10 most recent IPs.
