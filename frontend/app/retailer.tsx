import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppContext } from '../contexts/AppContext';
import NFCService from '../services/NFCService';
import APIService, { ProductData, TransferData } from '../services/APIService';
import * as Location from 'expo-location';

export default function RetailerScreen() {
  const { userRole } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isReadingNFC, setIsReadingNFC] = useState(false);
  const [product, setProduct] = useState<ProductData | null>(null);
  const [newLocation, setNewLocation] = useState('');

  // Redirect if not a retailer
  React.useEffect(() => {
    if (userRole !== 'retailer') {
      router.replace('/');
    }
  }, [userRole]);

  const getCurrentLocation = async () => {
    try {
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

  const handleScanNFC = async () => {
    try {
      setIsReadingNFC(true);
      
      // Alert the user to scan an NFC tag
      Alert.alert(
        'Scan NFC Tag',
        'Hold your device near an NFC tag to read product ID',
        [{ text: 'Cancel', onPress: () => setIsReadingNFC(false) }],
        { cancelable: false }
      );
      
      // Read the NFC tag to get the product ID
      const productId = await NFCService.readNfcTag();
      
      setIsLoading(true);
      
      // Fetch product details from the API
      const productData = await APIService.getProductById(productId);
      setProduct(productData);
      
      // Reset new location to current product location
      setNewLocation(productData.currentLocation || '');
    } catch (error) {
      console.error('Error during NFC reading process:', error);
      Alert.alert('Error', 'Failed to read NFC tag or fetch product data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsReadingNFC(false);
    }
  };

  const handleUpdateLocation = async () => {
    if (!product || !newLocation.trim()) {
      Alert.alert('Error', 'Please provide a valid location');
      return;
    }

    try {
      setIsLoading(true);
      
      // Get current GPS coordinates
      const gpsCoordinates = await getCurrentLocation();
      
      // Prepare transfer data
      const transferData: TransferData = {
        location: newLocation,
        transferredBy: 'Retailer App User', // In a real app, use authenticated user
        gpsCoordinates: gpsCoordinates || undefined,
      };
      
      // Update product transfer in the backend
      const updatedProduct = await APIService.updateProductTransfer(
        product.productId,
        transferData
      );
      
      setProduct(updatedProduct);
      Alert.alert('Success', 'Product location updated successfully');
    } catch (error) {
      console.error('Error updating product location:', error);
      Alert.alert('Error', 'Failed to update product location. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetData = () => {
    setProduct(null);
    setNewLocation('');
  };

  const goBack = () => {
    router.replace('/');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFA000" />
        <Text style={styles.loadingText}>Processing...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={goBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Retailer Mode</Text>
        </View>

        <ScrollView style={styles.scrollView}>
          {!product ? (
            <View style={styles.emptyStateContainer}>
              <Ionicons name="scan" size={80} color="#FFA000" />
              <Text style={styles.emptyStateTitle}>No Product Scanned</Text>
              <Text style={styles.emptyStateSubtitle}>
                Scan an NFC tag to see product details
              </Text>
              <TouchableOpacity
                style={styles.scanButton}
                onPress={handleScanNFC}
                disabled={isReadingNFC}
              >
                <Ionicons name="wifi" size={20} color="#fff" />
                <Text style={styles.scanButtonText}>
                  {isReadingNFC ? 'Scanning...' : 'Scan NFC Tag'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.productContainer}>
              <View style={styles.productHeader}>
                <Text style={styles.productName}>{product.productName}</Text>
                <TouchableOpacity
                  style={styles.resetButton}
                  onPress={resetData}
                >
                  <Ionicons name="refresh" size={24} color="#FFA000" />
                </TouchableOpacity>
              </View>

              <View style={styles.productInfo}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Product ID:</Text>
                  <Text style={styles.infoValue}>{product.productId}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Origin:</Text>
                  <Text style={styles.infoValue}>{product.origin}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Batch Number:</Text>
                  <Text style={styles.infoValue}>{product.batchNumber}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Date Produced:</Text>
                  <Text style={styles.infoValue}>
                    {formatDate(product.dateProduced)}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Current Location:</Text>
                  <Text style={styles.infoValue}>{product.currentLocation}</Text>
                </View>
              </View>

              <View style={styles.transferContainer}>
                <Text style={styles.transferTitle}>Update Location</Text>
                <TextInput
                  style={styles.locationInput}
                  value={newLocation}
                  onChangeText={setNewLocation}
                  placeholder="Enter new location"
                />
                <TouchableOpacity
                  style={styles.updateButton}
                  onPress={handleUpdateLocation}
                >
                  <Text style={styles.updateButtonText}>Update Location</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.historyContainer}>
                <Text style={styles.historyTitle}>Transfer History</Text>
                
                {product.transferHistory && product.transferHistory.length > 0 ? (
                  product.transferHistory.map((transfer, index) => (
                    <View key={index} style={styles.historyItem}>
                      <View style={styles.historyItemHeader}>
                        <Text style={styles.historyItemLocation}>
                          {transfer.location}
                        </Text>
                        <Text style={styles.historyItemDate}>
                          {transfer.timestamp ? formatDate(transfer.timestamp) : 'N/A'}
                        </Text>
                      </View>
                      <Text style={styles.historyItemUser}>
                        By: {transfer.transferredBy}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.noHistoryText}>No transfer history available</Text>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </View>
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
    color: '#FFA000',
  },
  scrollView: {
    flex: 1,
  },
  emptyStateContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 24,
    color: '#333',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#757575',
    marginTop: 8,
    marginBottom: 32,
  },
  scanButton: {
    backgroundColor: '#FFA000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  productContainer: {
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  resetButton: {
    padding: 8,
  },
  productInfo: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: 130,
    color: '#555',
  },
  infoValue: {
    flex: 1,
    color: '#333',
  },
  transferContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  transferTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  locationInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  updateButton: {
    backgroundColor: '#FFA000',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  historyContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  historyItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingVertical: 12,
  },
  historyItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  historyItemLocation: {
    fontWeight: 'bold',
    color: '#333',
  },
  historyItemDate: {
    color: '#757575',
    fontSize: 14,
  },
  historyItemUser: {
    color: '#757575',
    fontSize: 14,
  },
  noHistoryText: {
    color: '#757575',
    fontStyle: 'italic',
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