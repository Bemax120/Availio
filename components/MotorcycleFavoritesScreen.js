import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getAuth } from "firebase/auth";

const MotorcycleFavoritesScreen = () => {
  const navigation = useNavigation();
  const auth = getAuth();

  useEffect(() => {
    if (!auth.currentUser) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  }, [auth.currentUser]);
  const favoriteMotorcycles = [
    {
      id: 1,
      name: "Honda Beat",
      price: 500,
      rating: 4,
      location: "Lahug, Cebu City",
    },
    {
      id: 2,
      name: "Yamaha Mio Soul",
      price: 550,
      rating: 5,
      location: "Mandaue City",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Favorites</Text>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {favoriteMotorcycles.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.card}
            onPress={() =>
              navigation.navigate("MotorcycleDetail", { motorcycle: item })
            }
          >
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>Image</Text>
            </View>

            <View style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <Text style={styles.bikeName}>{item.name}</Text>
                <Ionicons name="heart" size={24} color="#FF3B30" />
              </View>

              <View style={styles.infoRow}>
                <Ionicons name="location" size={16} color="#666" />
                <Text style={styles.locationText}>{item.location}</Text>
              </View>

              <View style={styles.priceRow}>
                <Text style={styles.priceText}>₱{item.price}/day</Text>
                <View style={styles.ratingBadge}>
                  <Ionicons name="star" size={14} color="white" />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity style={styles.removeButton}>
              <Text style={styles.removeButtonText}>Remove</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#333",
    padding: 20,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  scrollContainer: {
    padding: 15,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imagePlaceholder: {
    width: "100%",
    height: 180,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  placeholderText: {
    color: "white",
    fontSize: 16,
  },
  cardContent: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  bikeName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    color: "#666",
    marginLeft: 5,
    fontSize: 14,
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FF3B30",
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FF9529",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  ratingText: {
    color: "white",
    fontWeight: "600",
    marginLeft: 4,
  },
  removeButton: {
    borderTopWidth: 1,
    borderTopColor: "#EEE",
    padding: 15,
    alignItems: "center",
  },
  removeButtonText: {
    color: "#FF3B30",
    fontWeight: "600",
  },
});

export default MotorcycleFavoritesScreen;
