# 🗄️ MyStorage

A **web service for managing items stored in boxes**.  
Built with **React**, **FastAPI**, and **PostgreSQL**.  

---

## 📋 Table of Contents
- [Project Structure](#-project-structure)
- [Technologies](#-technologies)
- [Quick Start](#-quick-start)
- [Environment Setup](#-environment-setup)
- [Run in Docker](#-run-in-docker)
- [Local Development](#-local-development)
- [Server Deployment](#-server-deployment)
- [API Documentation](#-api-documentation)
- [Troubleshooting](#-troubleshooting)
- [Usage](#-usage)

---

## 📁 Project Structure
```

mystorage/
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   │   └── index.html
│   ├── Dockerfile
│   ├── Dockerfile.prod
│   └── package.json
│
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   ├── requirements.txt
│   └── Dockerfile
│
├── nginx/
│   ├── nginx.conf
│   ├── Dockerfile
│   └── ssl/
│
├── database/
│   └── init.sql
│
├── media/
├── docker-compose.yml
├── .env.example
└── README.md

````

---

## 🛠️ Technologies

### **Frontend**
- ⚛️ React 18 – UI framework  
- 🎨 Tailwind CSS (CDN) – Styling  
- 🌐 Axios – HTTP client  
- 🧩 Lucide React – Icons  

### **Backend**
- ⚡ FastAPI – Web framework (Python)  
- 🧱 SQLAlchemy – ORM  
- 🐘 PostgreSQL 15 – Database  
- 🔐 JWT – Authentication  
- 🚀 Uvicorn – ASGI server  

### **DevOps**
- 🐳 Docker & Docker Compose – Containerization  
- 🌍 Nginx – Reverse proxy  
- 🧾 Git – Version control  

---

## 🚀 Quick Start

### **Requirements**
- Docker ≥ 20.10  
- Docker Compose ≥ 1.29  
- Git  

### **1. Clone repository**
```bash
git clone https://github.com/your-username/mystorage.git
cd mystorage
````

### **2. Configure environment**

```bash
cp .env.example .env
openssl rand -base64 32  # POSTGRES_PASSWORD
openssl rand -base64 64  # SECRET_KEY
nano .env
```

### **3. Launch**

```bash
docker-compose up --build -d
docker-compose ps
docker-compose logs -f
```

### **4. Access**

* 🌐 **App:** [http://localhost](http://localhost)
* 📘 **API Docs:** [http://localhost/docs](http://localhost/docs)
* ⚙️ **Backend:** [http://localhost/api](http://localhost/api)

---

## ⚙️ Environment Setup

Example `.env`:

```env
# Database
POSTGRES_PASSWORD=your_generated_password_here
POSTGRES_USER=mystorage_user
POSTGRES_DB=mystorage_db

# Backend
DATABASE_URL=postgresql://mystorage_user:your_generated_password_here@db:5432/mystorage_db
SECRET_KEY=your_generated_secret_key_min_64_chars
ENVIRONMENT=production

# CORS
CORS_ORIGINS=https://yourdomain.com
```

> ⚠️ **Never commit `.env` files to Git!**

---

## 🐳 Run in Docker

### **Development**

```bash
docker-compose up
docker-compose up -d
docker-compose restart backend
docker-compose logs -f frontend
```

### **Production**

```bash
docker-compose build --no-cache
docker-compose up -d
docker-compose ps
```

### **Useful Commands**

```bash
docker-compose down
docker-compose down -v
docker-compose build --no-cache frontend
docker exec -it mystorage_backend bash
docker exec -it mystorage_frontend sh
docker stats
```

---

## 💻 Local Development

### **Backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### **Frontend**

```bash
cd frontend
npm install
npm start
```

### **Database**

```bash
docker-compose up db -d
docker exec -it mystorage_db psql -U mystorage_user -d mystorage_db
docker exec -i mystorage_db psql -U mystorage_user -d mystorage_db < database/init.sql
```

---

## 🌐 Server Deployment

### **1. Install dependencies**

```bash
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo apt install docker-compose-plugin
exit
```

### **2. Clone and configure**

```bash
git clone https://github.com/your-username/mystorage.git
cd mystorage
cp .env.example .env
nano .env
chmod 600 .env
mkdir -p media uploads
```

### **3. Firewall**

```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### **4. Start**

```bash
docker-compose up --build -d
docker-compose logs -f
docker-compose ps
```

### **5. SSL (optional)**

```bash
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/
docker-compose restart nginx
```

---

## 📚 API Documentation

📄 **Swagger UI:** [http://localhost/docs](http://localhost/docs)

### **Auth**

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Register new user |
| POST   | `/api/auth/login`    | Login and get JWT |
| GET    | `/api/auth/me`       | Get current user  |

### **Boxes**

| Method | Endpoint          | Description      |
| ------ | ----------------- | ---------------- |
| GET    | `/api/boxes`      | List all boxes   |
| GET    | `/api/boxes/{id}` | Get box details  |
| POST   | `/api/boxes`      | Create a new box |
| PUT    | `/api/boxes/{id}` | Update box       |
| DELETE | `/api/boxes/{id}` | Delete box       |

### **Items**

| Method | Endpoint          | Description              |
| ------ | ----------------- | ------------------------ |
| GET    | `/api/items`      | List items               |
| POST   | `/api/items`      | Create item (with image) |
| PUT    | `/api/items/{id}` | Update item              |
| DELETE | `/api/items/{id}` | Delete item              |

---

## 🔧 Troubleshooting

### **Frontend not loading**

```bash
docker-compose logs frontend
docker-compose ps
docker-compose build --no-cache frontend
docker-compose up -d frontend
```

### **Backend error: “Could not import module 'main'”**

```bash
ls -la backend/main.py
docker-compose logs backend
docker exec -it mystorage_backend ls -la /app/
```

### **Database connection issue**

```bash
docker-compose logs db
docker exec mystorage_backend env | grep DATABASE
docker exec -it mystorage_db psql -U mystorage_user -d mystorage_db
```

### **Nginx 502 Bad Gateway**

```bash
docker-compose ps backend
docker exec -it mystorage_nginx nginx -t
docker-compose logs nginx
docker-compose restart nginx
```

### **Reset project**

```bash
docker-compose down -v
docker rmi mystorage_frontend mystorage_backend mystorage_nginx
docker system prune -a
docker-compose up --build
```

---

## 📝 Usage

### **1. Register**

1. Open [http://localhost](http://localhost)
2. Click **Register**
3. Fill in the form

### **2. Create a box**

1. Log in
2. Click **Add Box**
3. Enter name, description, and location

### **3. Add items**

1. Open the box
2. Click **Add Item**
3. Fill in the details (optional: add photo)

### **4. Search**

Use the search bar to filter items by name or category.
