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


def parse_listing_date(date_str: Optional[str]) -> Optional[datetime]:
    if not date_str or not isinstance(date_str, str):
        return None

    cleaned = date_str.strip()
    # 1. Try ISO 8601 (handles YYYY-MM-DD as well as timestamps like YYYY-MM-DDTHH:MM:SS)
    try:
        return datetime.fromisoformat(cleaned.replace("Z", "+00:00"))
    except ValueError:
        pass

    # 2. Try common MLS feed date formats
    for fmt in ("%m/%d/%Y", "%Y/%m/%d", "%d-%m-%Y", "%b %d, %Y"):
        try:
            return datetime.strptime(cleaned, fmt)
        except ValueError:
            continue

    # Not a valid date string
    return None

# helper function
def calculate_relevance(listing_price: float, listed_date: Optional[str], target_budget: Optional[float] = None) -> float:
    score = 0.0

    # 1. Target Budget Value (70% weight)
    if target_budget is not None and target_budget > 0:
        price_diff = abs(listing_price - target_budget)
        budget_score = max(0.0, 1.0 - (price_diff / target_budget))
        score += budget_score * 0.7

    # 2. Recency (30% weight)
    # Parse multiple known formats; give 0.0 recency if it cannot be parsed as a date
    date_obj = parse_listing_date(listed_date)
    if date_obj is not None:
        # Strip timezone if present to compare with naive local now
        if date_obj.tzinfo is not None:
            date_obj = date_obj.replace(tzinfo=None)
        days_old = (datetime.now() - date_obj).days
        if days_old < 0:
            days_old = 0
        recency_score = max(0.0, 1.0 - (days_old / 60.0))
        score += recency_score * 0.3
    else:
        # Explicit 0 points for recency if date is missing or unparseable
        score += 0.0
    # round to 3 decimal places because we dont want anythign silly
    return round(score, 3)



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

    # Filter and score surviving listings
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

        listing_copy = listing.copy()
        listing_copy["relevance"] = calculate_relevance(
            listing_copy.get("price", 0),
            listing_copy.get("listedDate"),
            computed_budget,
        )
        results.append(listing_copy)

    # Sort by highest relevance score first
    results.sort(key=lambda x: x["relevance"], reverse=True)

    return results
