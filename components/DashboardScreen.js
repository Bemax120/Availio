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
  ActivityIndicator,
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  onSnapshot,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import Icon from "react-native-vector-icons/MaterialIcons";
import { Picker } from "@react-native-picker/picker";
import { getAuth } from "firebase/auth";
import Toast from "react-native-toast-message";

const calculateDistance = (loc1, loc2) => {
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(loc2.latitude - loc1.latitude);
  const dLon = toRad(loc2.longitude - loc1.longitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(loc1.latitude)) *
      Math.cos(toRad(loc2.latitude)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const DashboardScreen = ({ route }) => {
  const filters = route?.params?.filters || {};
  const locationFilter = filters.locationFilter;
  const vehicleFilter = filters.vehicleType;

  const startDate = filters.startDate;
  const endDate = filters.endDate;
  const pickUpTime = filters.pickUpTime;
  const returnTime = filters.returnTime;
  const methodType = filters.methodType;

  const [searchText, setSearchText] = useState("");
  const [scooters, setScooters] = useState([]);
  const [allScooters, setAllScooters] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(true);

  const [displacementFilter, setDisplacementFilter] = useState(null);
  const [priceFilter, setPriceFilter] = useState(null);
  const [vehicleRatingFilter, setVehicleRatingFilter] = useState(null);
  const [businessRatingFilter, setBusinessRatingFilter] = useState(null);

  const clearFilters = () => {
    setSearchText("");
    setDisplacementFilter(null);
    setPriceFilter(null);
    setVehicleRatingFilter(null);
    setBusinessRatingFilter(null);
  };

  const applyFilters = () => {
    let filtered = [...allScooters];

    // Vehicle Type
    if (vehicleFilter) {
      filtered = filtered.filter(
        (scooter) => scooter.vehicleType === vehicleFilter
      );
    }

    // Displacement Range
    if (displacementFilter) {
      const [min, max] = displacementFilter.split("-").map(Number);
      filtered = filtered.filter((scooter) => {
        const cc = parseInt(scooter.cchp);
        return cc >= min && cc <= max;
      });
    }

    // Price Filter
    if (priceFilter) {
      const [minPrice, maxPrice] = priceFilter.split("-").map(Number);
      filtered = filtered.filter((scooter) => {
        const price = parseFloat(scooter.pricePerDay);
        return price >= minPrice && price <= maxPrice;
      });
    }

    // Vehicle Rating Filter
    if (vehicleRatingFilter) {
      const [minRating, maxRating] = vehicleRatingFilter.split("-").map(Number);
      filtered = filtered.filter((scooter) => {
        const rating = parseFloat(scooter.vehicleRating);
        return rating >= minRating && rating <= maxRating;
      });
    }

    if (businessRatingFilter) {
      const [minRating, maxRating] = businessRatingFilter
        .split("-")
        .map(Number);
      filtered = filtered.filter((scooter) => {
        const rating = parseFloat(scooter.supplierRating);
        return rating >= minRating && rating <= maxRating;
      });
    }

    // Search Filter
    if (searchText.trim() !== "") {
      const lowercaseSearch = searchText.toLowerCase();
      filtered = filtered.filter((scooter) =>
        scooter.name.toLowerCase().includes(lowercaseSearch)
      );
    }

    // Sort by distance if specified
    if (filters.sortOrder === "nearest") {
      filtered.sort(
        (a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity)
      );
    } else if (filters.sortOrder === "farthest") {
      filtered.sort((a, b) => (b.distance ?? 0) - (a.distance ?? 0));
    }

    setScooters(filtered);
  };

  // Function to fetch scooters from Firestore
  const fetchScooters = useCallback(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    setIsLoading(true);
    const scootersRef = collection(db, "vehicles");

    const unsubscribe = onSnapshot(scootersRef, async (snapshot) => {
      const scooterPromises = snapshot.docs.map(async (scooterDoc) => {
        const scooterData = scooterDoc.data();
        const scooterId = scooterDoc.id;

        let supplierData = null;
        let supplierAverageRating = null;
        let supplierRatingCount = null;

        let vehicleAverageRating = null;
        let vehicleRatingCount = null;

        let isFavorite = false;

        try {
          // Fetch supplier
          const supplierRef = doc(db, "users", scooterData.ownerId);
          const supplierSnap = await getDoc(supplierRef);

          if (supplierSnap.exists()) {
            supplierData = supplierSnap.data();

            // Fetch supplier ratings
            const supplierRatingsRef = collection(
              db,
              "users",
              scooterData.ownerId,
              "supplierRatings"
            );
            const supplierRatingsSnap = await getDocs(supplierRatingsRef);

            const supplierRatings = supplierRatingsSnap.docs
              .map((doc) => doc.data().rating)
              .filter(Boolean);

            if (supplierRatings.length > 0) {
              const total = supplierRatings.reduce((sum, val) => sum + val, 0);
              supplierAverageRating = total / supplierRatings.length;
              supplierRatingCount = supplierRatings.length;
            }
          }

          if (userId) {
            const favoriteRef = doc(
              db,
              "users",
              userId,
              "myFavorites",
              scooterId
            );
            const favoriteSnap = await getDoc(favoriteRef);
            isFavorite = favoriteSnap.exists();
          }

          // Fetch vehicle ratings
          const vehicleRatingsRef = collection(
            db,
            "vehicles",
            scooterId,
            "ratings"
          );
          const vehicleRatingsSnap = await getDocs(vehicleRatingsRef);

          const vehicleRatings = vehicleRatingsSnap.docs
            .map((doc) => doc.data().rating)
            .filter(Boolean);

          if (vehicleRatings.length > 0) {
            const total = vehicleRatings.reduce((sum, val) => sum + val, 0);
            vehicleAverageRating = total / vehicleRatings.length;
            vehicleRatingCount = vehicleRatings.length;
          }
        } catch (err) {
          console.warn("Error fetching supplier or ratings:", err);
        }

        let distance = null;
        if (locationFilter && supplierData.businessCoordinates) {
          distance = calculateDistance(
            locationFilter,
            supplierData.businessCoordinates
          );
        }

        return {
          id: scooterId,
          ...scooterData,
          businessProfile: supplierData?.businessProfile || null,
          businessVerified: supplierData?.businessVerified || false,
          businessName: supplierData?.businessName || "Unknown",
          businessEmail: supplierData?.businessEmail || "Unknown",
          contactNumber: supplierData?.contactNumber || "Unknown",
          businessAddress: supplierData?.businessAddress || null,
          supplierRating: supplierAverageRating || 0,
          supplierRatingCount: supplierRatingCount || 0,
          vehicleRating: vehicleAverageRating || 0,
          vehicleRatingCount: vehicleRatingCount || 0,
          distance: distance ?? null,
          isFavorite,
        };
      });

      const scootersList = await Promise.all(scooterPromises);

      setScooters(scootersList);
      setAllScooters(scootersList);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const toggleFavorite = async (vehicleId) => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (!userId) return;

    const favoriteRef = doc(db, "users", userId, "myFavorites", vehicleId);

    try {
      const favoriteSnap = await getDoc(favoriteRef);

      if (favoriteSnap.exists()) {
        await deleteDoc(favoriteRef);
        Toast.show({
          type: "success",
          text1: "Removed from Favorites",
          visibilityTime: 1500,
        });
      } else {
        await setDoc(favoriteRef, {
          vehicleId,
          createdAt: new Date(),
        });
        Toast.show({
          type: "success",
          text1: "Added to Favorites",
          visibilityTime: 1500,
        });
      }

      setScooters((prev) =>
        prev.map((scooter) =>
          scooter.id === vehicleId
            ? { ...scooter, isFavorite: !scooter.isFavorite }
            : scooter
        )
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Could not update favorites.",
      });
    }
  };

  // Fetch scooters when the screen is focused
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = fetchScooters();
      return () => unsubscribe();
    }, [fetchScooters])
  );

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
    applyFilters();
  }, [
    allScooters,
    displacementFilter,
    priceFilter,
    vehicleRatingFilter,
    businessRatingFilter,
    searchText,
    vehicleFilter,
    filters.sortOrder,
  ]);

  const renderStars = (rating) => {
    const stars = [];

    const filled = Math.floor(rating);
    const hasHalf = rating - filled >= 0.5;

    for (let i = 0; i < filled; i++) {
      stars.push(
        <Icon key={`full-${i}`} name="star" size={16} color="#FFD700" />
      );
    }

    if (hasHalf) {
      stars.push(
        <Icon key="half" name="star-half" size={16} color="#FFD700" />
      );
    }

    while (stars.length < 5) {
      stars.push(
        <Icon
          key={`empty-${stars.length}`}
          name="star-border"
          size={16}
          color="#FFD700"
        />
      );
    }

    return <View style={{ flexDirection: "row", marginTop: 2 }}>{stars}</View>;
  };

  const RatingStatus = (rating) => {
    if (rating >= 4.5) return "Excellent";
    if (rating >= 4) return "Very Good";
    if (rating >= 3) return "Good";
    if (rating >= 2) return "Bad";
    if (rating >= 1) return "Very Bad";
    return "No Rating";
  };

  return (
    <View style={{ flex: 1, paddingTop: 60, backgroundColor: "#FCFBF4" }}>
      <TouchableOpacity
        onPress={() => navigation.navigate("MapBusinessScreen", { filters })}
        style={styles.mapIcon}
      >
        <Ionicons name="map" size={40} color="red" />
      </TouchableOpacity>
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
            onSubmitEditing={applyFilters}
          />
          <TouchableOpacity onPress={applyFilters} style={styles.searchIcon}>
            <Ionicons name="search" size={24} color="gray" />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={clearFilters}
              style={styles.pickerWrapper}
            >
              <Text>Clear Filters</Text>
            </TouchableOpacity>

            <View style={styles.pickerWrapper}>
              <Picker
                onValueChange={(value) => setDisplacementFilter(value)}
                selectedValue={displacementFilter}
                style={styles.pickerStyle}
              >
                <Picker.Item
                  label="Select Displacement"
                  value="Select Displacement"
                />
                <Picker.Item label="100cc - 150cc" value="100-150" />
                <Picker.Item label="150cc - 200cc" value="150-200" />
                <Picker.Item label="200cc - 300cc" value="200-300" />
                <Picker.Item label="300cc - 500cc" value="300-500" />
                <Picker.Item label="500cc - 1000cc" value="500-1000" />
              </Picker>
            </View>

            <View style={styles.pickerWrapper}>
              <Picker
                onValueChange={(value) => setPriceFilter(value)}
                selectedValue={priceFilter}
                style={styles.pickerStyle}
              >
                <Picker.Item
                  label="Select Price Range"
                  value="Select Price Range"
                />
                <Picker.Item label="Less Than ₱300" value="0-300" />
                <Picker.Item label="₱300 - ₱500" value="300-500" />
                <Picker.Item label="₱500 - ₱700" value="500-700" />
                <Picker.Item label="₱700 - ₱1000" value="700-1000" />
                <Picker.Item
                  label="Greater Than ₱1500"
                  value="1500-999999999"
                />
              </Picker>
            </View>

            <View style={styles.pickerWrapper}>
              <Picker
                onValueChange={(value) => setVehicleRatingFilter(value)}
                selectedValue={vehicleRatingFilter}
                style={styles.pickerStyle}
              >
                <Picker.Item
                  label="Select Vehicle Rating"
                  value="Select Vehicle Rating"
                />
                <Picker.Item label="★" value="0-1" />
                <Picker.Item label="★★" value="1-2" />
                <Picker.Item label="★★★" value="2-3" />
                <Picker.Item label="★★★★" value="3-4" />
                <Picker.Item label="★★★★★" value="4-5" />
              </Picker>
            </View>

            <View style={styles.pickerWrapper}>
              <Picker
                onValueChange={(value) => setBusinessRatingFilter(value)}
                selectedValue={businessRatingFilter}
                style={styles.pickerStyle}
              >
                <Picker.Item
                  label="Select Business Rating"
                  value="Select Business Rating"
                />
                <Picker.Item label="★" value="0-1" />
                <Picker.Item label="★★" value="1-2" />
                <Picker.Item label="★★★" value="2-3" />
                <Picker.Item label="★★★★" value="3-4" />
                <Picker.Item label="★★★★★" value="4-5" />
              </Picker>
            </View>
          </View>
        </ScrollView>

        <View style={styles.unitsContainer}>
          <Text style={styles.unitsTitle}>Available Units</Text>
        </View>

        <View style={styles.scooterList}>
          {isLoading ? (
            <View
              style={{
                width: "100%",
                justifyContent: "center",
                alignItems: "center",
                paddingVertical: 50,
              }}
            >
              <ActivityIndicator size="large" color="red" />
            </View>
          ) : scooters.length > 0 ? (
            scooters.map((scooter) => (
              <View
                style={{
                  position: "relative",
                  width: "100%",
                  backgroundColor: "#FFFFFF",
                }}
                key={scooter.id}
              >
                <TouchableOpacity
                  style={{
                    zIndex: 999,
                    position: "absolute",
                    right: 10,
                    top: 10,
                    backgroundColor: "#FCFBF4",
                    padding: 2,
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 100,
                  }}
                  onPress={() => toggleFavorite(scooter.id)}
                >
                  <Ionicons
                    name={scooter.isFavorite ? "heart" : "heart-outline"}
                    size={30}
                    color="#FF3B30"
                  />
                </TouchableOpacity>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {scooter.images.map((imgUrl, index) => (
                    <Image
                      key={index}
                      source={{ uri: imgUrl }}
                      style={styles.scooterImage}
                    />
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.scooterCard}
                  onPress={() =>
                    navigation.navigate("VehicleDetail", {
                      filters,
                      motorcycle: scooter,
                      startDate,
                      endDate,
                      pickUpTime,
                      returnTime,
                      methodType,
                    })
                  }
                >
                  <View style={styles.floatingBox}>
                    <View
                      style={{
                        height: 15,
                        width: "100%",
                        backgroundColor: "#EF0000",
                        borderTopStartRadius: 10,
                        borderTopEndRadius: 10,
                      }}
                    ></View>
                    <Text style={styles.floatingText}>
                      ₱{scooter.pricePerDay}/day
                    </Text>
                  </View>

                  <Text style={styles.scooterName}>{scooter.name}</Text>
                  <View style={styles.starLocation}>
                    {renderStars(scooter.vehicleRating ?? 0)}
                    <Icon name="location-pin" size={16} color="#4a5565" />
                  </View>
                  <Text style={styles.locationText}>
                    {scooter.businessAddress}
                  </Text>
                  {scooter.distance !== null && (
                    <Text
                      style={[
                        styles.locationText,
                        { fontStyle: "italic", color: "#4a5565" },
                      ]}
                    >
                      📍 {scooter.distance.toFixed(2)} km Away From You
                    </Text>
                  )}
                  <View style={styles.businessDetail}>
                    <Image
                      source={{ uri: scooter?.businessProfile }}
                      style={styles.smallIcon}
                    />
                    <Text style={styles.businessText}>
                      {scooter.businessName}
                    </Text>
                    {scooter.businessVerified ? (
                      <Icon name="verified" size={16} color="#4a5565" />
                    ) : (
                      <Icon name="help" size={16} color="#4a5565" />
                    )}
                  </View>

                  <View style={styles.businessRating}>
                    <Text style={styles.textRating}>
                      {scooter.supplierRating}
                    </Text>
                    <Text style={styles.textRating}>
                      {RatingStatus(scooter.supplierRating)}
                    </Text>
                    <Icon name="star" size={16} color="#FFD700" />
                    <Text style={styles.businessText}>Supplier Rating</Text>
                  </View>
                  <Text style={styles.businessText}>
                    {scooter.supplierRatingCount} Supplier User Ratings
                  </Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text style={styles.noResults}>No vehicles available</Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FCFBF4",
    position: "relative",
  },

  mapIcon: {
    position: "absolute",
    bottom: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },

  smallIcon: {
    width: 25,
    height: 25,
    borderRadius: 100,
  },

  textRating: {
    color: "#0047AB",
    fontWeight: "bold",
  },

  businessRating: {
    flexDirection: "row",
    alignItems: "center",
    color: "#4a5565",
    marginTop: 5,
    gap: 2,
  },

  businessDetail: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
    gap: 5,
  },

  businessText: {
    color: "#4a5565",
    fontSize: 12,
  },

  starLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  locationText: {
    color: "#4a5565",
    fontSize: 12,
  },

  userRatingText: {
    color: "#305CDE",
  },

  searchContainer: {
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    marginBottom: 10,
  },

  searchBar: {
    flex: 1,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#FFFFFF",
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
    flexDirection: "col",
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
    borderRadius: 5,
    zIndex: 10,
    color: "red",
    elevation: 2,
  },

  floatingText: {
    padding: 10,
    font: "bold",
    color: "#EF0000",
    fontSize: 16,
    fontFamily: "Inter-Semibold",
  },

  scooterImage: {
    width: 300,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
  },

  scooterName: {
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

  noResults: {
    padding: 20,
  },

  pickerWrapper: {
    borderRadius: 100,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },

  pickerStyle: {
    height: 50,
    textAlign: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    color: "black",
    justifyContent: "center",
    width: 250,
    alignItems: "center",
  },
});

export default DashboardScreen;
