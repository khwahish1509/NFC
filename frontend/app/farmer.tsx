import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppContext } from '../contexts/AppContext';
import NFCService from '../services/NFCService';
import APIService, { ProductData } from '../services/APIService';
import * as Location from 'expo-location';

export default function FarmerScreen() {
  const { userRole } = useAppContext();
  const [productName, setProductName] = useState('');
  const [origin, setOrigin] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [dateProduced, setDateProduced] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isWritingNFC, setIsWritingNFC] = useState(false);

  // Redirect if not a farmer
  React.useEffect(() => {
    if (userRole !== 'farmer') {
      router.replace('/');
    }
  }, [userRole]);

  const getCurrentLocation = async () => {
    try {
      // Only try to get location on actual devices
      if (Platform.OS === 'web') {
        return null;
      }
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required');
        return null;
      }

      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  };

  const validateForm = () => {
    if (!productName.trim()) {
      Alert.alert('Error', 'Product name is required');
      return false;
    }
    if (!origin.trim()) {
      Alert.alert('Error', 'Origin is required');
      return false;
    }
    if (!batchNumber.trim()) {
      Alert.alert('Error', 'Batch number is required');
      return false;
    }
    if (!dateProduced.trim()) {
      Alert.alert('Error', 'Production date is required');
      return false;
    }
    
    // Simple date validation (YYYY-MM-DD format)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateProduced)) {
      Alert.alert('Error', 'Date must be in YYYY-MM-DD format');
      return false;
    }
    
    return true;
  };

  const handleWriteNFC = async () => {
    if (!validateForm()) return;

    // Check if NFC is available
    const isSupported = await NFCService.checkIsNfcSupported();
    if (!isSupported) {
      Alert.alert('Error', 'NFC is not supported on this device');
      return;
    }

    try {
      setIsWritingNFC(true);
      
      // Read NFC tag to get its ID
      Alert.alert(
        'Scan NFC Tag',
        'Hold your device near an NFC tag to read its ID',
        [{ text: 'Cancel', onPress: () => setIsWritingNFC(false) }],
        { cancelable: false }
      );
      
      const nfcId = await NFCService.readNfcTag();
      
      // Generate a unique product ID (in a real app, you might want a more robust solution)
      const productId = `PRD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Get current location
      const location = await getCurrentLocation();
      
      // Prepare product data
      const productData: ProductData = {
        productId,
        productName,
        origin,
        batchNumber,
        dateProduced,
        createdBy: 'Farmer App User', // In a real app, you'd use authenticated user
        currentLocation: origin,
        transferHistory: [
          {
            location: origin,
            transferredBy: 'Farmer App User',
            timestamp: new Date().toISOString(),
            gpsCoordinates: location || undefined,
          },
        ],
      };
      
      // Save to backend first
      setIsLoading(true);
      await APIService.createProduct(productData);
      
      // Write product ID to NFC tag
      Alert.alert(
        'Write to NFC Tag',
        'Hold your device near the NFC tag to write product ID',
        [{ text: 'Cancel', onPress: () => setIsWritingNFC(false) }],
        { cancelable: false }
      );
      
      const success = await NFCService.writeNfcTag(productId);
      
      if (success) {
        Alert.alert(
          'Success',
          'Product information saved and NFC tag written successfully',
          [{ text: 'OK', onPress: resetForm }]
        );
      }
    } catch (error) {
      console.error('Error during NFC writing process:', error);
      Alert.alert('Error', 'Failed to write to NFC tag. Please try again.');
    } finally {
      setIsLoading(false);
      setIsWritingNFC(false);
    }
  };

  const resetForm = () => {
    setProductName('');
    setOrigin('');
    setBatchNumber('');
    setDateProduced('');
  };

  const goBack = () => {
    router.replace('/');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Processing...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Farmer Mode</Text>
        </View>

        <ScrollView style={styles.scrollView}>
          <View style={styles.formContainer}>
            <Text style={styles.formTitle}>Product Information</Text>
            <Text style={styles.formSubtitle}>
              Enter details and write to NFC tag
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Name</Text>
              <TextInput
                style={styles.input}
                value={productName}
                onChangeText={setProductName}
                placeholder="Enter product name"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Origin</Text>
              <TextInput
                style={styles.input}
                value={origin}
                onChangeText={setOrigin}
                placeholder="Enter origin location"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Batch Number</Text>
              <TextInput
                style={styles.input}
                value={batchNumber}
                onChangeText={setBatchNumber}
                placeholder="Enter batch number"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date Produced (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={dateProduced}
                onChangeText={setDateProduced}
                placeholder="YYYY-MM-DD"
                keyboardType="number-pad"
              />
            </View>

            <TouchableOpacity
              style={styles.writeButton}
              onPress={handleWriteNFC}
              disabled={isWritingNFC}
            >
              <Ionicons name="wifi" size={20} color="#fff" />
              <Text style={styles.writeButtonText}>
                {isWritingNFC ? 'Writing...' : 'Write to NFC Tag'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  formSubtitle: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    fontSize: 16,
  },
  writeButton: {
    backgroundColor: '#4CAF50',
    height: 56,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  writeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#333',
  },
}); 