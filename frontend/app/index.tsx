import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useAppContext } from '../contexts/AppContext';
import NFCService from '../services/NFCService';

export default function HomeScreen() {
  const { setUserRole } = useAppContext();
  const [nfcSupported, setNfcSupported] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkNfc() {
      try {
        const isSupported = await NFCService.checkIsNfcSupported();
        setNfcSupported(isSupported);
      } catch (error) {
        console.error('Error checking NFC support:', error);
        setNfcSupported(false);
      }
    }

    // Only check NFC on native platforms
    if (Platform.OS !== 'web') {
      checkNfc();
    } else {
      setNfcSupported(false);
    }
  }, []);

  const handleFarmerMode = () => {
    setUserRole('farmer');
  };

  const handleRetailerMode = () => {
    setUserRole('retailer');
  };

  const showNfcWarning = () => {
    if (nfcSupported === false) {
      Alert.alert(
        'NFC Not Supported',
        'Your device does not support NFC or NFC is disabled. Some features may not work properly.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Farm to Market</Text>
          <Text style={styles.subtitle}>NFC Product Tracking</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={30} color="#555" style={styles.infoIcon} />
            <Text style={styles.infoText}>
              Select your role to continue. Farmers can register new products and write NFC tags,
              while retailers can scan products and update their status.
            </Text>

            {nfcSupported === false && (
              <View style={styles.warningBox}>
                <Ionicons name="warning" size={24} color="#FFA000" style={styles.warningIcon} />
                <Text style={styles.warningText}>
                  Your device doesn't support NFC or it's disabled. 
                  You can still use QR codes or manual entry as alternatives.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.buttonContainer}>
            <Link 
              href="/farmer" 
              asChild
              onPress={() => {
                handleFarmerMode();
                showNfcWarning();
              }}
            >
              <TouchableOpacity style={[styles.modeButton, styles.farmerButton]}>
                <Ionicons name="leaf" size={36} color="#fff" />
                <Text style={styles.buttonText}>Farmer Mode</Text>
                <Text style={styles.buttonSubtext}>Register Products</Text>
              </TouchableOpacity>
            </Link>

            <Link 
              href="/retailer" 
              asChild
              onPress={() => {
                handleRetailerMode();
                showNfcWarning();
              }}
            >
              <TouchableOpacity style={[styles.modeButton, styles.retailerButton]}>
                <Ionicons name="cart" size={36} color="#fff" />
                <Text style={styles.buttonText}>Retailer Mode</Text>
                <Text style={styles.buttonSubtext}>Track Products</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
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
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  infoBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoIcon: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    lineHeight: 24,
  },
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    alignItems: 'center',
  },
  warningIcon: {
    marginRight: 10,
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    color: '#5D4037',
  },
  buttonContainer: {
    gap: 20,
  },
  modeButton: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  farmerButton: {
    backgroundColor: '#4CAF50',
  },
  retailerButton: {
    backgroundColor: '#FFA000',
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  buttonSubtext: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.9,
    marginTop: 4,
  },
}); 