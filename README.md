# Project Setup & Log

## Step 0 - Project Structure
- Set up `backend` and `frontend` folders inside `/app`.
- Moved `sample_listings.json` into `/app/backend` so the backend service can access it directly.

## Step 1 - Project Initialization
- scaffold and install packages for backend and frontend

## Step 2 - Data Loading & Health Check Route
- Loaded `sample_listings.json' into global scope so we aren't reading file on every request.
- set up hello world to test server runs

NOTE: while doing this i noticed that the user who is committing the changes is `mzootfb`. that is an outdated github account. in the favor of time and not wasting time for the project i am going to keep commiting for now. its a non-issue , just needed to clarify.
I am also not using proper git commit messages like feat, fix, etc i am doing this for clarity and to help explain thought process. 

## Step 3 - Search Endpoint Skeleton & Validation
- Added `/api/search` route with parameters for minPrice, maxPrice, minBedrooms, city, keyword, and targetBudget.
- Added validation so invalid inputs like minPrice > maxPrice or negative values throw 400 errors immediately.
- Added filtering 
- Added the fallback budget logic: if the user doesn't give a targetBudget, we calculate one biased toward the upper range `(((min + max)/2) + max) / 2` when both bounds exist, or use whichever single bound was provided. this is a personal choice based in that as a service we might make more money from higher priced listings. i guess this could be discussed further to see the optimal target budget value if one was not provided. its good to have a hidden value though as a fallback i think