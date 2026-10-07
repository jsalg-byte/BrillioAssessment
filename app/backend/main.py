import json
from datetime import datetime
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException

app = FastAPI()

# Load into memory on startup (Performant)
DATA_PATH = Path(__file__).parent / "sample_listings.json"
with open(DATA_PATH, "r") as file:
    LISTINGS = json.load(file)


@app.get("/")
def read_root():
    return {"message": "Hello World"}


@app.get("/api/search")
def search_listings(
    minPrice: Optional[float] = None,
    maxPrice: Optional[float] = None,
    minBedrooms: Optional[int] = None,
    city: Optional[str] = None,
    keyword: Optional[str] = None,
    targetBudget: Optional[float] = None,
):
    # Input validation and edge case handling
    if minPrice is not None and maxPrice is not None and minPrice > maxPrice:
        raise HTTPException(status_code=400, detail="minPrice cannot exceed maxPrice")
    if minPrice is not None and minPrice < 0:
        raise HTTPException(status_code=400, detail="minPrice cannot be negative")
    if maxPrice is not None and maxPrice < 0:
        raise HTTPException(status_code=400, detail="maxPrice cannot be negative")
    if minBedrooms is not None and minBedrooms < 0:
        raise HTTPException(status_code=400, detail="minBedrooms cannot be negative")

    # If no target budget given, create it
    computed_budget = targetBudget
    if computed_budget is None:
        if minPrice is not None and maxPrice is not None:
            computed_budget = (((minPrice + maxPrice) / 2.0) + maxPrice) / 2.0
        elif minPrice is not None:
            computed_budget = minPrice
        elif maxPrice is not None:
            computed_budget = maxPrice

    results = []
    city_normalized = city.strip().lower() if city and city.strip() else None
    keyword_normalized = keyword.strip().lower() if keyword and keyword.strip() else None

    # Filter through in-memory dataset
    for listing in LISTINGS:
        if minPrice is not None and listing.get("price", 0) < minPrice:
            continue
        if maxPrice is not None and listing.get("price", 0) > maxPrice:
            continue
        if minBedrooms is not None and listing.get("bedrooms", 0) < minBedrooms:
            continue
        if city_normalized is not None and listing.get("city", "").strip().lower() != city_normalized:
            continue
        if keyword_normalized is not None and keyword_normalized not in listing.get("description", "").lower():
            continue

        results.append(listing)

    return results
