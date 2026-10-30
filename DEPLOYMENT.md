# Production Deployment Guide: Vercel + Render

This guide outlines the exact, end-to-end steps to deploy the **Cinematic Movie Recommendation System (CINEVA)** to production using:
- **Frontend Hosting:** Vercel (Edge-optimized Single-Page Application)
- **Backend Hosting:** Render Web Service (FastAPI + Machine Learning Engine)
- **Source Control:** GitHub

---

## Architecture Overview

```
+------------------------------------+        HTTPS REST        +----------------------------------------+
|          Vercel Frontend           |  ======================>  |          Render Web Service            |
|     (React 18 + Vite + SPA)        |  (CORS allowed headers)   |  (FastAPI + Python 3.11 + Uvicorn)     |
| https://movie-recommender-th84-ni8srki03-adityakaldhone0486-2052.vercel.app | | https://movie-recommender-3zs7.onrender.com |
+------------------------------------+                           +----------------------------------------+
                  |                                                                   |
     Reads `VITE_API_BASE_URL`                                     Reads `TMDB_API_KEY` & `ALLOWED_ORIGINS`
                  |                                                                   |
    Rewrites direct routes to SPA                                  Loads: `df.pkl`, `indices.pkl`,
           (`vercel.json`)                                        `tfidf_matrix.pkl`, `tfidf.pkl`
```

---

## Part A: Prepare and Push to GitHub

Ensure all sensitive files, secrets, and generated artifacts are excluded prior to pushing.

### 1. Verify Ignored Files
The repository includes `.gitignore` covering:
- `.env`, `.env.local` (Local secrets)
- `node_modules/` (Local dependencies)
- `dist/` (Build output — compiled on Vercel)
- `.venv/`, `__pycache__/` (Python virtual environment and bytecode)

Verify with git status:
```bash
git status
```
Ensure `.env` does **not** appear under "Changes to be committed" or "Untracked files".

### 2. Commit and Push
```bash
git add .
git commit -m "Configure production deployment for Vercel and Render"
git push origin main
```

---

## Part B: Deploy the Backend to Render

Render will host the FastAPI application, serving endpoints for recommendations, movie searches, genres, trailers, and health checks.

### Option 1: Automatic Deployment via Render Blueprint (Recommended)
The repository includes [`render.yaml`](./render.yaml).

1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **Blueprints** in the top navigation -> **New Blueprint Instance**.
3. Select your GitHub repository `movie-recommender`.
4. Render will read `render.yaml` and prompt for the required environment variable:
   - `TMDB_API_KEY`: Enter your TMDB v3 API Key.
5. The blueprint configures `ALLOWED_ORIGINS` for the production Vercel origin and local development. Do not add a wildcard Vercel regex.
6. Click **Apply**. Render will automatically provision and deploy the Web Service.

---

### Option 2: Manual Web Service Setup on Render

If you prefer configuring the service manually in the Render dashboard:

1. Click **New +** -> **Web Service**.
2. Select your GitHub repository.
3. Configure the following service settings:
   - **Name:** `movie-recommender-api` (or your preferred name)
   - **Region:** Choose a region close to your users (e.g., Oregon, Ohio, Frankfurt)
   - **Branch:** `main`
   - **Root Directory:** Leave blank (repository root)
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     pip install --upgrade pip && pip install -r requirements.txt
     ```
   - **Start Command:**
     ```bash
     uvicorn main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan:** `Free` (or higher)

4. Click **Advanced Settings** and set:
   - **Health Check Path:** `/health`
   - **Auto-Deploy:** `Yes`

5. Add the **Environment Variables**:
   | Variable | Value | Notes |
   | :--- | :--- | :--- |
   | `PYTHON_VERSION` | `3.11.9` | Matches declared runtime |
   | `TMDB_API_KEY` | `your_tmdb_api_key` | Secret TMDB key |
   | `ALLOWED_ORIGINS` | `https://movie-recommender-th84-ni8srki03-adityakaldhone0486-2052.vercel.app,http://localhost:5173,http://127.0.0.1:5173` | Exact allowed browser origins; add a custom frontend domain here if needed |

6. Click **Create Web Service**.

### 3. Verify Live Backend
Once the deployment finishes:
- Test the health endpoint in your browser or terminal:
  ```bash
  curl https://movie-recommender-3zs7.onrender.com/health
  ```
  Expected output:
  ```json
  {"status":"healthy","models_loaded":true,"dataset_size":45460}
  ```
- Backend API base URL: `https://movie-recommender-3zs7.onrender.com`.

---

## Part C: Deploy the Frontend to Vercel

Vercel will host the React single-page application.

The repository root also contains the Python backend and its `requirements.txt` for Render. Vercel must install and build the frontend with npm; the Python files and model/data files remain in the repository for Render and are not Vercel serverless functions. `vercel.json` explicitly selects Vite, runs `npm ci` and `npm run build`, and publishes `dist`.

1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository `movie-recommender`.
4. Configure Project Settings:
   - **Framework Preset:** `Vite` (automatically detected)
   - **Root Directory:** `./` (root)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm ci`
   - **Development Command:** leave unset (Vercel uses the Vite preset)

   These settings should match the repository's `vercel.json`; do not set a Python or `pip install` build/install command, and do not add a Python function mapping. Keep the root directory at `./` so Vercel can access `package-lock.json` and the frontend source.
5. Expand **Environment Variables**:
   | Variable Name | Value | Description |
   | :--- | :--- | :--- |
   | `VITE_API_BASE_URL` | `https://movie-recommender-3zs7.onrender.com` | Render API base URL; no trailing slash; public configuration, not a secret |
6. Click **Deploy**.

