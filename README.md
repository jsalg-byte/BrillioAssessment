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