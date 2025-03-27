import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAppContext } from '../contexts/AppContext';
import NFCService from '../services/NFCService';

export default function HomeScreen() {
  const { setUserRole } = useAppContext();

  const checkNfcSupport = async () => {
    try {
      const isSupported = await NFCService.isNfcSupported();
      if (!isSupported) {
        alert('NFC is not supported on this device');
      }
    } catch (error) {
      console.error('Error checking NFC support:', error);
      alert('Failed to check NFC support');
    }
  };

  React.useEffect(() => {
    checkNfcSupport();
  }, []);

  const handleRoleSelect = (role: 'farmer' | 'retailer') => {
    setUserRole(role);
    if (role === 'farmer') {
      router.replace('/farmer');
    } else {
      router.replace('/retailer');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Farm to Retail</Text>
        <Text style={styles.subtitle}>NFC Product Tracking</Text>
      </View>
      
      <View style={styles.logoContainer}>
        <Ionicons name="leaf" size={80} color="#4CAF50" />
      </View>
      
      <Text style={styles.question}>I am a:</Text>
      
      <View style={styles.buttonsContainer}>
        <TouchableOpacity 
          style={styles.roleButton} 
          onPress={() => handleRoleSelect('farmer')}
        >
          <Ionicons name="nutrition" size={36} color="#ffffff" />
          <Text style={styles.roleButtonText}>Farmer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.roleButton, styles.retailerButton]} 
          onPress={() => handleRoleSelect('retailer')}
        >
          <Ionicons name="cart" size={36} color="#ffffff" />
          <Text style={styles.roleButtonText}>Retailer</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Secure NFC product tracking for agricultural supply chain
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  subtitle: {
    fontSize: 18,
    color: '#558B2F',
    marginTop: 5,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 50,
  },
  question: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 30,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 50,
  },
  roleButton: {
    backgroundColor: '#4CAF50',
    width: '48%',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  retailerButton: {
    backgroundColor: '#FFA000',
  },
  roleButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    color: '#757575',
    textAlign: 'center',
  },
}); 