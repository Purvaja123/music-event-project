# Reset MySQL Root Password - Step by Step

## 🎯 You Need to Reset Your MySQL Password

Since you can't login, we'll reset it. Follow these steps **carefully**.

---

## 📋 Step-by-Step Instructions

### Step 1: Stop MySQL Service

**Option A: Using Services (Easiest)**
1. Press `Windows Key + R`
2. Type: `services.msc`
3. Press Enter
4. Find **"MySQL80"** (or "MySQL" or "MySQL Server 8.0")
5. **Right-click** on it
6. Click **"Stop"**
7. Wait until it says "Stopped"

**Option B: Using Command Prompt (Run as Administrator)**
1. Right-click on Start button
2. Click "Windows PowerShell (Admin)" or "Command Prompt (Admin)"
3. Type:
   ```bash
   net stop MySQL80
   ```
4. Press Enter
5. Wait for "The MySQL80 service was stopped successfully"

---

### Step 2: Start MySQL in Safe Mode

**Important:** Keep this window open!

1. Open **Command Prompt as Administrator** (new window)
2. Navigate to MySQL bin folder:
   ```bash
   cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
   ```
   
   **If that path doesn't work, try:**
   ```bash
   cd "C:\Program Files (x86)\MySQL\MySQL Server 8.0\bin"
   ```
   
   **Or find your MySQL installation:**
   ```bash
   dir "C:\Program Files\MySQL" /s /b | findstr "mysqld.exe"
   ```

3. Start MySQL in safe mode:
   ```bash
   mysqld --console --skip-grant-tables --shared-memory
   ```

4. **Keep this window open!** You should see MySQL starting up.

---

### Step 3: Open New Command Prompt (As Administrator)

**Open a NEW Command Prompt window** (keep the safe mode one running)

1. Right-click Start → "Command Prompt (Admin)" or "PowerShell (Admin)"
2. Navigate to MySQL bin:
   ```bash
   cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
   ```
3. Connect without password:
   ```bash
   mysql -u root
   ```
   
   You should see: `mysql>`

---

### Step 4: Reset the Password

In the MySQL prompt (`mysql>`), type these commands **one by one**:

```sql
USE mysql;
```

Press Enter, then:

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
```

Press Enter, then:

```sql
FLUSH PRIVILEGES;
```

Press Enter, then:

```sql
EXIT;
```

Press Enter.

---

### Step 5: Stop Safe Mode and Restart MySQL

1. Go back to the **safe mode window** (Step 2)
2. Press `Ctrl + C` to stop it
3. Close that window

4. **Start MySQL normally:**
   - Go to Services (`services.msc`)
   - Find "MySQL80"
   - Right-click → **Start**

   **OR** in Command Prompt (Admin):
   ```bash
   net start MySQL80
   ```

---

### Step 6: Test New Password

Try logging in with the new password:

```bash
mysql -u root -p
```

When prompted, enter: `root`

You should now be logged in! ✅

---

## ✅ Update application.properties

Now update your Spring Boot config:

**File:** `src/main/resources/application.properties`

Change this line:
```properties
spring.datasource.password=your_password_here
```

To:
```properties
spring.datasource.password=root
```

---

## 🆘 Troubleshooting

### Issue: "mysqld is not recognized"
**Solution:** You're not in the correct folder. Find MySQL installation:
```bash
dir "C:\Program Files" /s /b | findstr "mysqld.exe"
```

### Issue: "Access denied" in safe mode
**Solution:** Make sure you're using `mysql -u root` (no `-p` flag) in Step 3

### Issue: MySQL won't start in safe mode
**Solution:** 
1. Make sure MySQL service is stopped
2. Check if port 3306 is free
3. Try: `mysqld --skip-grant-tables` (without --shared-memory)

### Issue: Can't find MySQL folder
**Solution:** MySQL might be installed in a different location. Search for it:
```bash
dir C:\ /s /b | findstr "mysqld.exe"
```

---

## 🎯 Quick Summary

1. Stop MySQL service
2. Start MySQL in safe mode (keep window open)
3. Open new terminal → `mysql -u root`
4. Run: `ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';`
5. Run: `FLUSH PRIVILEGES;`
6. Exit and restart MySQL normally
7. Test: `mysql -u root -p` (password: `root`)
8. Update `application.properties` with password: `root`

---

Good luck! 🚀




