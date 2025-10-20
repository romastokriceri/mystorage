# MyStorage / Мій Чулан

A web service for managing items stored in boxes, built with React, FastAPI, and PostgreSQL.

## Project Structure
```
mystorage/
├── frontend/                # React frontend
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── index.js       # React entry point
│   │   ├── index.css      # Tailwind CSS
│   │   └── ...
│   ├── package.json
│   ├── tailwind.config.js
│   ├── Dockerfile
│   └── public/
├── backend/                # FastAPI backend
│   ├── main.py            # API endpoints
│   ├── models.py          # SQLAlchemy models
│   ├── database.py        # Database configuration
│   ├── requirements.txt
│   └── Dockerfile
├── database/               # Database initialization
│   └── init.sql           # SQL schema and sample data
├── media/items/           # Storage for item photos
├── docker-compose.yml     # Docker Compose configuration
└── .env                   # Environment variables
```

## Prerequisites
- Docker and Docker Compose
- Node.js (for local frontend development)
- Python 3.11 (for local backend development)

## Setup Instructions

1. **Clone the repository** (if applicable):
   ```bash
   git clone <repository-url>
   cd mystorage
   ```

2. **Set up environment variables**:
   Ensure `.env` file exists with:
   ```env
   POSTGRES_DB=mydb
   POSTGRES_USER=myuser
   POSTGRES_PASSWORD=mypassword
   ```

3. **Run with Docker Compose**:
   ```bash
   docker-compose up --build
   ```
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:8000`
   - API Docs: `http://localhost:8000/docs`
   - Database: `localhost:5432`

4. **Local Development (without Docker)**:
   - **Backend**:
     ```bash
     cd backend
     python -m venv venv
     source venv/bin/activate  # On Windows: venv\Scripts\activate
     pip install -r requirements.txt
     uvicorn main:app --host 0.0.0.0 --port 8000
     ```
   - **Frontend**:
     ```bash
     cd frontend
     npm install
     npm start
     ```
   - **Database**:
     Ensure PostgreSQL is running and initialize with `database/init.sql`.

## Usage
1. Register or log in at `http://localhost:3000`.
2. Create and manage boxes and items.
3. Upload photos for items (stored in `media/items/`).
4. Use the search feature to filter items by name or category.

## Notes
- The backend uses JWT for authentication.
- Photos are stored locally in `media/items/`. For production, consider using Cloudinary.
- The database is initialized with sample data (3 users, 5 boxes, 15 items).
- Replace `your-secret-key` in `backend/main.py` with a secure key for production.

## Troubleshooting
- Ensure ports 3000, 8000, and 5432 are free.
- Check Docker logs for errors: `docker-compose logs`.
- Verify `.env` variables match `docker-compose.yml` and `database.py`.
