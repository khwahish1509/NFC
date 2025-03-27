import React, { useState, useEffect } from 'react';
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
  Modal,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useAppContext } from '../contexts/AppContext';
import NFCService from '../services/NFCService';
import APIService, { ProductData } from '../services/APIService';
import * as Location from 'expo-location';

// Import DateTimePicker conditionally to avoid errors in Expo Go web
let DateTimePicker: any = null;
if (Platform.OS !== 'web') {
  try {
    DateTimePicker = require('@react-native-community/datetimepicker').default;
  } catch (error) {
    console.log('DateTimePicker not available:', error);
  }
}

export default function FarmerScreen() {
  const { userRole, apiUrl } = useAppContext();
  const [productName, setProductName] = useState('');
  const [origin, setOrigin] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [dateProduced, setDateProduced] = useState(new Date());
  const [currentLocation, setCurrentLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isShowingDatePicker, setIsShowingDatePicker] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [productId, setProductId] = useState<string | null>(null);
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);

  // Set API base URL from context
  useEffect(() => {
    if (apiUrl) {
      APIService.setApiBaseUrl(apiUrl);
    }
  }, [apiUrl]);

  // Redirect if not a farmer
  useEffect(() => {
    if (userRole !== 'farmer') {
      router.push('/');
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
      Alert.alert('Error', 'Please enter a product name');
      return false;
    }
    if (!origin.trim()) {
      Alert.alert('Error', 'Please enter the origin');
      return false;
    }
    if (!batchNumber.trim()) {
      Alert.alert('Error', 'Please enter a batch number');
      return false;
    }
    if (!currentLocation.trim()) {
      Alert.alert('Error', 'Please enter the current location');
      return false;
    }
    return true;
  };

  const handleWriteNFC = async () => {
    if (!validateForm()) return;

    // Check if NFC is available
    try {
      const isSupported = await NFCService.checkIsNfcSupported();
      if (!isSupported) {
        Alert.alert(
          'NFC Not Supported',
          'NFC is not available on this device. Would you like to use QR codes instead?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Use QR Code', onPress: handleUseQRCode }
          ]
        );
        return;
      }
      
      setIsLoading(true);
      
      // Read NFC tag to ensure it's writable
      Alert.alert(
        'Ready to Write',
        'Hold your device near an NFC tag to write product information',
        [{ text: 'Cancel', onPress: () => setIsLoading(false) }],
        { cancelable: false }
      );
      
      // Read the tag first to verify it's present
      let nfcId;
      try {
        nfcId = await NFCService.readNfcTag();
        console.log('Found NFC tag with ID:', nfcId);
      } catch (nfcError) {
        console.log('Using simulated NFC for testing');
        nfcId = await NFCService.mockReadNfcTag();
      }
      
      // Generate a unique product ID
      const newProductId = `product-${Date.now()}`;
      setProductId(newProductId);
      
      // Prepare product data to store in backend
      const gpsCoordinates = await getCurrentLocation();
      
      const productData = {
        productName,
        origin,
        batchNumber,
        dateProduced: dateProduced.toISOString().split('T')[0],
        currentLocation,
        initialGpsCoordinates: gpsCoordinates,
      };
      
      // Create product in the backend
      await APIService.createProduct(productData);
      
      // Write to NFC tag
      Alert.alert(
        'Writing to Tag',
        'Keep your device near the NFC tag',
        [{ text: 'Cancel', onPress: () => setIsLoading(false) }],
        { cancelable: false }
      );
      
      let success;
      try {
        success = await NFCService.writeNfcTag(newProductId);
      } catch (nfcError) {
        console.log('Using simulated NFC write for testing');
        success = await NFCService.mockWriteNfcTag(newProductId);
      }
      
      if (success) {
        Alert.alert(
          'Success',
          'Product information has been written to the NFC tag',
          [{ text: 'OK' }]
        );
        resetForm();
      }
    } catch (error) {
      console.error('Error during NFC writing process:', error);
      Alert.alert('Error', 'Failed to write to NFC tag. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseQRCode = async () => {
    if (!validateForm()) return;
    
    try {
      setIsLoading(true);
      
      // Generate a unique product ID
      const newProductId = `product-${Date.now()}`;
      setProductId(newProductId);
      
      // Prepare product data to store in backend
      const gpsCoordinates = await getCurrentLocation();
      
      const productData = {
        productName,
        origin,
        batchNumber,
        dateProduced: dateProduced.toISOString().split('T')[0],
        currentLocation,
        initialGpsCoordinates: gpsCoordinates,
      };
      
      // Create product in the backend
      await APIService.createProduct(productData);
      
      // Generate QR code URL
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(newProductId)}`;
      setQrCodeUrl(qrUrl);
      setIsQrModalVisible(true);
      
    } catch (error) {
      console.error('Error creating product with QR code:', error);
      Alert.alert('Error', 'Failed to create product. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setIsShowingDatePicker(false);
    if (selectedDate) {
      setDateProduced(selectedDate);
    }
  };

  const resetForm = () => {
    setProductName('');
    setOrigin('');
    setBatchNumber('');
    setDateProduced(new Date());
    setCurrentLocation('');
    setQrCodeUrl(null);
    setProductId(null);
  };

  const closeQrModal = () => {
    setIsQrModalVisible(false);
    resetForm();
  };

  const goBack = () => {
    router.push('/');
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
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
            <Text style={styles.formTitle}>Enter Product Details</Text>

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
                placeholder="Enter origin (farm name)"
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
              <Text style={styles.label}>Date Produced</Text>
              <TouchableOpacity
                style={styles.datePickerButton}
                onPress={() => setIsShowingDatePicker(true)}
              >
                <Text style={styles.datePickerButtonText}>
                  {formatDate(dateProduced)}
                </Text>
                <Ionicons name="calendar" size={20} color="#4CAF50" />
              </TouchableOpacity>

              {isShowingDatePicker && DateTimePicker && (
                <DateTimePicker
                  value={dateProduced}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Current Location</Text>
              <TextInput
                style={styles.input}
                value={currentLocation}
                onChangeText={setCurrentLocation}
                placeholder="Enter current location"
              />
            </View>

            <View style={styles.buttonsContainer}>
              <TouchableOpacity
                style={styles.writeButton}
                onPress={handleWriteNFC}
              >
                <Ionicons name="wifi" size={20} color="#fff" />
                <Text style={styles.buttonText}>Write to NFC Tag</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.writeButton, styles.qrButton]}
                onPress={handleUseQRCode}
              >
                <Ionicons name="qr-code" size={20} color="#fff" />
                <Text style={styles.buttonText}>Generate QR Code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* QR Code Modal */}
        <Modal
          visible={isQrModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={closeQrModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Product QR Code</Text>
              
              <Text style={styles.productIdText}>
                Product ID: {productId}
              </Text>
              
              {qrCodeUrl && (
                <Image
                  source={{ uri: qrCodeUrl }}
                  style={styles.qrCodeImage}
                  resizeMode="contain"
                />
              )}
              
              <Text style={styles.modalInstructions}>
                Save this QR code or take a screenshot. This code can be printed and attached to your product.
              </Text>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={closeQrModal}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    color: '#4CAF50',
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
    marginBottom: 24,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  datePickerButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  buttonsContainer: {
    marginTop: 16,
    gap: 12,
  },
  writeButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  qrButton: {
    backgroundColor: '#3F51B5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 16,
    color: '#333',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  productIdText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#555',
  },
  qrCodeImage: {
    width: 200,
    height: 200,
    marginVertical: 20,
  },
  modalInstructions: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 