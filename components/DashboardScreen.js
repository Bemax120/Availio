import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from "../firebase/firebaseConfig";

const DashboardScreen = () => {
  const [searchText, setSearchText] = useState('');
  const [scooters, setScooters] = useState([]);
  const navigation = useNavigation();

  // Fetch scooters from Firestore
  const fetchScooters = async () => {
    try {
      const scootersRef = collection(db, 'vehicles');
      const snapshot = await getDocs(scootersRef);
      const scootersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setScooters(scootersList);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  useEffect(() => {
    fetchScooters();
  }, []);

  // Handle search and navigate to MotorcycleList screen
  const handleSearch = async () => {
    if (!searchText) {
      fetchScooters(); // Reset to full list if search is empty
      return;
    }
  
    try {
      const lowercaseSearch = searchText.toLowerCase();
      const scootersRef = collection(db, 'vehicles');
      const snapshot = await getDocs(scootersRef);
  
      const filteredScooters = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(scooter => scooter.name.toLowerCase().startsWith(lowercaseSearch)); // Case-insensitive prefix match
  
      setScooters(filteredScooters);
    } catch (error) {
      console.error('Error searching vehicles:', error);
    }
  };
  
  


  return (
    <ScrollView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search Scooter"
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity onPress={handleSearch} style={styles.searchIcon}>
          <Ionicons name="search" size={24} color="gray" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.bannerContainer}>
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Enjoy Scooter Gaming Services and pay easily</Text>
        </View>
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Enjoy Scooter Gaming Services and pay easily</Text>
        </View>
      </ScrollView>

      <View style={styles.unitsContainer}>
        <Text style={styles.unitsTitle}>Our Units</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>See All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.scooterList}>
      {scooters.length > 0 ? (
        scooters.map((scooter) => (
          <TouchableOpacity
            key={scooter.id}
            style={styles.scooterCard}
            onPress={() => navigation.navigate('MotorcycleDetail', { motorcycle: scooter })}
          >
            <Image source={{ uri: scooter.displayImg }} style={styles.scooterImage} />
            <Text style={styles.scooterName}>{scooter.name}</Text>
            <Text style={styles.scooterCC}>{scooter.cc}</Text>
            <Text style={styles.scooterPrice}>{scooter.pricePerDay} Per Day</Text>
            <TouchableOpacity style={styles.detailsButton}>
              <Text style={styles.detailsButtonText}></Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      ): (
    <Text style={styles.noResults}>No vehicles available</Text>
    )}
       
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  searchIcon: {
    marginLeft: 10,
  },
  bannerContainer: {
    marginVertical: 10,
  },
  banner: {
    width: 300,
    height: 150,
    backgroundColor: '#d1d8e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  bannerText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  unitsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  unitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  seeAllText: {
    color: 'red',
  },
  scooterList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 10,
  },
  scooterCard: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  scooterImage: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  scooterName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  scooterCC: {
    fontSize: 14,
    color: '#666',
  },
  scooterPrice: {
    fontSize: 16,
    color: 'red',
    marginBottom: 10,
  },
  detailsButton: {
    backgroundColor: 'red',
    borderRadius: 20,
    padding: 5,
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default DashboardScreen; 