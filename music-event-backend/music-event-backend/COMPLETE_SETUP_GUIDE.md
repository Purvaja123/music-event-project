# Complete Setup Guide: Spring Boot + MySQL + React

## 📚 Overview

This guide will help you set up a complete full-stack application with:
- **Backend**: Spring Boot + MySQL (REST API)
- **Frontend**: React (calls backend APIs)

---

## 🎯 Part 1: Backend Setup (Spring Boot)

### Step 1: Install Prerequisites

1. **Java JDK 17+**
   - Download: https://adoptium.net/
   - Verify: `java -version` in terminal

2. **Maven**
   - Download: https://maven.apache.org/download.cgi
   - Verify: `mvn -version` in terminal

3. **MySQL**
   - Download: https://dev.mysql.com/downloads/
   - Install and set root password

### Step 2: Create Database

Open MySQL Command Line or Workbench:

```sql
CREATE DATABASE musicevent_db;
```

### Step 3: Configure Backend

1. Open `music-event-backend` folder in VS Code
2. Edit `src/main/resources/application.properties`
3. Update MySQL password:
   ```properties
   spring.datasource.password=YOUR_PASSWORD_HERE
   ```

### Step 4: Install Dependencies

In terminal (inside `music-event-backend` folder):

```bash
mvn clean install
```

### Step 5: Run Backend

```bash
mvn spring-boot:run
```

**Backend runs on:** `http://localhost:8080`

**Test it:** Open browser → `http://localhost:8080/api/events`
Should see: `[]` (empty array = working!)

---

## 🎨 Part 2: Frontend Setup (React)

### Step 1: Install Axios

In terminal (inside `music-event-frontend` folder):

```bash
npm install axios
```

### Step 2: API Service Already Created

The file `src/services/api.js` is already created with all API calls.

### Step 3: Update Frontend Files

Follow `FRONTEND_API_INTEGRATION.md` to update each page.

**Quick Summary:**
- Replace `getCurrentUser()` → Read from localStorage (already stored)
- Replace `loginUser()` → `authAPI.login()`
- Replace `registerUser()` → `authAPI.register()`
- Replace `getEvents()` → `eventAPI.getUpcomingEvents()`
- Replace `createBooking()` → `bookingAPI.createBooking()`
- And so on...

---

## 🔄 How It Works Now

### Before (localStorage):
```
React Component
    ↓
auth.js (localStorage)
    ↓
Browser Storage
```

### After (Real Backend):
```
React Component
    ↓
api.js (axios)
    ↓
HTTP Request
    ↓
Spring Boot Controller
    ↓
Service Layer
    ↓
Repository (JPA)
    ↓
MySQL Database
    ↓
Response (JSON)
    ↓
React Component Updates
```

---

## 📊 Database Structure

### Tables Created Automatically:

1. **users** - All registered users
2. **events** - All events created by organizers
3. **bookings** - All ticket bookings
4. **contracts** - All contracts between organizers and artists

Spring Boot automatically creates tables from Entity classes!

---

## 🧪 Testing Complete Flow

### 1. Start Backend
```bash
cd music-event-backend
mvn spring-boot:run
```

### 2. Start Frontend (new terminal)
```bash
cd music-event-frontend
npm start
```

### 3. Test Registration
- Go to: http://localhost:3000/register
- Fill form and register
- Check MySQL: `SELECT * FROM users;`

### 4. Test Login
- Login with registered credentials
- Check browser console for API calls
- Check Network tab in DevTools

### 5. Test Event Creation
- Login as Organizer
- Create event
- Check MySQL: `SELECT * FROM events;`

### 6. Test Booking
- Login as User
- Browse events
- Book ticket
- Check MySQL: `SELECT * FROM bookings;`

---

## 🔍 Debugging Tips

### Backend Issues:

1. **Check logs** in VS Code terminal
2. **Verify MySQL connection** in `application.properties`
3. **Check database exists**: `SHOW DATABASES;`
4. **Check tables created**: `USE musicevent_db; SHOW TABLES;`

### Frontend Issues:

1. **Check browser console** for errors
2. **Check Network tab** for API calls
3. **Verify backend is running** on port 8080
4. **Check CORS errors** - backend should allow localhost:3000

### Common Errors:

**CORS Error:**
- Backend: Check `CorsConfig.java` allows `http://localhost:3000`

**401 Unauthorized:**
- Check token is stored: `localStorage.getItem('token')`
- Check token is sent in headers

**404 Not Found:**
- Verify backend is running
- Check API URL in `api.js` is correct

**500 Server Error:**
- Check backend logs
- Verify database connection
- Check entity relationships

---

## 📝 Key Differences: localStorage vs Backend

| Feature | localStorage | Spring Boot + MySQL |
|----------|-------------|---------------------|
| **Storage** | Browser only | MySQL database |
| **Persistence** | Per browser | Shared across all users |
| **Security** | None | Password hashing, JWT tokens |
| **Scalability** | Single user | Multiple users |
| **Data Sharing** | No | Yes - all users see same data |
| **Backup** | No | Yes - database backup |
| **Production Ready** | No | Yes |

---

## 🎓 Learning Path

### Understanding the Backend:

1. **Entity Classes** (`entity/`)
   - Represent database tables
   - Each field = column

2. **Repository Interfaces** (`repository/`)
   - Spring Data JPA creates queries automatically
   - Methods like `findByEmail()` create SQL queries

3. **Service Classes** (`service/`)
   - Business logic
   - Validation, calculations
   - Calls repositories

4. **Controller Classes** (`controller/`)
   - REST API endpoints
   - Receives HTTP requests
   - Returns JSON responses

### Understanding the Frontend:

1. **API Service** (`services/api.js`)
   - Centralized API calls
   - Handles authentication tokens
   - Error handling

2. **Component Updates**
   - Replace localStorage calls with API calls
   - Handle async operations (async/await)
   - Update state with API responses

---

## ✅ Checklist

- [ ] MySQL installed and running
- [ ] Database `musicevent_db` created
- [ ] Backend `application.properties` configured
- [ ] Backend runs successfully (`mvn spring-boot:run`)
- [ ] Can access `http://localhost:8080/api/events`
- [ ] Frontend has `axios` installed
- [ ] Frontend `api.js` file created
- [ ] Frontend pages updated to use APIs
- [ ] Test registration works
- [ ] Test login works
- [ ] Test event creation works
- [ ] Test booking works

---

## 🚀 Next Steps

1. **Add JWT Filter** - Validate tokens on protected endpoints
2. **Add Error Handling** - Better error messages
3. **Add Validation** - Input validation on both sides
4. **Add Pagination** - For large lists
5. **Add Search** - Search events, artists, etc.
6. **Deploy** - Deploy to cloud (AWS, Heroku, etc.)

---

## 📚 Additional Resources

- **Spring Boot Docs**: https://spring.io/projects/spring-boot
- **Spring Data JPA**: https://spring.io/projects/spring-data-jpa
- **React Axios**: https://axios-http.com/docs/intro
- **MySQL Docs**: https://dev.mysql.com/doc/

---

Good luck with your full-stack journey! 🎉







