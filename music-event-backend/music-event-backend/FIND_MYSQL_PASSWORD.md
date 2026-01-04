# How to Find or Reset MySQL Root Password

## 🔍 Method 1: Check if You Remember It

Try these common default passwords:
- `root` (most common)
- `password`
- `admin`
- `123456`
- Empty password (just press Enter)

---

## 🔍 Method 2: Check MySQL Configuration File

### Windows:
1. Open File Explorer
2. Go to: `C:\ProgramData\MySQL\MySQL Server 8.0\` (or your MySQL version)
3. Look for `my.ini` or `my.cnf` file
4. Open it in Notepad
5. Look for `[client]` section - password might be there

**Note:** Usually passwords are NOT stored in plain text for security.

---

## 🔍 Method 3: Check if Password is Stored in Windows Credential Manager

1. Press `Windows Key + R`
2. Type: `control /name Microsoft.CredentialManager`
3. Press Enter
4. Click "Windows Credentials"
5. Look for entries starting with "MySQL" or "localhost"
6. Click on it and click "Show" to reveal password

---

## 🔍 Method 4: Try to Connect Without Password

Open Command Prompt and try:

```bash
mysql -u root -p
```

When prompted for password, just press **Enter** (empty password).

If that doesn't work, try:
```bash
mysql -u root
```

---

## 🔧 Method 5: Reset MySQL Root Password (If You Forgot)

### Step 1: Stop MySQL Service

**Option A: Using Services**
1. Press `Windows Key + R`
2. Type: `services.msc`
3. Press Enter
4. Find "MySQL80" (or your MySQL version)
5. Right-click → Stop

**Option B: Using Command Prompt (Run as Administrator)**
```bash
net stop MySQL80
```

### Step 2: Start MySQL in Safe Mode

Open Command Prompt as Administrator and run:

```bash
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
mysqld --console --skip-grant-tables --shared-memory
```

**Keep this window open!**

### Step 3: Open New Command Prompt (As Administrator)

```bash
cd "C:\Program Files\MySQL\MySQL Server 8.0\bin"
mysql -u root
```

You should be logged in without password.

### Step 4: Reset Password

In MySQL prompt, run these commands:

```sql
USE mysql;
UPDATE user SET authentication_string=PASSWORD('newpassword') WHERE User='root';
FLUSH PRIVILEGES;
EXIT;
```

**For MySQL 8.0+, use this instead:**

```sql
USE mysql;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';
FLUSH PRIVILEGES;
EXIT;
```

Replace `newpassword` with your desired password.

### Step 5: Restart MySQL Service

1. Close the safe mode window (Ctrl+C)
2. Start MySQL service normally:
   ```bash
   net start MySQL80
   ```

### Step 6: Test New Password

```bash
mysql -u root -p
```

Enter your new password when prompted.

---

## 🎯 Quick Solution: Set a New Simple Password

If you just want to get started quickly:

1. Follow **Method 5** above
2. Set password to: `root` (simple and easy to remember)
3. Update `application.properties`:
   ```properties
   spring.datasource.password=root
   ```

---

## ✅ Verify Password Works

After setting/resetting password, test it:

```bash
mysql -u root -p
```

Enter your password. If you can login, the password is correct!

---

## 📝 Update application.properties

Once you know your password, update:

**File:** `src/main/resources/application.properties`

```properties
spring.datasource.password=YOUR_ACTUAL_PASSWORD_HERE
```

---

## 🆘 Still Can't Find It?

**Option 1: Reinstall MySQL**
- Uninstall MySQL
- Reinstall and set a password you'll remember
- Write it down!

**Option 2: Use MySQL Workbench**
- Install MySQL Workbench
- Try to connect with different passwords
- It might show saved passwords

**Option 3: Check Installation Notes**
- Look for any text files created during MySQL installation
- Sometimes password is saved there

---

## 💡 Pro Tip

**After you find/set your password:**
1. Write it down in a safe place
2. Or use a password manager
3. Update `application.properties` immediately

---

## 🎯 Recommended: Set Simple Password for Development

For development/testing, you can use a simple password like:
- `root`
- `password`
- `admin123`

**Just remember:** Use strong passwords for production!

---

Good luck! 🚀




