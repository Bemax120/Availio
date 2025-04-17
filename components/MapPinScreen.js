import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import { useNavigation } from "@react-navigation/native";
import MapView from "react-native-maps";

const screen = Dimensions.get("window");

const MapPinScreen = () => {
  const navigation = useNavigation();
  const [location, setLocation] = useState(null);
  const [centerLocation, setCenterLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [loadingAddress, setLoadingAddress] = useState(false);

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
        locationAddress: address, // ← ADD THIS
      });
    } else {
      Alert.alert("Location not selected");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {location && (
        <MapView
          style={{ flex: 1 }}
          initialRegion={location}
          onRegionChangeComplete={handleRegionChangeComplete}
        />
      )}

      <View style={styles.markerFixed}>
        <Image
          source={require("../assets/location.png")}
          style={{ width: 40, height: 40 }}
        />
      </View>

      <View style={styles.addressContainer}>
        {loadingAddress ? (
          <ActivityIndicator color="#000" size="small" />
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
