# Reset MySQL Password - Exact Steps

## ⚠️ Error You're Getting
`ERROR 2003: Can't connect to MySQL server`

**This means MySQL is not running!** You need to start it in safe mode first.

---

## ✅ Correct Steps (Do This)

### Step 1: Make Sure MySQL Service is Stopped

1. Press `Windows Key + R`
2. Type: `services.msc`
3. Press Enter
4. Find **"MySQL80"**
5. If it says "Running" → Right-click → **Stop**
6. Wait until it says "Stopped"

---

### Step 2: Start MySQL in Safe Mode

**Open Command Prompt as Administrator** (Right-click → Run as Administrator)

Type these commands **one by one**:

```bash
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
```

Press Enter, then:

```bash
mysqld --console --skip-grant-tables --shared-memory
```

Press Enter.

**IMPORTANT:** 
- You should see MySQL starting up (lots of text scrolling)
- **KEEP THIS WINDOW OPEN!**
- Don't close it!

You should see something like:
```
[Note] mysqld: ready for connections.
```

---

### Step 3: Open NEW Command Prompt (As Administrator)

**Open a BRAND NEW Command Prompt window** (keep the safe mode one running!)

In the NEW window:

```bash
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
```

Press Enter, then:

```bash
mysql -u root
```

Press Enter.

**Now you should see:** `mysql>`

If you see `mysql>`, you're connected! ✅

---

### Step 4: Reset Password

In the `mysql>` prompt, type these commands **one by one**:

```sql
USE mysql;
```

Press Enter.

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'root';
```

Press Enter.

```sql
FLUSH PRIVILEGES;
```

Press Enter.

```sql
EXIT;
```

Press Enter.

---

### Step 5: Stop Safe Mode and Restart MySQL

1. Go back to the **safe mode window** (Step 2)
2. Press `Ctrl + C` to stop MySQL
3. Close that window

4. **Start MySQL Service:**
   - Go to Services (`services.msc`)
   - Find "MySQL80"
   - Right-click → **Start**

---

### Step 6: Test New Password

```bash
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
mysql -u root -p
```

When prompted, enter: `root`

You should be logged in! ✅

---

## 🎯 Visual Guide

```
Window 1 (Safe Mode):
┌─────────────────────────────┐
│ mysqld --skip-grant-tables  │ ← Keep this running!
│ [MySQL starting...]          │
└─────────────────────────────┘

Window 2 (Reset Password):
┌─────────────────────────────┐
│ mysql -u root                │ ← Connect here
│ mysql> USE mysql;            │
│ mysql> ALTER USER...         │
│ mysql> FLUSH PRIVILEGES;     │
│ mysql> EXIT;                 │
└─────────────────────────────┘
```

---

## 🆘 If Step 2 Doesn't Work

If `mysqld` command doesn't work, try:

```bash
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysqld.exe" --console --skip-grant-tables --shared-memory
```

Or find where MySQL is installed:

```bash
dir "C:\Program Files" /s /b | findstr "mysqld.exe"
```

---

## ✅ After Success

1. Update `application.properties`:
   ```properties
   spring.datasource.password=root
   ```

2. Run Spring Boot:
   ```bash
   mvn spring-boot:run
   ```

Good luck! 🚀




