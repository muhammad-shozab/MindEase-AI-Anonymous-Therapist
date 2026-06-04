# MindEase - Mental Health Support Platform

A comprehensive React-based mental health support platform that combines AI-powered therapy, mood tracking, crisis management, and diagnostic tools to provide holistic mental health support.

<img width="1365" height="707" alt="image" src="https://github.com/user-attachments/assets/3a3eab1d-8a5c-48e2-ac25-843e57df4b10" />


## 🌟 Features

### 1. **AI-Powered Therapy Chat**
- Multiple therapist personas (Cognitive Behavioral, Psychodynamic, Humanistic)
- Real-time chat interface with AI responses powered by Google Gemini API
- Conversation history and session management
- Support for different therapy approaches

### 2. **Mood Tracking & Analytics**
- Daily mood logging with emotional states
- Visual analytics and trends over time
- Mood patterns identification
- Historical data analysis

### 3. **Crisis Management**
- Panic button for emergency situations
- Quick access to crisis resources
- Session recovery for interrupted conversations
- Immediate support triggering

### 4. **Mental Health Diagnostics**
- Standardized assessment tools
- Diagnostic dashboards
- Health metrics visualization
- Personalized recommendations

### 5. **User Authentication**
- Google OAuth integration
- Secure user sessions
- Profile management

### 6. **Data Security**
- Client-side encryption using CryptoJS
- Secure API communication
- Protected sensitive information
- Google Drive integration for data backup

## 📸 Project Screenshots

### Home Page
<img width="1365" height="707" alt="image" src="https://github.com/user-attachments/assets/8420a133-1c83-4d25-8858-b0974c01360b" />

### Dashboard Overview
<img width="1365" height="767" alt="image" src="https://github.com/user-attachments/assets/308a327d-64b6-4c05-8b5c-3acfb087cc07" />

### Therapy Chat Interface
<img width="1365" height="767" alt="image" src="https://github.com/user-attachments/assets/2ae8fb8a-c198-42c3-ad5f-5c595b3f5a79" />

### Mood Tracker
<img width="1365" height="549" alt="image" src="https://github.com/user-attachments/assets/ebfaff34-fc59-4ecc-ab5c-8cc581c54333" />

### Import Exported Chats
<img width="1365" height="767" alt="image" src="https://github.com/user-attachments/assets/0c6c86e9-ec4b-4f4f-a0a9-b11d670ec088" />

### Crisis Management
<img width="1356" height="765" alt="image" src="https://github.com/user-attachments/assets/0e0ab7d8-28d6-405d-bbb8-ec9cda49d39d" />

## 🛠️ Tech Stack

### Frontend
- **React 19.2.6** - UI framework
- **TypeScript 5.9.3** - Type safety
- **Vite 7.3.2** - Build tool and dev server
- **Tailwind CSS 4.1.17** - Styling
- **Framer Motion** - Animations

### AI & Services
- **Google Generative AI (Gemini)** - Primary AI engine
- **Anthropic Claude SDK** - Alternative AI support
- **Open Router API** - Multi-model AI access
- **HuggingFace Inference** - ML model integration

### Storage & Security
- **Google Drive API** - Cloud backup
- **CryptoJS** - Client-side encryption
- **LocalForage** - Local persistent storage

### Additional Libraries
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Particles** - Animations
- **jsPDF** - Document generation

## 📁 Project Structure

