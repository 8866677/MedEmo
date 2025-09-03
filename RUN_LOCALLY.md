# 🚑 MedEmo - Run Locally

## Quick Start (Recommended)

### Option 1: Simple Demo (No Installation Required)
1. **Open the demo file**: Double-click `demo.html` in your file explorer
2. **View in browser**: It will open in your default web browser
3. **Interact**: Click the emergency buttons and explore the features

This gives you a working preview of the MedEmo app without any setup!

## Full Application Setup

### Prerequisites
- Node.js (v16 or higher) ✅ You have v22.14.0
- npm (v8 or higher) ✅ You have v10.9.2
- MongoDB (optional for full backend)

### Step 1: Install Dependencies
```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install --legacy-peer-deps
cd ..
```

### Step 2: Environment Setup
1. **Copy environment file**:
   ```bash
   copy server\env.example server\.env
   ```

2. **Edit `.env` file** with your configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/medemo
   JWT_SECRET=your-secret-key
   ```

### Step 3: Start the Application

#### Start Backend (Server)
```bash
# In the root directory
npm run dev
```
This starts the backend server on port 5000

#### Start Frontend (Client)
```bash
# In a new terminal, go to client directory
cd client
npm start
```
This starts the React app on port 3000

### Step 4: Access the App
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Documentation**: http://localhost:5000/api/docs

## Alternative: Use the Demo File

If you encounter dependency issues, use the `demo.html` file:

1. **Navigate to the medemo folder**
2. **Double-click `demo.html`**
3. **View in your browser**

This gives you a fully functional demo with:
- ✅ Emergency alert system
- ✅ Hospital locator
- ✅ Blood bank alerts
- ✅ Doctor consultation
- ✅ AI triage system
- ✅ Emergency contacts
- ✅ Professional healthcare UI

## Troubleshooting

### Common Issues:
1. **Port already in use**: Change ports in `.env` file
2. **MongoDB connection**: Install MongoDB or use MongoDB Atlas
3. **Dependency conflicts**: Use `--legacy-peer-deps` flag

### Quick Fix Commands:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
Remove-Item -Recurse -Force node_modules
npm install
```

## Features Available in Demo

- 🚨 **Emergency Alert System**
- 🏥 **Hospital Locator**
- 🩸 **Blood Bank Management**
- 👨‍⚕️ **Doctor Consultation**
- 🤖 **AI Triage System**
- 📱 **Emergency Contacts**
- 🚑 **Ambulance Tracking**
- 📍 **GPS Location Services**

## Next Steps

1. **Try the demo first** - `demo.html`
2. **Set up full backend** if you want database functionality
3. **Customize features** for your specific needs
4. **Deploy to production** using the instructions in README.md

---

**Need help?** Check the main README.md for detailed documentation and API references.
