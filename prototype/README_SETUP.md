# Quick Setup Guide

## Option 1: Use the Batch File (Easiest)

1. **Double-click** `START.bat` in the prototype folder
2. Wait for dependencies to install
3. The server will start automatically
4. Open **http://localhost:3000** in your browser

## Option 2: Manual Setup

### Step 1: Open Command Prompt (not PowerShell)
- Press `Win + R`
- Type `cmd` and press Enter
- Navigate to the prototype folder:
```cmd
cd C:\Users\yanad\homebuyers-compass-platform\prototype
```

### Step 2: Install Dependencies
```cmd
npm install
```

### Step 3: Start the Server
```cmd
npm run dev
```

### Step 4: Open Browser
Go to: **http://localhost:3000**

## If You Get Errors

### "npm is not recognized"
- Install Node.js from https://nodejs.org/
- Restart your computer after installation
- Try again

### "Port 3000 already in use"
- Use a different port: `npm run dev -- -p 3001`
- Or stop the process using port 3000

### Files Missing
- Make sure you're in the correct folder:
  `C:\Users\yanad\homebuyers-compass-platform\prototype`
- Check that all files are present

## What You'll See

Once running, you can access:
- **Landing Page**: http://localhost:3000
- **Homebuyer Dashboard**: http://localhost:3000/homebuyer
- **Professional Dashboard**: http://localhost:3000/professional  
- **Marketplace**: http://localhost:3000/marketplace

Try the **Compass Copilot** by clicking the "Copilot" button!

