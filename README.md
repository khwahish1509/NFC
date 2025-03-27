# NFC Farm Product Tracking System

A cross-platform mobile application for tracking agricultural products from farm to retail using NFC technology.

## Features

### Farmer Mode
- Scan NFC chips to get unique IDs
- Enter product details (name, origin, batch number, date produced)
- Write product IDs to NFC chips
- Send product details to backend database

### Retailer Mode
- Scan NFC chips to retrieve product IDs
- Fetch product details from backend database
- Update product location and transfer history
- View complete product transfer history

## Tech Stack

### Frontend
- React Native (Expo)
- React Context API for state management
- `react-native-nfc-manager` for NFC operations
- Expo Location for GPS tracking

### Backend
- Node.js with Express
- MongoDB with Mongoose
- RESTful API architecture

## Setup Instructions

### Prerequisites
- Node.js (v14 or later)
- npm or yarn
- MongoDB (local or Atlas)
- Expo Go app on physical device (for testing)

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/nfc-tracking
   NODE_ENV=development
   ```

4. Start the server:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Update the API base URL in `/contexts/AppContext.tsx` to match your backend server address (use your computer's local IP address, not localhost, for testing with physical devices).

4. Start the Expo development server:
   ```
   npm start
   ```

5. Scan the QR code with the Expo Go app on your physical device.

## NFC Compatibility

This app requires a device with NFC capabilities and works on both Android and iOS. Note that iOS has some limitations with NFC writing operations which may require additional configuration.

## Screenshots

(Screenshots would be added here in a real README)

## License

MIT 