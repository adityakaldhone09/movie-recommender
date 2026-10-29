# CINEVA — Cinematic Movie Discovery & AI Recommendation System

A modern movie discovery platform combining the immersive aesthetics of **Netflix** and **Letterboxd** with machine learning content embeddings (**TF-IDF Cosine Similarity** over 45,000+ films) and TMDB intelligence.

## Features

- **Cinematic Homepage**: Full-width featured premieres hero carousel with slow zoom, synopsis, rating badges, and instant trailer / details triggers.
- **AI Recommendation Engine**:
  - **TF-IDF Content Similarity**: Cosine similarity against 45,000+ local movie metadata vectors with authentic match score percentages.
  - **Mood-Based Vibe Discovery**: Mind-Bending, Feel-Good, Dark & Intense, Romantic, Thrilling, Inspirational, Family Night, and Sci-Fi Adventure.
  - **Multi-Genre Filter & Sliders**: Multi-select genre tags, minimum rating range slider (0.0 – 9.0+), and release era range slider (1970 – 2026).
- **Interactive Movie Cards & Shelves**: Responsive poster cards with smooth hover lift, quick bookmark actions, match badges, and Chevrons for gliding shelf navigation.
- **Full Movie Details Modal**: Backdrop showcase, director, cast cards with avatars, runtime, synopsis, official YouTube trailer player, and dual recommendations tabs.
- **Persistent Watchlist**: Device-persisted movie queue with quick removal and feedback toasts.
- **Responsive & Accessible**: Keyboard navigable, respects reduced motion, and fully responsive across mobile, tablet, and desktop screens.

---

## Architecture

- **Backend**: FastAPI (`main.py`)
  - Pickled TF-IDF matrix & dataframe (`df.pkl`, `indices.pkl`, `tfidf_matrix.pkl`, `tfidf.pkl`)
  - TMDB REST integration for fresh movie metadata, cast, director, backdrops, and official trailers
  - Integrated static SPA serving from `dist/`
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion + Lucide Icons
- **Legacy Compatibility**: Streamlit interface (`app.py`) preserved and fully functional.

---

## Quickstart

### 1. Backend Setup

```bash
# Activate virtual environment
source .venv/bin/activate

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Ensure TMDB_API_KEY is present in your .env
# TMDB_API_KEY=your_key_here
```

### 2. Frontend Build / Development

```bash
# Install frontend packages
npm install

# Build the production bundle
npm run build

# Or run Vite live development server
npm run dev
```

### 3. Running the Unified Full-Stack Platform

Start the FastAPI server:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

- **Cinematic Web Platform**: Open [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive API Documentation**: Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **API Health Check**: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

*(Optional) Legacy Streamlit App:*
```bash
streamlit run app.py
```
