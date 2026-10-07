# Project Setup & Log

## Step 0 - Project Structure
- Set up `backend` and `frontend` folders inside `/app`.
- Moved `sample_listings.json` into `/app/backend` so the backend service can access it directly.

## Step 1 - Project Initialization
- scaffold and install packages for backend and frontend

## Step 2 - Data Loading & Health Check Route
- Loaded `sample_listings.json` into global scope so we aren't reading file on every request.
- set up hello world to test server runs

NOTE: while doing this i noticed that the user who is committing the changes is `mzootfb`. that is an outdated github account. in the favor of time and not wasting time for the project i am going to keep commiting for now. its a non-issue , just needed to clarify.
I am also not using proper git commit messages like feat, fix, etc i am doing this for clarity and to help explain thought process. 

## Step 3 - Search Endpoint Skeleton & Validation
- Added `/api/search` route with parameters for minPrice, maxPrice, minBedrooms, city, keyword, and targetBudget.
- Added validation so invalid inputs like minPrice > maxPrice or negative values throw 400 errors immediately.
- Added filtering 
- Added the fallback budget logic: if the user doesn't give a targetBudget, we calculate one biased toward the upper range `(((min + max)/2) + max) / 2` when both bounds exist, or use whichever single bound was provided. this is a personal choice based in that as a service we might make more money from higher priced listings. i guess this could be discussed further to see the optimal target budget value if one was not provided. its good to have a hidden value though as a fallback i think

## Step 4 - Relevance Scoring Helper
- the relevenacy score took a while for me to think of...in the end i decided a buyer doesnt care too much about how recently the listing was posted, they care more about the price. given that the target budget value logic is already in place we use that as a 70% weight for this portion of the total score. the remainign 30% was given to the listing date with a 60 day window. falling out that window gives it a 0 score, but with 70% from the budget value i think thats fine. these are some business logic rules that are best done in collaboration or with some AB testing in my experience. listed date also recieves some error handling and if there is an error after attempts to fix it ourself we just give a 0 score to the recency. MLS are notoriously messy with their data and its almost always mismatched from the work i have done.
- tldr : `70% target budget proximity / 30% recency`