import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const FilterScreen = () => {
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState('all'); // Options: 'all', 'scooters', 'cars'

  const applyFilter = () => {
    // Determine the wheels filter based on selection
    let wheels;
    if (selectedFilter === 'scooters') {
      wheels = 2;
    } else if (selectedFilter === 'cars') {
      wheels = 4;
    }
    // Pass both the wheels filter and the selected filter string to the next screen
    navigation.navigate('Dashboard', { wheelsFilter: wheels, selectedFilter });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Filter Vehicles</Text>
      <Text style={styles.subHeader}>Select what you want to see</Text>
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.optionButton, selectedFilter === 'all' && styles.selectedButton]}
          onPress={() => setSelectedFilter('all')}
        >
          <Text style={[styles.optionText, selectedFilter === 'all' && styles.selectedText]}>All Vehicles</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, selectedFilter === 'scooters' && styles.selectedButton]}
          onPress={() => setSelectedFilter('scooters')}
        >
          <Text style={[styles.optionText, selectedFilter === 'scooters' && styles.selectedText]}>Scooters (2 Wheels)</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.optionButton, selectedFilter === 'cars' && styles.selectedButton]}
          onPress={() => setSelectedFilter('cars')}
        >
          <Text style={[styles.optionText, selectedFilter === 'cars' && styles.selectedText]}>Cars (4 Wheels)</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.applyButton} onPress={applyFilter}>
        <Text style={styles.applyButtonText}>Apply Filter</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FilterScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'red',
  },
  subHeader: {
    fontSize: 16,
    marginBottom: 20,
    color: '#555',
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  optionButton: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: 'red',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  selectedButton: {
    backgroundColor: 'red',
  },
  optionText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedText: {
    color: '#fff',
  },
  applyButton: {
    backgroundColor: 'red',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 