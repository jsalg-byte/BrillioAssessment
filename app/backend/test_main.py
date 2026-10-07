import pytest
from datetime import datetime
from fastapi.testclient import TestClient
from main import app, calculate_relevance, parse_listing_date

client = TestClient(app)


# -------------------------------------------------------------
# 1. Unit Tests for Date Parsing & Relevance Scoring
# -------------------------------------------------------------
def test_parse_listing_date_formats():
    # ISO 8601 formats
    assert parse_listing_date("2026-08-29") is not None
    assert parse_listing_date("2026-08-29T14:30:00Z") is not None
    # Alternate common formats
    assert parse_listing_date("08/29/2026") is not None
    assert parse_listing_date("2026/08/29") is not None
    # Invalid or non-dates
    assert parse_listing_date("not-a-date") is None
    assert parse_listing_date(None) is None
    assert parse_listing_date("") is None


def test_calculate_relevance_perfect_match():
    today_str = datetime.now().strftime("%Y-%m-%d")
    # Exact budget match (0.7) + today's date (0.3) = 1.0
    score = calculate_relevance(500000, today_str, target_budget=500000)
    assert score == 1.0


def test_calculate_relevance_unparseable_date_receives_zero_recency():
    # Exact budget match (0.7) + bad date (0.0 recency) = 0.7
    score = calculate_relevance(500000, "invalid-date", target_budget=500000)
    assert score == 0.7


def test_calculate_relevance_old_listing_capped_at_zero_recency():
    # 100 days old (beyond 60-day window) gets 0.0 recency
    score = calculate_relevance(500000, "2020-01-01", target_budget=500000)
    assert score == 0.7


def test_calculate_relevance_tied_scores():
    # Identical prices and listed dates produce identical relevance scores
    score_a = calculate_relevance(450000, "2026-08-29", target_budget=450000)
    score_b = calculate_relevance(450000, "2026-08-29", target_budget=450000)
    assert score_a == score_b


# -------------------------------------------------------------
# 2. Integration Tests: Core Search & Filters
# -------------------------------------------------------------
def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}


def test_search_all_default():
    response = client.get("/api/search")
    assert response.status_code == 200
    data = response.json()
    assert "results" in data
    assert "totalCount" in data
    assert data["totalCount"] == 12
    # Verify results are sorted descending by relevance score
    scores = [r["relevance"] for r in data["results"]]
    assert scores == sorted(scores, reverse=True)


def test_search_filter_by_city():
    response = client.get("/api/search?city=Springfield")
    assert response.status_code == 200
    data = response.json()
    assert data["totalCount"] == 4
    for item in data["results"]:
        assert item["city"].lower() == "springfield"


def test_search_filter_by_price_and_bedrooms():
    response = client.get("/api/search?minPrice=500000&maxPrice=600000&minBedrooms=3")
    assert response.status_code == 200
    data = response.json()
    for item in data["results"]:
        assert 500000 <= item["price"] <= 600000
        assert item["bedrooms"] >= 3


def test_search_filter_by_keyword_description():
    response = client.get("/api/search?keyword=garage")
    assert response.status_code == 200
    data = response.json()
    assert data["totalCount"] >= 1
    for item in data["results"]:
        assert "garage" in item["description"].lower()


# -------------------------------------------------------------
# 3. Edge Cases: Invalid Inputs
# -------------------------------------------------------------
def test_invalid_price_range_min_greater_than_max():
    response = client.get("/api/search?minPrice=600000&maxPrice=400000")
    assert response.status_code == 400
    assert "minPrice cannot exceed maxPrice" in response.json()["detail"]


def test_invalid_negative_price():
    response = client.get("/api/search?minPrice=-100")
    assert response.status_code == 400
    assert "cannot be negative" in response.json()["detail"]

    response = client.get("/api/search?maxPrice=-500")
    assert response.status_code == 400
    assert "cannot be negative" in response.json()["detail"]


def test_invalid_negative_bedrooms():
    response = client.get("/api/search?minBedrooms=-1")
    assert response.status_code == 400
    assert "cannot be negative" in response.json()["detail"]


# -------------------------------------------------------------
# 4. Edge Cases: Pagination Boundaries
# -------------------------------------------------------------
def test_invalid_page_or_page_size():
    # Page size <= 0
    response = client.get("/api/search?pageSize=0")
    assert response.status_code == 400
    assert "Page size must be greater than 0" in response.json()["detail"]

    # Page <= 0
    response = client.get("/api/search?page=0")
    assert response.status_code == 400
    assert "Page must be greater than 0" in response.json()["detail"]


def test_pagination_boundary_out_of_bounds_page():
    # Requesting a page well beyond available data returns empty results without crashing
    response = client.get("/api/search?page=999&pageSize=5")
    assert response.status_code == 200
    data = response.json()
    assert data["results"] == []
    assert data["totalCount"] == 12
    assert data["page"] == 999


def test_pagination_exact_page_slices():
    response_p1 = client.get("/api/search?page=1&pageSize=5")
    response_p2 = client.get("/api/search?page=2&pageSize=5")
    response_p3 = client.get("/api/search?page=3&pageSize=5")

    data_p1 = response_p1.json()
    data_p2 = response_p2.json()
    data_p3 = response_p3.json()

    assert len(data_p1["results"]) == 5
    assert len(data_p2["results"]) == 5
    assert len(data_p3["results"]) == 2
    assert data_p1["totalPages"] == 3


# -------------------------------------------------------------
# 5. Edge Cases: No Matches
# -------------------------------------------------------------
def test_no_matches_nonexistent_city():
    response = client.get("/api/search?city=Atlantis")
    assert response.status_code == 200
    data = response.json()
    assert data["totalCount"] == 0
    assert data["results"] == []
    assert data["totalPages"] == 1


def test_no_matches_overly_strict_filters():
    response = client.get("/api/search?minPrice=900000&maxPrice=1000000")
    assert response.status_code == 200
    data = response.json()
    assert data["totalCount"] == 0
    assert data["results"] == []
