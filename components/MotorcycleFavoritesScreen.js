import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getAuth } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  deleteDoc,
} from "firebase/firestore";
import Toast from "react-native-toast-message";

const db = getFirestore();

const getAverageRating = async (ref) => {
  const snap = await getDocs(ref);
  const ratings = snap.docs.map((d) => d.data().rating).filter(Boolean);
  const total = ratings.reduce((sum, r) => sum + r, 0);
  return ratings.length ? total / ratings.length : 0;
};

const buildFavoriteVehicle = async (vehicleId) => {
  try {
    const vehicleRef = doc(db, "vehicles", vehicleId);
    const vehicleSnap = await getDoc(vehicleRef);
    if (!vehicleSnap.exists()) return null;

    const vehicleData = vehicleSnap.data();
    const supplierRef = doc(db, "users", vehicleData.ownerId);
    const supplierSnap = await getDoc(supplierRef);
    const supplierData = supplierSnap.exists() ? supplierSnap.data() : {};

    const supplierRating = await getAverageRating(
      collection(db, "users", vehicleData.ownerId, "supplierRatings")
    );

    const vehicleRating = await getAverageRating(
      collection(db, "vehicles", vehicleId, "ratings")
    );

    return {
      id: vehicleId,
      ...vehicleData,
      businessProfile: supplierData.businessProfile || null,
      businessVerified: supplierData.businessVerified || false,
      businessName: supplierData.businessName || "Unknown",
      businessEmail: supplierData.businessEmail || "Unknown",
      contactNumber: supplierData.contactNumber || "Unknown",
      businessAddress: supplierData.businessAddress || null,
      supplierRating,
      vehicleRating,
      isFavorite: true,
    };
  } catch (err) {
    console.warn("Error building favorite vehicle:", err);
    return null;
  }
};

const MotorcycleFavoritesScreen = () => {
  const navigation = useNavigation();
  const user = getAuth().currentUser;

  const [favoriteVehicles, setFavoriteVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadFavorites = useCallback(() => {
    if (!user) return;

    const favRef = collection(db, "users", user.uid, "myFavorites");
    const unsubscribe = onSnapshot(favRef, async (snapshot) => {
      const vehicleIds = snapshot.docs.map((doc) => doc.data().vehicleId);
      const vehicles = await Promise.all(vehicleIds.map(buildFavoriteVehicle));
      setFavoriteVehicles(vehicles.filter(Boolean));
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user) {
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    }
  }, [user]);

  useFocusEffect(loadFavorites);

  const handleRemove = async (vehicleId) => {
    try {
      const favRef = doc(db, "users", user.uid, "myFavorites", vehicleId);
      await deleteDoc(favRef);
      Toast.show({ type: "success", text1: "Removed from favorites" });
    } catch (error) {
      console.error("Error removing favorite:", error);
      Toast.show({ type: "error", text1: "Error removing from favorites" });
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    const favRef = collection(db, "users", user.uid, "myFavorites");
    const snapshot = await getDocs(favRef);
    const vehicleIds = snapshot.docs.map((doc) => doc.data().vehicleId);
    const vehicles = await Promise.all(vehicleIds.map(buildFavoriteVehicle));
    setFavoriteVehicles(vehicles.filter(Boolean));
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Favorites</Text>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="tomato" />
          </View>
        ) : favoriteVehicles.length === 0 ? (
          <Text style={styles.emptyText}>Nothing Here Yet</Text>
        ) : (
          favoriteVehicles.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate("MotorcycleDetail", { motorcycle: item })
              }
            >
              {item.defaultImg ? (
                <Image
                  source={{ uri: item.defaultImg }}
                  style={styles.imagePlaceholder}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.placeholderText}>No Image</Text>
                </View>
              )}

              <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text style={styles.bikeName}>{item.name}</Text>
                  <Ionicons name="heart" size={24} color="#FF3B30" />
                </View>

                <View style={styles.infoRow}>
                  <Ionicons name="location" size={16} color="#666" />
                  <Text style={styles.locationText}>
                    {item.businessAddress?.description || "Unknown Location"}
                  </Text>
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.priceText}>₱{item.pricePerDay}/day</Text>
                  <View style={styles.ratingBadge}>
                    <Ionicons name="star" size={14} color="white" />
                    <Text style={styles.ratingText}>
                      {item.vehicleRating?.toFixed(1) || 0}
                    </Text>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemove(item.id)}
              >
                <Text style={styles.removeButtonText}>Remove</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

export default MotorcycleFavoritesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 60,
    backgroundColor: "#FCFBF4",
  },
  screenTitle: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  scrollContainer: { paddingBottom: 20 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
    color: "#666",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    padding: 12,
    elevation: 3,
  },
  imagePlaceholder: {
    height: 250,
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  placeholderText: { color: "#999" },
  cardContent: {},
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  bikeName: { fontSize: 18, fontWeight: "bold" },
  infoRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  locationText: { marginLeft: 4, color: "#666", maxWidth: "90%" },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    alignItems: "center",
  },
  priceText: { fontSize: 16, fontWeight: "600" },
  ratingBadge: {
    flexDirection: "row",
    backgroundColor: "#FFD700",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    alignItems: "center",
  },
  ratingText: { marginLeft: 4, color: "#fff", fontWeight: "bold" },
  removeButton: {
    marginTop: 10,
    padding: 6,
    backgroundColor: "#FF3B30",
    alignItems: "center",
    borderRadius: 8,
  },
  removeButtonText: { color: "#fff", fontWeight: "bold" },
});
