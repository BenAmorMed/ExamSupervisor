# Exam Surveillance Management Application

A web application for automating the management of exam surveillance tasks within a university's examination service.

## 🚀 Quick Start

### Option 1: Using Batch Files (Recommended)

Simply double-click the batch files in the project root:

1. **Start Frontend**: Double-click `frontend.bat`
2. **Start Backend**: Double-click `backend.bat` (requires MySQL - see below)

### Option 2: Manual Start

**Frontend:**
```bash
cd "projet CL\frontend"
npm run dev
```

**Backend:**
```bash
cd "projet CL\projet"
mvn spring-boot:run
```

## 📋 Prerequisites

### Frontend Requirements
- ✅ Node.js (v16 or higher)
- ✅ npm

### Backend Requirements
- ✅ Java 21
- ✅ Apache Maven
- ⚠️ **MySQL Server** (localhost:3306)

## 🗄️ Database Setup

The backend requires a MySQL database to run. Follow these steps:

### 1. Install MySQL

Download and install MySQL Community Server:
- https://dev.mysql.com/downloads/mysql/

### 2. Create Database

Open MySQL command line or MySQL Workbench and run:

```sql
CREATE DATABASE fsegs;
```

### 3. Database Configuration

The application is configured with these default settings in `application.properties`:

- **Host**: localhost:3306
- **Database**: fsegs
- **Username**: root
- **Password**: (empty)

If your MySQL has a different configuration, update `projet CL\projet\src\main\resources\application.properties`

## 🌐 Access URLs

Once both servers are running:

- **Frontend**: http://localhost:5174 (or 5173)
- **Backend API**: http://localhost:8081

## 📁 Project Structure

```
projet CL/
├── frontend.bat              # Frontend starter script
├── backend.bat               # Backend starter script
├── frontend/                 # React/Vite frontend
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── projet CL/
    └── projet/               # Spring Boot backend
        ├── src/
        ├── pom.xml
        └── application.properties
```

## 🛠️ Troubleshooting

### Backend won't start

1. **Check MySQL is running**:
   ```bash
   # Windows: Check if MySQL service is running
   sc query MySQL80  # or your MySQL service name
   ```

2. **Verify database exists**:
   ```sql
   SHOW DATABASES;
   ```

3. **Check credentials** in `application.properties`

### Frontend port conflict

If port 5173 is in use, Vite will automatically use the next available port (5174, 5175, etc.)

## 📚 Technologies Used

### Frontend
- React
- Vite
- TailwindCSS
- Modern ES6+

### Backend
- Spring Boot 3.5.8
- Spring Data JPA
- MySQL
- Lombok
- Maven

## 👥 Development

This application is designed to help university examination services manage:
- Teacher preferences for surveillance sessions
- Supervisor assignment to exam sessions
- Data security and user-friendly interfaces
- Streamlined workflows replacing Excel/Access-based systems

---

**Need Help?** Check the `walkthrough.md` in the brain artifacts folder for detailed setup information.
