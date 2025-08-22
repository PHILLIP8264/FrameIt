# FrameIt 📸

### _Capture, Quest, Connect - Your World Awaits_

[![React Native](https://img.shields.io/badge/React%20Native-0.79.5-61DAFB?style=flat&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-53.0.20-000020?style=flat&logo=expo)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.0.0-FFCA28?style=flat&logo=firebase)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.0-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)

## 🎥 Demo Video

[![FrameIt Demo](https://img.shields.io/badge/📹_Watch_Demo-Click_Here-FF6B6B?style=for-the-badge)](./appdemo/221110_phillip_demovideo_term3.mp4)

_Click above to watch the full demonstration of FrameIt's features and capabilities._

---

## 🌟 Overview

**FrameIt** is a revolutionary location-based social photography app that transforms the way you explore and document your world. Combining elements of gamification, social networking, and real-world exploration, FrameIt encourages users to venture beyond their comfort zones through engaging photo quests and challenges.

### ✨ Key Features

🗺️ **Location-Based Quests** - Discover photo opportunities in your area  
📸 **Photo Challenges** - Complete themed photography missions  
👥 **Team Collaboration** - Join teams and compete in group challenges  
🏆 **Achievement System** - Unlock badges and climb leaderboards  
🔍 **Smart Moderation** - Advanced content filtering with manual review  
📊 **Analytics Dashboard** - Comprehensive admin tools and insights  
🔐 **Secure Authentication** - Firebase-powered user management

---

## 🚀 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Expo CLI

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/PHILLIP8264/FrameIt.git
   cd FrameIt/FrameIt
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Firebase**

   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Add your Firebase configuration to `config/firebase.ts`
   - Enable Authentication, Firestore, and Storage

4. **Start the development server**

   ```bash
   npm start
   ```

5. **Run on your platform**

   ```bash
   # Android
   npm run android

   # iOS
   npm run ios

   # Web
   npm run web
   ```

---

## 🏗️ Architecture

### Technology Stack

| Layer                | Technology            | Purpose                               |
| -------------------- | --------------------- | ------------------------------------- |
| **Frontend**         | React Native + Expo   | Cross-platform mobile development     |
| **Navigation**       | Expo Router           | File-based routing system             |
| **State Management** | React Hooks + Context | Application state management          |
| **Backend**          | Firebase              | Authentication, database, and storage |
| **Database**         | Firestore             | NoSQL document database               |
| **Authentication**   | Firebase Auth         | User authentication and security      |
| **Storage**          | Firebase Storage      | Image and file storage                |
| **Maps**             | React Native Maps     | Location services and mapping         |
| **Styling**          | StyleSheet            | Custom responsive design system       |

### Project Structure

```
FrameIt/
├── app/                          # File-based routing screens
│   ├── (tabs)/                   # Tab navigation screens
│   ├── admin.tsx                 # Admin dashboard
│   ├── profile.tsx               # User profile
│   └── ...
├── components/                   # Reusable UI components
│   ├── admin/                    # Admin-specific components
│   ├── auth/                     # Authentication components
│   ├── cards/                    # Card components
│   ├── modals/                   # Modal dialogs
│   ├── quest/                    # Quest-related components
│   ├── shared/                   # Shared UI components
│   └── social/                   # Social features
├── services/                     # Business logic and API layer
│   ├── analytics/                # Analytics service
│   ├── base/                     # Base Firebase service
│   ├── quest/                    # Quest management
│   ├── security/                 # Security and moderation
│   ├── team/                     # Team management
│   ├── user/                     # User management
│   └── ModernFirestoreService.ts # Main data service
├── hooks/                        # Custom React hooks
├── styles/                       # Style definitions
├── types/                        # TypeScript type definitions
├── constants/                    # App constants and configuration
├── contexts/                     # React contexts
├── utils/                        # Utility functions
└── config/                       # Configuration files
```

---

## 🎮 Features Deep Dive

### 📍 Location-Based Quests

- **GPS Integration**: Real-time location tracking for quest completion
- **Proximity Detection**: Smart detection when users reach quest locations
- **Difficulty Levels**: Beginner to Expert challenges
- **Categories**: Nature, Urban, Portrait, Architecture, and more

### 👥 Team System

- **Team Creation**: Form teams with friends and family
- **Invite Codes**: Easy team joining with generated codes
- **Team Challenges**: Collaborative quests and competitions
- **Leadership Tools**: Team management and member oversight

### 🏆 Gamification

- **XP System**: Experience points for quest completion
- **Achievement Badges**: Unlock special achievements
- **Leaderboards**: Global and team-based rankings
- **Tag System**: Unlock special tags based on performance

### 🛡️ Content Moderation

- **Advanced Moderation**: Automated content filtering using Google Vision API
- **Manual Review**: Human moderation for flagged content
- **Reporting System**: User-driven content reporting
- **Admin Tools**: Comprehensive moderation dashboard

### 📊 Analytics & Admin

- **User Analytics**: Track engagement and retention
- **Quest Performance**: Monitor quest completion rates
- **Geographic Data**: Regional usage patterns
- **System Configuration**: Adjustable app parameters

---

## 🔧 Development

### Available Scripts

```bash
# Development
npm start              # Start Expo development server
npm run android        # Run on Android device/emulator
npm run ios           # Run on iOS device/simulator
npm run web           # Run in web browser

# Code Quality
npm run lint          # Run ESLint
npm run type-check    # TypeScript type checking

# Build
npm run build         # Build for production
```

### Development Workflow

1. **Feature Development**

   ```bash
   # Create feature branch
   git checkout -b feature/new-feature

   # Make changes and test
   npm start

   # Commit and push
   git add .
   git commit -m "Add new feature"
   git push origin feature/new-feature
   ```

2. **Testing**

   - Manual testing on Android/iOS simulators
   - Component testing in isolation
   - Integration testing with Firebase services

3. **Code Standards**
   - TypeScript for type safety
   - ESLint for code quality
   - Prettier for code formatting
   - Consistent naming conventions

---

## 🔒 Security & Privacy

### Data Protection

- **Encrypted Storage**: All sensitive data encrypted at rest
- **Secure Authentication**: Firebase Auth with email/password
- **Privacy Controls**: User-configurable privacy settings
- **GDPR Compliance**: Data export and deletion capabilities

### Content Safety

- **Automated Moderation**: Advanced content filtering
- **Community Guidelines**: Clear usage policies
- **Reporting System**: Easy content reporting tools
- **Admin Oversight**: Human moderation capabilities

---

## 📱 Supported Platforms

| Platform    | Status       | Requirements           |
| ----------- | ------------ | ---------------------- |
| **Android** | ✅ Supported | Android 6.0+ (API 23+) |
| **iOS**     | ✅ Supported | iOS 13.0+              |
| **Web**     | 🚧 Beta      | Modern browsers        |

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Code of Conduct

- Be respectful and inclusive
- Follow coding standards
- Write clear commit messages
- Test your changes thoroughly

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙋‍♂️ Support

### Contact

- **Developer**: Phillip (PHILLIP8264)
- **Email**: support@frameit.com
- **GitHub**: [@PHILLIP8264](https://github.com/PHILLIP8264)

### Getting Help

- 📚 Check the [documentation](./docs)
- 🐛 Report issues in [GitHub Issues](../../issues)
- 💬 Join our community discussions

---

## 🎯 Roadmap

### Upcoming Features

- [ ] **Social Feed**: Photo sharing timeline
- [ ] **Live Events**: Real-time photography competitions
- [ ] **AR Integration**: Augmented reality quest hints
- [ ] **Offline Mode**: Quest completion without internet
- [ ] **API Access**: Third-party integrations
- [ ] **Desktop App**: Desktop companion application

### Version History

- **v1.0.0** - Initial release with core features
- **v1.1.0** - Enhanced team management
- **v1.2.0** - Advanced analytics dashboard
- **v1.3.0** - Improved content moderation

---

<div align="center">

**Made with ❤️ by Phillip**

_FrameIt - Where every photo tells a story and every quest creates memories_

[![GitHub stars](https://img.shields.io/github/stars/PHILLIP8264/FrameIt?style=social)](https://github.com/PHILLIP8264/FrameIt/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/PHILLIP8264/FrameIt?style=social)](https://github.com/PHILLIP8264/FrameIt/network/members)

</div>
