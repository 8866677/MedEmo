# 🚑 MedEmo - Emergency Healthcare Response Platform

**MedEmo** is a comprehensive, production-ready emergency healthcare response application designed to provide instant emergency assistance, real-time tracking, and AI-powered healthcare services. Built with modern technologies and a focus on social impact, MedEmo is ready for deployment in healthcare institutions and emergency response systems.

## ✨ Features

### 🚨 Emergency Response
- **Instant Ambulance Alert** with live GPS location sharing
- **Real-time Emergency Tracking** with status updates
- **Emergency Contact Auto-notification** system
- **Multi-language Support** with instant translation
- **Push Notifications** for alerts and updates

### 🏥 Healthcare Services
- **Nearest Hospital Locator** with directions and real-time availability
- **Instant Blood Bank Alert** with donor and stock details
- **Doctor Consultation** via chat/video calls
- **AI Triage System** to analyze symptoms and suggest urgency
- **Emergency Medicine Delivery** request system

### 🧠 AI & Analytics
- **Predictive Emergency Health Alerts** using stored health data
- **AI-powered Symptom Analysis** and triage recommendations
- **Real-time Health Monitoring** and predictive analytics
- **Emergency Response Optimization** algorithms

### 📱 User Experience
- **Modern Responsive UI** with healthcare theme (blue, green, white)
- **Offline Emergency Guides** for rural areas
- **Wearable Integration** for real-time vitals
- **Emergency Video Tutorials** for CPR, first aid, etc.
- **Secure Health Data Storage** and retrieval

## 🛠️ Technology Stack

### Frontend
- **React.js 18** - Modern React with hooks and context
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons** - Beautiful SVG icons
- **Framer Motion** - Animation library
- **React Query** - Data fetching and caching
- **Socket.io Client** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.io** - Real-time bidirectional communication
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Security & Infrastructure
- **JWT Authentication** - Secure token-based auth
- **bcryptjs** - Password hashing
- **Helmet** - Security headers
- **Rate Limiting** - API protection
- **CORS** - Cross-origin resource sharing

### Additional Services
- **Nodemailer** - Email services
- **Twilio** - SMS and communication
- **Cloudinary** - Image and file storage
- **Sharp** - Image processing

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB 5+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/medemo.git
cd medemo
```

2. **Install dependencies**
```bash
npm run install-all
```

3. **Environment Setup**
```bash
# Create .env file in server directory
cp server/.env.example server/.env

# Edit .env with your configuration
MONGODB_URI=mongodb://localhost:27017/medemo
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

4. **Start the application**
```bash
# Development mode (both frontend and backend)
npm run dev

# Production mode
npm run build
npm start
```

## 📁 Project Structure

```
medemo/
├── client/                 # React frontend
│   ├── public/            # Static files
│   ├── src/               # Source code
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts
│   │   ├── pages/         # Page components
│   │   ├── styles/        # CSS and styling
│   │   └── utils/         # Utility functions
│   └── package.json       # Frontend dependencies
├── server/                 # Node.js backend
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── config/            # Configuration files
│   └── index.js           # Server entry point
├── package.json            # Root dependencies
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/medemo

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=24h

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-twilio-number

# File Storage (Cloudinary)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Database Setup

1. **Install MongoDB**
```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community

# Windows
# Download from https://www.mongodb.com/try/download/community
```

2. **Start MongoDB**
```bash
# Ubuntu/Debian
sudo systemctl start mongodb

# macOS
brew services start mongodb-community

# Windows
# Start MongoDB service from Services
```

3. **Create Database**
```bash
mongosh
use medemo
```

## 🚀 Deployment

### Production Build

1. **Build the frontend**
```bash
cd client
npm run build
```

2. **Set production environment**
```bash
export NODE_ENV=production
export MONGODB_URI=your-production-mongodb-uri
export JWT_SECRET=your-production-jwt-secret
```

3. **Start production server**
```bash
npm start
```

### Docker Deployment

1. **Build Docker image**
```bash
docker build -t medemo .
```

2. **Run container**
```bash
docker run -p 5000:5000 -e NODE_ENV=production medemo
```

### Cloud Deployment

#### Heroku
```bash
heroku create medemo-app
heroku config:set NODE_ENV=production
git push heroku main
```

#### AWS EC2
```bash
# Install dependencies
sudo apt-get update
sudo apt-get install nodejs npm mongodb

# Clone and setup
git clone https://github.com/your-username/medemo.git
cd medemo
npm run install-all
npm run build

# Start with PM2
npm install -g pm2
pm2 start server/index.js --name medemo
```

## 📊 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password

### Emergency Endpoints

- `POST /api/emergency/create` - Create emergency alert
- `GET /api/emergency/active` - Get active emergencies
- `PUT /api/emergency/:id/update-status` - Update emergency status
- `PUT /api/emergency/:id/assign-ambulance` - Assign ambulance

### Healthcare Services

- `GET /api/hospitals` - Get hospitals list
- `GET /api/blood-banks` - Get blood banks
- `GET /api/doctors` - Get available doctors
- `POST /api/consultations/create` - Create consultation

## 🔒 Security Features

- **JWT Authentication** with secure token management
- **Password Hashing** using bcryptjs
- **Rate Limiting** to prevent abuse
- **CORS Protection** for cross-origin requests
- **Input Validation** and sanitization
- **Secure Headers** with Helmet middleware
- **Environment Variable Protection**

## 📱 Mobile Responsiveness

MedEmo is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones
- Emergency response devices

## 🌍 Internationalization

- **Multi-language Support** (English, Hindi, Bengali, Telugu, Tamil, Marathi, Gujarati, Kannada, Malayalam, Punjabi)
- **Instant Translation** services
- **Localized Content** and emergency procedures
- **Regional Emergency Numbers** integration

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test files
npm test -- --testPathPattern=emergency
```

## 📈 Performance Optimization

- **React Query** for efficient data fetching
- **Code Splitting** and lazy loading
- **Image Optimization** with Cloudinary
- **Database Indexing** for fast queries
- **Caching Strategies** for improved response times
- **Compression** middleware for reduced payload

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- 📧 Email: support@medemo.com
- 💬 Discord: [MedEmo Community](https://discord.gg/medemo)
- 📖 Documentation: [docs.medemo.com](https://docs.medemo.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/medemo/issues)

## 🙏 Acknowledgments

- **Healthcare Professionals** for domain expertise
- **Emergency Response Teams** for real-world insights
- **Open Source Community** for amazing tools and libraries
- **SIH (Smart India Hackathon)** for the platform opportunity

## 🔮 Roadmap

### Phase 1 (Current)
- ✅ Core emergency response system
- ✅ User authentication and management
- ✅ Real-time communication
- ✅ Basic AI triage

### Phase 2 (Next)
- 🚧 Advanced AI diagnostics
- 🚧 Wearable device integration
- 🚧 Blockchain for health records
- 🚧 Advanced analytics dashboard

### Phase 3 (Future)
- 📋 IoT device integration
- 📋 Predictive health analytics
- 📋 Telemedicine platform
- 📋 Global emergency network

---

**Made with ❤️ for better healthcare and emergency response**

*MedEmo - Saving Lives, One Emergency at a Time*
