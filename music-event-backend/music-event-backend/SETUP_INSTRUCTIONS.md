# Spring Boot Backend Setup Instructions

## 📋 Prerequisites

1. **Java JDK 17+** - Download from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://adoptium.net/)
2. **Maven** - Download from [Apache Maven](https://maven.apache.org/download.cgi)
3. **MySQL** - Download from [MySQL](https://dev.mysql.com/downloads/)
4. **VS Code** with extensions:
   - Extension Pack for Java
   - Spring Boot Extension Pack
   - MySQL

---

## 🚀 Step-by-Step Setup

### Step 1: Install MySQL

1. Download and install MySQL
2. During installation, set root password (remember this!)
3. Start MySQL service

### Step 2: Create Database

Open MySQL Command Line or MySQL Workbench and run:

```sql
CREATE DATABASE musicevent_db;
```

### Step 3: Configure Database Connection

Edit `src/main/resources/application.properties`:

```properties
spring.datasource.password=YOUR_MYSQL_PASSWORD
```

Replace `YOUR_MYSQL_PASSWORD` with your MySQL root password.

### Step 4: Open Project in VS Code

1. Open VS Code
2. File → Open Folder → Select `music-event-backend` folder
3. VS Code will detect it's a Java project

### Step 5: Install Dependencies

Open terminal in VS Code and run:

```bash
mvn clean install
```

This downloads all dependencies from `pom.xml`.

### Step 6: Run the Application

**Option 1: Using Maven**
```bash
mvn spring-boot:run
```

**Option 2: Using VS Code**
- Press `F5` or click "Run" button
- Select "Java" as environment

**Option 3: Using Terminal**
```bash
mvn spring-boot:run
```

### Step 7: Verify Backend is Running

Open browser and go to: `http://localhost:8080/api/events`

You should see `[]` (empty array) - this means backend is working!

---

## 🧪 Testing APIs

### Using Postman or Browser

1. **Test Registration:**
   - URL: `POST http://localhost:8080/api/auth/register`
   - Body (JSON):
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "password123",
     "role": "USER"
   }
   ```

2. **Test Login:**
   - URL: `POST http://localhost:8080/api/auth/login`
   - Body (JSON):
   ```json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```

3. **Test Get Events:**
   - URL: `GET http://localhost:8080/api/events/upcoming`

---

## 🔧 Troubleshooting

### Issue: Port 8080 already in use
**Solution:** Change port in `application.properties`:
```properties
server.port=8081
```

### Issue: Cannot connect to MySQL
**Solution:** 
1. Check MySQL is running
2. Verify password in `application.properties`
3. Check MySQL port (default: 3306)

### Issue: Maven not found
**Solution:**
1. Install Maven
2. Add to PATH environment variable
3. Restart VS Code

### Issue: Java not found
**Solution:**
1. Install JDK 17+
2. Set JAVA_HOME environment variable
3. Restart VS Code

---

## 📁 Project Structure Explained

```
music-event-backend/
├── pom.xml                    # Maven dependencies
├── src/
│   └── main/
│       ├── java/
│       │   └── com/musicevent/
│       │       ├── MusicEventApplication.java  # Main class
│       │       ├── entity/                     # Database tables (User, Event, etc.)
│       │       ├── repository/                 # Database queries
│       │       ├── service/                     # Business logic
│       │       ├── controller/                  # REST API endpoints
│       │       ├── dto/                         # Data transfer objects
│       │       ├── config/                      # Configuration
│       │       └── security/                    # JWT authentication
│       └── resources/
│           ├── application.properties          # Database config
│           └── schema.sql                      # Database schema
```

---

## 🔑 Key Concepts

### Entity = Database Table
- `User.java` = `users` table
- `Event.java` = `events` table
- Each field = column in database

### Repository = Database Queries
- `UserRepository` = queries for users table
- Spring Data JPA automatically creates queries

### Service = Business Logic
- Contains validation, calculations
- Calls repositories to save/read data

### Controller = REST API
- Receives HTTP requests
- Calls services
- Returns JSON responses

---

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Events
- `GET /api/events` - Get all events
- `GET /api/events/upcoming` - Get upcoming events
- `GET /api/events/{id}` - Get event by ID
- `POST /api/events` - Create event
- `PUT /api/events/{id}` - Update event
- `DELETE /api/events/{id}` - Delete event

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/user/{userId}` - Get user bookings
- `GET /api/bookings/event/{eventId}` - Get event bookings

### Contracts
- `POST /api/contracts` - Create contract
- `GET /api/contracts/artist/{artistId}` - Get artist contracts
- `GET /api/contracts/organizer/{organizerId}` - Get organizer contracts
- `PUT /api/contracts/{id}/status` - Update contract status

### Users
- `GET /api/users/artists` - Get all artists
- `GET /api/users/organizers` - Get all organizers

---

## 🔐 Security Notes

Currently, security is simplified. For production:
1. Add JWT filter to validate tokens
2. Add role-based access control
3. Hash passwords (already done with BCrypt)
4. Add rate limiting
5. Add input validation

---

## 📝 Next Steps

1. ✅ Backend is running
2. ✅ Test APIs with Postman
3. ✅ Update frontend to use APIs (see FRONTEND_API_INTEGRATION.md)
4. ✅ Test complete flow

---

## 🆘 Need Help?

1. Check console for error messages
2. Verify MySQL is running
3. Check database connection in `application.properties`
4. Ensure all dependencies are installed (`mvn clean install`)

Good luck! 🚀







