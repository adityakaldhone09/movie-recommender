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
|   https://<your-app>.vercel.app    |                           |  https://<your-backend>.onrender.com   |
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
5. Click **Apply**. Render will automatically provision and deploy the Web Service.

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
   | `ALLOWED_ORIGIN_REGEX` | `^https://.*\.vercel\.app$` | Permits all Vercel deployments |
   | `ALLOWED_ORIGINS` | `https://your-custom-domain.com` | (Optional) Custom production domain |

6. Click **Create Web Service**.

### 3. Verify Live Backend
Once the deployment finishes:
- Test the health endpoint in your browser or terminal:
  ```bash
  curl https://<your-backend-name>.onrender.com/health
  ```
  Expected output:
  ```json
  {"status":"healthy","models_loaded":true,"dataset_size":45460}
  ```
- Copy your live backend URL (e.g. `https://movie-recommender-api.onrender.com`).

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
   | `VITE_API_BASE_URL` | `https://<your-backend-name>.onrender.com` | Your live Render backend HTTPS URL (no trailing slash) |
6. Click **Deploy**.

Vercel will build the project using Vite and deploy it to a URL like `https://<your-project>.vercel.app`.

---

## Part D: Connect and Synchronize Services

### 1. Configure Backend CORS
The backend in `main.py` is configured to automatically allow:
- Any origin ending in `.vercel.app` (both production and preview branch deployments).
- Localhost development ports (`http://localhost:5173`, `http://localhost:3000`, `http://127.0.0.1:8000`).

If you assign a **custom domain** to your Vercel project (e.g. `https://cinemamovies.com`):
1. Go to your Render Web Service dashboard -> **Environment**.
2. Add or update `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://cinemamovies.com
   ```
3. Save changes (Render will automatically redeploy).

### 2. Updating Backend URL on Vercel
If your Render backend URL changes:
1. Go to your Vercel Project -> **Settings** -> **Environment Variables**.
2. Edit `VITE_API_BASE_URL` with the new backend URL.
3. Go to the **Deployments** tab, click the three dots on your latest deployment, and select **Redeploy** (ensure "Use existing build cache" is unchecked so the new environment variable is baked into the bundle).

---

## Part E: Production Verification Checklist

Run through these checks on your live production URL:

- [ ] **Frontend Loads:** Navigate to `https://<your-project>.vercel.app`. The dark cinematic UI, logo, navigation bar, and hero premiere carousel should display.
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
| **CORS blocked error in browser console** | Frontend origin is not matching allowed origins. | Verify that `ALLOWED_ORIGIN_REGEX` is set to `^https://.*\.vercel\.app$` or add your custom domain to `ALLOWED_ORIGINS` in Render. |
| **Frontend displays 404 on refresh** | Client-side routing rewrite missing. | Verify that `vercel.json` exists in the repository with the rewrite rule to `/index.html`. |
| **Frontend calls `localhost:8000` instead of Render** | `VITE_API_BASE_URL` was not set during Vercel build. | Add `VITE_API_BASE_URL=https://<your-backend>.onrender.com` in Vercel settings and trigger a fresh Redeployment. |
| **Backend error: `TMDB_API_KEY missing`** | Key not set in Render environment. | Add `TMDB_API_KEY` in Render Web Service Environment variables. |
