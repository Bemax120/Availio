import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  ActivityIndicator,
  TextInput,
} from "react-native";
import * as Location from "expo-location";
import { useNavigation, useRoute } from "@react-navigation/native";
import MapView from "react-native-maps";

const screen = Dimensions.get("window");

const MapPinScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const vehicleType = route.params?.vehicleType || null;
  const startDate = route.params?.startDate;
  const endDate = route.params?.endDate;
  const pickUpTime = route.params?.pickUpTime;
  const returnTime = route.params?.returnTime;

  const [location, setLocation] = useState(null);
  const [centerLocation, setCenterLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const mapRef = useRef(null);
  const [searchText, setSearchText] = useState("");

  const debounceTimeout = useRef(null);

  useEffect(() => {
    if (!searchText.trim()) return;

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      handleManualSearch(); // Perform geocoding fallback
    }, 1000); // 1 second debounce
  }, [searchText]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied to access location");
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      const region = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setLocation(region);
      setCenterLocation({
        latitude: region.latitude,
        longitude: region.longitude,
      });

      fetchAddress(region.latitude, region.longitude);
    })();
  }, []);

  const handleManualSearch = async () => {
    if (!searchText.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchText
        )}&format=json&limit=1`,
        {
          headers: {
            "User-Agent": "Availio/1.0 (kennethrex456@gmail.com)", // Replace with your app/email
            "Accept-Language": "en",
          },
        }
      );

      const data = await response.json();

      if (data.length > 0) {
        const result = data[0];
        const lat = parseFloat(result.lat);
        const lon = parseFloat(result.lon);

        const newRegion = {
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setLocation(newRegion);
        setCenterLocation({ latitude: lat, longitude: lon });

        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }

        fetchAddress(lat, lon);
      } else {
        Alert.alert("Location not found", "Try a more specific query.");
      }
    } catch (error) {
      console.error("Nominatim search failed:", error);
      Alert.alert("Search error", "Something went wrong while searching.");
    }
  };

  const fetchAddress = async (latitude, longitude) => {
    try {
      setLoadingAddress(true);
      const [geo] = await Location.reverseGeocodeAsync({ latitude, longitude });
      const formatted = `${geo?.name || ""} ${geo?.street || ""}, ${
        geo?.city || ""
      }, ${geo?.region || ""}`;
      setAddress(formatted);
    } catch (err) {
      console.error("Failed to get address:", err);
      setAddress("Unable to retrieve address");
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleRegionChangeComplete = (region) => {
    const coords = {
      latitude: region.latitude,
      longitude: region.longitude,
    };
    setCenterLocation(coords);
    fetchAddress(coords.latitude, coords.longitude);
  };

  const handleConfirmLocation = () => {
    if (centerLocation) {
      navigation.navigate("Filter", {
        locationFilter: centerLocation,
        locationAddress: address,
        vehicleType,
        startDate,
        endDate,
        pickUpTime,
        returnTime,
      });
    } else {
      Alert.alert("Location not selected");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search for a location"
            value={searchText}
            onChangeText={setSearchText}
            style={styles.textInput}
          />
        </View>
      </View>

      {location && (
        <MapView
          ref={mapRef}
          style={{ flex: 1 }}
          initialRegion={location}
          onRegionChangeComplete={handleRegionChangeComplete}
        ></MapView>
      )}

      <View style={styles.markerFixed}>
        <Image
          source={require("../assets/location.png")}
          style={{ width: 40, height: 40 }}
        />
      </View>

      <View style={styles.addressContainer}>
        {loadingAddress ? (
          <ActivityIndicator color="#FCFBF4" size="small" />
        ) : (
          <Text style={styles.addressText}>
            {address || "Move the map to select a location"}
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={handleConfirmLocation}
      >
        <Text style={styles.confirmButtonText}>Confirm Location</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  searchBox: {
    position: "absolute",
    top: 10,
    width: "90%",
    alignSelf: "center",
    zIndex: 999,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    fontSize: 16,
  },
  searchContainer: {
    position: "absolute",
    top: 50,
    left: 10,
    right: 10,
    zIndex: 999,
  },
  markerFixed: {
    position: "absolute",
    top: screen.height / 2 - 40,
    left: screen.width / 2 - 20,
    zIndex: 999,
  },
  addressContainer: {
    position: "absolute",
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    elevation: 3,
  },
  addressText: {
    fontSize: 14,
    textAlign: "center",
  },
  confirmButton: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default MapPinScreen;
