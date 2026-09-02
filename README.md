# Convertly

A full-stack unit conversion app with a React + Material UI frontend and an Express backend.

## Run it

```powershell
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend calls the Node API at `http://localhost:3001`.

Supported categories: length, volume, and temperature. The API exposes `GET /api/units` and `POST /api/convert`.
