import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { useNavigation } from '@react-navigation/native';

const EnhancedFilterScreen = () => {
  const navigation = useNavigation();

  // Filter state variables
  const [vehicleType, setVehicleType] = useState('all');
  const [brand, setBrand] = useState('all');
  const [cc, setCc] = useState('all');
  const [priceRange, setPriceRange] = useState('all');

  const applyFilters = () => {
    // Build filters object to send to Dashboard
    const filters = { vehicleType, brand, cc, priceRange };
    // Navigate to the bottom-tab navigator (HomeTabs) and pass filters
    navigation.replace("HomeTabs", { filters });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Filter Vehicles</Text>
      </View>
      
      <View style={styles.container}>
        <Text style={styles.subHeader}>Customize your search</Text>
        
        <View style={styles.filterSection}>
          <Text style={styles.label}>Vehicle Type</Text>
          <RNPickerSelect
            onValueChange={(value) => setVehicleType(value)}
            value={vehicleType}
            items={[
              { label: 'All Vehicles', value: 'all' },
              { label: 'Scooters (2 Wheels)', value: 'scooters' },
              { label: 'Cars (4 Wheels)', value: 'cars' },
            ]}
            style={pickerStyles}
            useNativeAndroidPickerStyle={false}
          />
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.label}>Brand</Text>
          <RNPickerSelect
            onValueChange={(value) => setBrand(value)}
            value={brand}
            items={[
              { label: 'All Brands', value: 'all' },
              { label: 'Honda', value: 'honda' },
              { label: 'Yamaha', value: 'yamaha' },
              { label: 'Suzuki', value: 'suzuki' },
              { label: 'Kawasaki', value: 'kawasaki' },
            ]}
            style={pickerStyles}
            useNativeAndroidPickerStyle={false}
          />
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.label}>Engine CC</Text>
          <RNPickerSelect
            onValueChange={(value) => setCc(value)}
            value={cc}
            items={[
              { label: 'All CC', value: 'all' },
              { label: 'Below 125cc', value: 'below125' },
              { label: '125cc - 150cc', value: '125to150' },
              { label: 'Above 150cc', value: 'above150' },
            ]}
            style={pickerStyles}
            useNativeAndroidPickerStyle={false}
          />
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.label}>Price Range (Per Day)</Text>
          <RNPickerSelect
            onValueChange={(value) => setPriceRange(value)}
            value={priceRange}
            items={[
              { label: 'All Prices', value: 'all' },
              { label: 'Below ₱500', value: 'below500' },
              { label: '₱500 - ₱700', value: '500to700' },
              { label: 'Above ₱700', value: 'above700' },
            ]}
            style={pickerStyles}
            useNativeAndroidPickerStyle={false}
          />
        </View>

        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default EnhancedFilterScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f8f8f8',
  },
  headerContainer: {
    width: '100%',
    height: 100,
    backgroundColor: 'red',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  subHeader: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 8,
  },
  applyButton: {
    backgroundColor: 'red',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

const pickerStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 8,
    color: 'red',
    paddingRight: 30,
    backgroundColor: '#fff',
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 8,
    color: 'red',
    paddingRight: 30,
    backgroundColor: '#fff',
  },
}; 