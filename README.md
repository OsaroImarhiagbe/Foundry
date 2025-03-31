Foundry

Foundry is a React Native application designed to empower developers. Whether you're looking to connect with like-minded individuals, find collaborators for projects or startups, or seeking mentorship in the software industry, Foundry offers the tools to grow and thrive in the developer community.

Getting Started

Prerequisites
Node.js (Latest LTS version recommended)
npm or yarn
Expo CLI (npm install -g expo-cli)
Firebase Project (for authentication, Firestore, and Crashlytics)

Features

Community Feed – Share ideas and engage with other users.
In-App Messaging – Communicate with other users in real time.
Image & Video Uploads – Store media on Firebase Cloud Storage.
Push Notifications – Stay updated on discussions and collaborations.
Project Collaboration – Users can form teams and work on projects together.
Funding Opportunities – Connect with investors or crowdfunding options.

Built With
Frontend: React Native (Expo) + TypeScript
Backend: Firebase (Authentication, Firestore, Cloud Storage, Real-Time Database, Firebase Cloud Messaging, Cloud Functions, etc.)
CI/CD: GitHub Actions + EAS for automated builds
State Management: Redux
UI Components: React Native Paper
Notification: Notifee + FCM

Installation
npm install
npx expo start

Set up environment variables as mentioned in Prerequisites.

Start the Expo development server:
Environment Variables
Set up the following environment variables in your .env files


Deployment

Frontend: Uses EAS (Expo Application Services) for builds.
Backend Services: Firebase for authentication, Firestore for database Firebase Cloud Storage for media storage, and Firebase Cloud Functions for serverless backend operations.

To trigger an EAS build for production:

eas build --profile production --platform all ( ios or android)

Contributing
Emmanuel Imarhiagbe

Contact
For questions, reach out via devguidescompany@gmail.com



