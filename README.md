# Movie Recommender

The project has a FastAPI backend (`main.py`) and a Streamlit frontend (`app.py`).
The backend uses TMDB for movie data and the local pickle files for
TF-IDF recommendations.

## Requirements

- Python 3.11.9 (the version declared in `runtime.txt`)
- A TMDB API key

## Local setup

Create and activate a virtual environment from the project directory:

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

Copy `.env.example` to `.env` and set `TMDB_API_KEY` to your TMDB API key. Keep
`.env` private; it is excluded from Git. `API_BASE_URL` is optional and defaults
to the local FastAPI service at `http://127.0.0.1:8000`.

## Run

Open two terminals in the project directory and activate `.venv` in each.

Start the backend in the first terminal:

```bash
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

The API health endpoint is available at `http://127.0.0.1:8000/health`, and
interactive API documentation is at `http://127.0.0.1:8000/docs`.

Start the frontend in the second terminal:

```bash
streamlit run app.py
```

Open the local URL printed by Streamlit (normally `http://localhost:8501`).

The backend loads `df.pkl`, `indices.pkl`, `tfidf_matrix.pkl`, and `tfidf.pkl`
from the project directory at startup. All four files must be present.