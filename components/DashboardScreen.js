import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  BackHandler,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";

const DashboardScreen = () => {
  const [searchText, setSearchText] = useState("");
  const [scooters, setScooters] = useState([]);
  const [allScooters, setAllScooters] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();

  // Function to fetch scooters from Firestore
  const fetchScooters = useCallback(() => {
    const scootersRef = collection(db, "vehicles");

    const unsubscribe = onSnapshot(scootersRef, (snapshot) => {
      const scootersList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setScooters(scootersList);
      setAllScooters(scootersList);
    });

    return unsubscribe;
  }, []);

  // Fetch scooters when the screen is focused
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = fetchScooters();
      return () => unsubscribe();
    }, [fetchScooters])
  );

  // Handle search input change
  const handleSearch = () => {
    if (!searchText) {
      setScooters(allScooters); // Reset to all scooters if search is empty
      return;
    }

    const lowercaseSearch = searchText.toLowerCase();
    const filteredScooters = allScooters.filter((scooter) =>
      scooter.name.toLowerCase().startsWith(lowercaseSearch)
    );

    setScooters(filteredScooters);
  };

  // Handle pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchScooters();
    setRefreshing(false);
  }, [fetchScooters]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("Filter");
        return true;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () => {
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      };
    }, [navigation])
  );

  useEffect(() => {
    if (!searchText) {
      setScooters(allScooters);
      return;
    }

    const lowercaseSearch = searchText.toLowerCase();
    const filteredScooters = allScooters.filter((scooter) =>
      scooter.name.toLowerCase().includes(lowercaseSearch)
    );

    setScooters(filteredScooters);
  }, [searchText, allScooters]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.bannerContainer}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Enjoy Scooter Gaming Services and pay easily
          </Text>
        </View>
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Enjoy Scooter Gaming Services and pay easily
          </Text>
        </View>
      </ScrollView>

      <View style={styles.unitsContainer}>
        <Text style={styles.unitsTitle}>Available Units</Text>
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
              onPress={() =>
                navigation.navigate("MotorcycleDetail", { motorcycle: scooter })
              }
            >
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {scooter.images.map((imgUrl, index) => (
                  <Image
                    key={index}
                    source={{ uri: imgUrl }}
                    style={styles.scooterImage}
                  />
                ))}
              </ScrollView>

              <View style={styles.floatingBox}>
                <Text style={styles.floatingText}>
                  ₱{scooter.pricePerDay}/day
                </Text>
              </View>

              <Text style={styles.scooterName}>{scooter.name}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noResults}>No vehicles available</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  searchBar: {
    flex: 1,
    height: 40,
    borderColor: "#ccc",
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
    backgroundColor: "#d1d8e0",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },

  bannerText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },

  unitsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
  },

  unitsTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  seeAllText: {
    color: "red",
  },

  scooterList: {
    flexDirection: "col",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },

  scooterCard: {
    position: "relative",
    backgroundColor: "#FFFFFF",
    width: "100%",
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },

  floatingBox: {
    position: "absolute",
    right: 10,
    bottom: "10%",
    justifyContent: "flex-end",
    alignItems: "flex-end",
    backgroundColor: "#FFFFFF",
    padding: 10,
    width: "32%",
    height: "20%",
    borderRadius: 5,
    zIndex: 10,
    color: "red",
    elevation: 2,
  },

  floatingText: {
    font: "bold",
    color: "#8B0000",
    fontSize: 16,
  },

  scooterImage: {
    width: 300,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
  },

  scooterName: {
    marginTop: 15,
    fontSize: 16,
    fontWeight: "bold",
  },

  scooterCC: {
    fontSize: 14,
    color: "#666",
  },

  detailsButton: {
    backgroundColor: "red",
    borderRadius: 20,
    padding: 5,
  },

  detailsButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});

export default DashboardScreen;
