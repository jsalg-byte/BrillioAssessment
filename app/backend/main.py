import json
from datetime import datetime
from pathlib import Path
from fastapi import FastAPI, HTTPException

app = FastAPI()

# Load into memory on startup (Performant)
DATA_PATH = Path(__file__).parent / "sample_listings.json"
with open(DATA_PATH, "r") as file:
    LISTINGS = json.load(file)


@app.get("/")
def read_root():
    return {"message": "Hello World"}
