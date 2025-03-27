# NFC Farm to Market - Setup Guide

This document provides instructions for setting up and running the NFC Farm to Market app on various platforms.

## Running the App in Expo Go (Limited Functionality)

Expo Go is the easiest way to test the app, but it has limitations:
- NFC functionality is not available
- You'll need to use the manual entry or QR code options instead

### Step 1: Start the Backend Server

1. Open a terminal/command prompt
2. Navigate to the backend directory:
   ```
   cd backend
   ```
3. Install dependencies (if not already done):
   ```
   npm install
   ```
4. Start the server:
   ```
   npm run dev
   ```
5. The server should start on port 5000

### Step 2: Start the Frontend App

1. Open a new terminal/command prompt
2. Navigate to the frontend directory:
   ```
   cd frontend
   ```
3. Install dependencies (if not already done):
   ```
   npm install
   ```
4. Start the Expo development server:
   ```
   npm start
   ```
5. Scan the QR code with the Expo Go app on your phone
6. When testing in Expo Go:
   - Use "Enter ID Manually" and try 'test-product-1' to test the retailer mode
   - Use the QR code generation option in farmer mode

## Building a Development Build with NFC Support

To use NFC functionality, you need to create a development build of the app.

### Prerequisites

1. Install Node.js and npm (if not already installed)
2. Install Expo CLI:
   ```
   npm install -g expo-cli
   ```
3. Install EAS CLI:
   ```
   npm install -g eas-cli
   ```

### For Windows Users: PowerShell Execution Policy

If you encounter "running scripts is disabled" error:

1. Open PowerShell as Administrator
2. Run:
   ```
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   ```
3. Or use Command Prompt (cmd.exe) instead of PowerShell

### Steps to Create a Development Build

1. Login to your Expo account:
   ```
   eas login
   ```

2. Navigate to your project frontend directory:
   ```
   cd frontend
   ```

3. Build for Android:
   ```
   eas build --profile preview --platform android
   ```

4. Build for iOS (requires Apple Developer account):
   ```
   eas build --profile preview --platform ios
   ```

5. Follow the instructions provided by EAS to install the build on your device

### Alternative: Development Client

If you want faster iteration during development:

1. Install the development client packages:
   ```
   npx expo install expo-dev-client
   ```

2. Create a development client build:
   ```
   eas build --profile development --platform android
   ```

3. Start your development server:
   ```
   npm start
   ```

4. Connect to the development server from your installed development client

## Testing with NFC

### Requirements
- An NFC-capable smartphone (most Android devices have NFC)
- NFC tags that support NDEF format (widely available online)
- For iOS, you need iPhone 7 or newer with iOS 13+

### Farmer Mode
1. Launch the app on your NFC-capable device
2. Select "Farmer Mode"
3. Fill in product details
4. Tap "Write to NFC Tag"
5. Hold an NFC tag near the back of your device

### Retailer Mode
1. Launch the app on your NFC-capable device
2. Select "Retailer Mode"
3. Tap "Scan NFC Tag"
4. Hold your device near an NFC tag that was previously written to by Farmer Mode
5. View product details and update location if needed

## Troubleshooting

### NFC Not Working
- Ensure NFC is enabled in your device settings
- Make sure you're using an actual development build, not Expo Go
- Try different positions when scanning tags (NFC antenna location varies by device)
- If using iOS, make sure your app has NFC permissions

### Build Errors
- Check that your eas.json is correctly configured
- Ensure app.json has the proper permissions (especially for Android)
- Try the "preview" profile which is often more reliable than "development"

### API Connection Issues
- Make sure your backend server is running
- Check that the API URL in AppContext.tsx matches your server's IP/port
- For physical devices, ensure both server and device are on the same network

## Development Notes

- The app includes fallback mechanisms for when NFC or backend is unavailable
- To test without NFC, use the "Enter ID Manually" option with ID "test-product-1"
- For testing without a backend, the app includes mock data

## Offline Mode

The app includes offline functionality:
- If the API is unreachable, mock data will be used as fallback
- Products created when offline will have IDs starting with "offline-product-"
- When returning online, the app will continue to work with actual API data 