```
mindease-implementation-guide/
├── src/
│   ├── components/
│   │   ├── ChatBubble.tsx          # Chat message display
│   │   ├── ErrorBoundary.tsx       # Error handling
│   │   ├── MoodTracker.tsx         # Mood logging component
│   │   ├── PanicButton.tsx         # Crisis management button
│   │   ├── SessionRecovery.tsx     # Session management
│   │   ├── TherapistCard.tsx       # Therapist selection
│   │   └── TypingIndicator.tsx     # Loading indicator
│   ├── pages/
│   │   ├── Home.tsx                # Landing page
│   │   ├── Dashboard.tsx           # Main dashboard
│   │   ├── Chat.tsx                # Chat interface
│   │   └── DiagnosticDashboard.tsx # Assessment tools
│   ├── services/
│   │   ├── GeminiService.ts        # Google Gemini API
│   │   ├── OpenRouterService.ts    # Open Router integration
│   │   ├── RealAIService.ts        # AI orchestration
│   │   ├── EncryptionService.ts    # Data encryption
│   │   ├── StorageService.ts       # Local storage
│   │   └── GoogleDriveService.ts   # Drive integration
│   ├── context/
│   │   └── AppContext.tsx          # Global state management
│   ├── patterns/
│   │   └── TherapistFactory.ts     # Therapist factory pattern
│   ├── config/
│   │   └── googleDrive.ts          # Google Drive config
│   ├── App.tsx                     # Main app component
│   └── main.tsx                    # Entry point
├── package.json                    # Dependencies
├── tsconfig.json                   # TypeScript config
├── vite.config.ts                  # Vite configuration
├── tailwind.config.js              # Tailwind CSS config
└── index.html                      # HTML template
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm/yarn
- Google OAuth credentials
- API keys for:
  - Google Generative AI (Gemini)
  - Open Router (optional)
  - HuggingFace (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/muhammad-shozab/mindease-implementation-guide.git
   cd mindease-implementation-guide
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
   VITE_HUGGINGFACE_API_KEY=your_huggingface_api_key_here
   VITE_ENCRYPTION_KEY=your_encryption_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## 📦 Available Scripts

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔐 Security Features

- **End-to-End Encryption**: Sensitive user data is encrypted using CryptoJS
- **Google OAuth Authentication**: Secure login mechanism
- **API Key Protection**: Environment variables for sensitive credentials
- **Data Privacy**: Local storage with optional cloud backup
- **Secure Sessions**: Session management and recovery

## 🤝 Core Components

### ChatBubble
Displays chat messages with user and AI responses with typing indicators and animations.

### ErrorBoundary
Catches and handles React errors gracefully with fallback UI.

### MoodTracker
Allows users to log their daily mood, emotions, and track patterns over time.

### PanicButton
Emergency button that provides immediate crisis resources and support.

### SessionRecovery
Manages conversation sessions and allows recovery of interrupted chats.

### TherapistCard
Displays available therapist personas for user selection.

### TypingIndicator
Shows animated loading state during AI response generation.

## 🎨 Services

### GeminiService
Handles Google Generative AI (Gemini) API calls for therapy responses.

### OpenRouterService
Alternative multi-model AI access through Open Router API.

### RealAIService
Orchestrates AI responses, selecting the best available service.

### EncryptionService
Provides client-side encryption/decryption for sensitive data.

### StorageService
Manages local storage operations for user data and preferences.

### GoogleDriveService
Handles cloud backup and synchronization with Google Drive.

## 📊 Therapist Types

1. **Cognitive Behavioral Therapist**
   - Focus on thought patterns and behaviors
   - Evidence-based interventions
   - Problem-solving approach

2. **Psychodynamic Therapist**
   - Explores unconscious patterns
   - Focus on past influences
   - Deep introspection

3. **Humanistic Therapist**
   - Person-centered approach
   - Empathy and acceptance
   - Self-actualization focus

## 🔧 Configuration

### Google Drive Integration
Configure Google Drive API in `src/config/googleDrive.ts` with your credentials.

### Therapy Factory Pattern
The `TherapistFactory` pattern is used to create different therapist personas with specific behaviors and response styles.

## 📈 Performance Optimization

- **Vite**: Fast build and development experience
- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Components loaded on demand
- **Single File Build**: Optional production single-file bundle

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Recommended Hosting
- Vercel
- Netlify
- GitHub Pages
- Firebase Hosting

### Environment Setup for Production
Ensure all environment variables are set in your hosting platform's configuration.

## 📝 API Integration

### Google Gemini API
```typescript
// Used for primary AI therapy responses
const response = await GeminiService.getTherapyResponse(userMessage);
```

### Open Router API
```typescript
// Multi-model AI access
const response = await OpenRouterService.getResponse(userMessage);
```

### Google Drive API
```typescript
// Cloud backup and data synchronization
await GoogleDriveService.backupData(userData);
```

## 🐛 Known Issues & Limitations

- Google OAuth requires valid credentials for full functionality
- API keys are required for all AI services
- Large conversation histories may impact performance
- Offline mode has limited functionality

## 🔮 Future Enhancements

- [ ] Video consultation support
- [ ] Mobile app using React Native
- [ ] Advanced mood pattern analytics
- [ ] Community features
- [ ] Therapist matching algorithm
- [ ] Multi-language support
- [ ] Offline mode improvements
- [ ] Advanced diagnostic assessments
- [ ] Integration with healthcare systems
- [ ] Prescription management

## 👨‍💼 Team & Contribution

This is an SDA Group Project. Contributions are welcome!

### How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support & Contact

For issues, questions, or feedback:
- GitHub Issues: [Create an Issue](https://github.com/muhammad-shozab/mindease-implementation-guide/issues)
- Project Owner: Muhammad Shozab
- GitHub Profile: [@muhammad-shozab](https://github.com/muhammad-shozab)

## 📞 Crisis Resources

If you or someone you know is in crisis:
- **National Suicide Prevention Lifeline**: 1-800-273-8255 (US)
- **Crisis Text Line**: Text HOME to 741741
- **International Association for Suicide Prevention**: https://www.iasp.info/resources/Crisis_Centres/

---

**Note**: This application is designed for support and educational purposes and is not a replacement for professional mental health treatment. Always consult with qualified mental health professionals.

---

**Last Updated**: June 2026