Vercel will build the project using Vite and deploy it at `https://movie-recommender-th84-ni8srki03-adityakaldhone0486-2052.vercel.app`.

---

## Part D: Connect and Synchronize Services

### 1. Configure Backend CORS
The backend uses an explicit origin allowlist. It allows the production Vercel origin above and the local development origins `http://localhost:5173` and `http://127.0.0.1:5173`. Credentials are disabled; the frontend uses GET requests and the CORS middleware accepts the `Accept` header. Vercel preview deployments are not allowed by default.

If you assign a **custom domain** to your Vercel project (e.g. `https://cinemamovies.com`):
1. Go to your Render Web Service dashboard -> **Environment**.
2. Add the exact origin to `ALLOWED_ORIGINS`, comma-separated with the existing origins:
   ```
   ALLOWED_ORIGINS=https://movie-recommender-th84-ni8srki03-adityakaldhone0486-2052.vercel.app,http://localhost:5173,http://127.0.0.1:5173,https://cinemamovies.com
   ```
3. Save changes (Render will automatically redeploy).

Do not configure `ALLOWED_ORIGIN_REGEX` or a wildcard such as `https://*.vercel.app`. Remove any previously configured `ALLOWED_ORIGIN_REGEX` from the Render dashboard. To use a Vercel preview, add that specific deployment origin to `ALLOWED_ORIGINS` and redeploy Render.

### 2. Updating Backend URL on Vercel
If your Render backend URL changes:
1. Go to your Vercel Project -> **Settings** -> **Environment Variables**.
2. Edit `VITE_API_BASE_URL` with the new backend URL.
3. Go to the **Deployments** tab, click the three dots on your latest deployment, and select **Redeploy** (ensure "Use existing build cache" is unchecked so the new environment variable is baked into the bundle).

---

## Local Development

The `.env.example` documents the production frontend URL and backend-only settings; it is not loaded automatically. Keep `.env` and `.env.development.local` untracked. For local frontend development with the local API, create `.env.development.local` with:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Then install and run the React frontend:

```bash
npm ci
npm run dev
```

To run the backend locally, create a Python virtual environment, install `requirements.txt`, set `TMDB_API_KEY` in the ignored `.env`, and start `uvicorn main:app --host 0.0.0.0 --port 8000`. The backend's explicit CORS list includes the local Vite origin. Never put `TMDB_API_KEY` in a `VITE_*` variable.

The frontend calls `/home`, `/tmdb/search`, `/movie/id/{tmdb_id}`, `/movie/search`, `/genres`, and `/discover`. TF-IDF and genre recommendations are returned together by `/movie/search`. Watchlist data is intentionally saved in browser `localStorage`; the backend has no watchlist persistence route.

## Part E: Production Verification Checklist

Run through these checks on your live production URL:

- [ ] **Frontend Loads:** Navigate to `https://movie-recommender-th84-ni8srki03-adityakaldhone0486-2052.vercel.app`. The dark cinematic UI, logo, navigation bar, and hero premiere carousel should display.
- [ ] **Cold Start Notice:** If the backend was inactive, the interface displays a graceful notice while Render wakes up, then smoothly loads movie cards.
- [ ] **Direct Navigation & Refresh:**
  - Visit `https://<your-project>.vercel.app/discover` directly and press Refresh. Verify that Vercel routes correctly to the SPA without returning a 404.
  - Visit `https://<your-project>.vercel.app/watchlist` and verify clean loading.
- [ ] **AI TF-IDF Recommendation Flow:**
  - On the **Discover** tab, enter a movie title (e.g. `Inception` or `The Dark Knight`).
  - Click **Analyze & Recommend**.
  - Verify that matching movies appear with authentic percentage match badges (e.g. `89% Match`).
- [ ] **Faceted Filters & Sliders:**
  - Toggle Mood chips (e.g. `Mind-Bending`, `Dark & Intense`).
  - Adjust the Minimum Rating slider to `7.5+`.
  - Adjust the Release Era slider.
  - Verify that results filter dynamically.
- [ ] **Movie Details & Trailer Modal:**
  - Click any movie card.
  - Verify the modal opens with high-resolution backdrop, director, runtime, cast with avatars, and synopsis.
  - Click **Watch Trailer** to verify the embedded YouTube video player.
- [ ] **Watchlist Functionality:**
  - Click **Add to Watchlist** on any movie card or modal.
  - Verify the floating toast appears.
  - Navigate to the **Watchlist** tab and verify the saved movie is listed.
  - Refresh the page and confirm the movie remains saved (persisted via `localStorage`).
- [ ] **Browser Console Audit:** Open DevTools Console. Verify there are no CORS errors, uncaught promise rejections, or mixed-content warnings.

---

## Troubleshooting & Maintenance

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| **"Request timed out / Backend waking up"** | Render Free Tier spins down after 15 min of inactivity. | Wait 30–45s for the initial cold start. Upgrading to a Render Starter plan prevents sleep. |
| **CORS blocked error in browser console** | Frontend origin is not an exact allowed origin. | Add the exact Vercel/custom domain to `ALLOWED_ORIGINS` in Render; do not use a wildcard regex. |
| **Frontend displays 404 on refresh** | Client-side routing rewrite missing. | Verify that `vercel.json` exists in the repository with the rewrite rule to `/index.html`. |
| **Frontend calls the wrong API host** | `VITE_API_BASE_URL` is unset or stale. | Set `VITE_API_BASE_URL=https://movie-recommender-3zs7.onrender.com` in Vercel settings and trigger a fresh redeployment. |
| **Backend error: `TMDB_API_KEY missing`** | Key not set in Render environment. | Add `TMDB_API_KEY` in Render Web Service Environment variables. |
