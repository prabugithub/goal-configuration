# Goal Configuration App Documentation

## Overview
The Goal Configuration App is a React-based web application designed to help users set, configure, and track their goals. It features user authentication, goal hierarchy management, and progress tracking capabilities.

## Tech Stack
- **Frontend Framework**: React.js
- **UI Library**: Material-UI (MUI)
- **Authentication & Database**: Firebase
- **State Management**: React Context API
- **Routing**: React Router DOM

## Project Structure
```
goal-configuration-app/
├── src/
│   ├── api/              # API integration and Firebase services
│   ├── common/           # Common utilities and shared components
│   ├── components/       # React components
│   │   ├── AppGuide/
│   │   ├── ConfigureFields/
│   │   ├── GoalHierarchySelection/
│   │   ├── Login/
│   │   ├── NextStep/
│   │   └── TrackYourGoal/
│   ├── context/         # React Context providers
│   ├── modal/           # Modal components
│   └── theme.js         # MUI theme configuration
├── public/             # Static assets
└── build/             # Production build output
```

## Core Features

### 1. Authentication
- User signup and login functionality
- Firebase authentication integration
- Automatic session management
- Secure logout capability

### 2. Goal Configuration
- Multi-step goal configuration process:
  1. App Guide
  2. Goal Hierarchy Selection
  3. Field Configuration
  4. Next Steps
- Configuration persistence in Firebase
- Configuration reset/delete functionality

### 3. Goal Tracking
- Progress tracking interface
- Goal evaluation system
- Data persistence across sessions

## Key Components

### App.js
The main application component that handles:
- Authentication state management
- User configuration loading
- Navigation between different views
- Layout and routing

### Context Providers
- **StepContext**: Manages the multi-step configuration process
- **GoalConfigContext**: Handles goal configuration state

### Firebase Integration
- Authentication services
- User configuration storage
- Real-time data synchronization

## Getting Started

### Prerequisites
- Node.js
- npm or yarn
- Firebase account and configuration

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Firebase:
   - Set up a Firebase project
   - Add Firebase configuration to the app
   - Enable Authentication and Firestore

### Development
```bash
npm start
```
Runs the app in development mode at [http://localhost:3000](http://localhost:3000)

### Production Build
```bash
npm run build
```
Creates an optimized production build in the `build` folder

## Deployment
The application is configured for Firebase hosting. Deploy using:
```bash
firebase deploy
```

## Security
- Firebase Authentication for user management
- Secure data access rules in Firestore
- Protected routes and components

## Future Enhancements
1. Offline support
2. Data export functionality
3. Advanced goal analytics
4. Mobile app version

## Troubleshooting
- Check Firebase console for authentication issues
- Verify network connectivity for real-time updates
- Clear browser cache if experiencing UI inconsistencies

## Support
For issues and feature requests, please create an issue in the project repository.
