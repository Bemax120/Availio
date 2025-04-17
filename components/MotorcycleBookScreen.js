import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";

const MotorcycleBookScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Pending");
  const navigation = useNavigation();

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    setLoading(true);
    const myBookingRef = collection(db, "users", userId, "myBooking");

    const unsubscribe = onSnapshot(myBookingRef, async (snapshot) => {
      const bookingPromises = snapshot.docs.map(async (docSnap) => {
        const bookingId = docSnap.id;
        const bookingRef = doc(db, "bookings", bookingId);
        const bookingSnap = await getDoc(bookingRef);

        if (!bookingSnap.exists()) return null;

        const bookingData = bookingSnap.data();
        const vehicleRef = doc(db, "vehicles", bookingData.vehicleId);
        const vehicleSnap = await getDoc(vehicleRef);

        return {
          id: bookingId,
          bike: vehicleSnap.exists()
            ? vehicleSnap.data().name
            : "Unknown Vehicle",
          image: vehicleSnap.exists() ? vehicleSnap.data().defaultImg : null,
          date: formatDateTime(bookingData.createdAt),
          status: bookingData.bookingStatus,
          total: bookingData.totalPrice,
          rated: bookingData.rated,
        };
      });

      const resolvedBookings = (await Promise.all(bookingPromises)).filter(
        Boolean
      );
      setBookings(resolvedBookings);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, filter]);

  const formatDateTime = (value) => {
    if (!value) return "Invalid date";

    if (value.toDate) {
      value = value.toDate();
    } else {
      value = new Date(value);
    }

    if (isNaN(value)) return "Invalid date";

    return value.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const filteredBookings = bookings.filter((booking) => {
    switch (filter) {
      case "Pending":
        return booking.status === "Confirmed" || booking.status === "Pending";
      case "Complete":
        return booking.status === "Complete";
      case "On-Going":
        return booking.status === "On-Going";
      case "Cancelled":
        return booking.status === "Cancelled";
      default:
        return true;
    }
  });

  const StatusBadge = ({ status }) => {
    let backgroundColor;

    if (status === "Complete") {
      backgroundColor = "#4CD964";
    } else if (status === "Cancelled") {
      backgroundColor = "#FF3B30";
    } else if (status === "On-Going") {
      backgroundColor = "#FFA500";
    } else {
      backgroundColor = "#FFCC00";
    }

    return (
      <View style={[styles.statusBadge, { backgroundColor }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>My Bookings</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.segmentScroll}
      >
        <View style={styles.segmentContainer}>
          {["Pending", "Complete", "On-Going", "Cancelled"].map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.segmentButton,
                filter === item && styles.activeSegment,
              ]}
              onPress={() => {
                setLoading(true);
                setFilter(item);
              }}
            >
              <Text
                style={
                  filter === item
                    ? styles.activeSegmentText
                    : styles.segmentText
                }
              >
                {item === "On-Going" ? "Pending" : item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="red" />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scrollContainer}
          renderItem={({ item }) => (
            <View style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <View style={styles.bikeInfo}>
                  <Ionicons name="calendar" size={20} color="#4b6584" />
                  <Text style={styles.bookingDate}>{item.date}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.bookingContent}>
                {item.image ? (
                  <Image
                    source={{ uri: item.image }}
                    style={styles.bookingImage}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.placeholderText}>No Image</Text>
                  </View>
                )}
                <View style={styles.bookingDetails}>
                  <Text style={styles.bikeName}>{item.bike}</Text>
                  <Text style={styles.totalText}>Total: ₱ {item.total}</Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => {
                    navigation.navigate("Inquire", {
                      bookingId: item.id,
                      totalPrice: item.total,
                      motorcycle: item,
                    });
                  }}
                >
                  <Text style={styles.secondaryButtonText}>View Details</Text>
                </TouchableOpacity>

                {item.status === "Complete" && !item.rated ? (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => {
                      navigation.navigate("Rating", {
                        bookingId: item.id,
                      });
                    }}
                  >
                    <Text style={styles.primaryButtonText}>Rate</Text>
                  </TouchableOpacity>
                ) : item.status === "On-Going" ? (
                  <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => {
                      navigation.navigate("Inquire", {
                        bookingId: item.id,
                        totalPrice: item.total,
                        motorcycle: item,
                      });
                    }}
                  >
                    <Text style={styles.primaryButtonText}>Extend</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: "#F5F5F5" },
  screenTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#333",
    padding: 20,
    backgroundColor: "white",
  },
  segmentScroll: {
    marginVertical: 10,
  },

  segmentContainer: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 10,
    height: 40,
  },

  segmentButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#eee",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    height: 38,
  },

  activeSegment: {
    backgroundColor: "#EF0000",
  },

  segmentText: {
    color: "#333",
    fontSize: 14,
    fontWeight: "500",
  },

  activeSegmentText: {
    color: "#fff",
    fontWeight: "600",
  },
  scrollContainer: { padding: 15 },
  bookingCard: {
    backgroundColor: "white",
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  bikeInfo: { flexDirection: "row", alignItems: "center" },
  bookingDate: { marginLeft: 8, color: "black", fontWeight: "600" },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 15 },
  statusText: { color: "white", fontWeight: "600", fontSize: 12 },
  bookingContent: { flexDirection: "row", marginBottom: 15 },
  bookingImage: { width: 100, height: 80, borderRadius: 10 },
  imagePlaceholder: {
    width: 100,
    height: 80,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  placeholderText: { color: "white", fontSize: 12 },
  bookingDetails: { flex: 1, marginLeft: 15, justifyContent: "space-between" },
  bikeName: { fontSize: 18, fontWeight: "700", color: "#333" },
  totalText: { fontSize: 16, color: "#4CD964", fontWeight: "600" },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 10,
  },
  primaryButton: {
    backgroundColor: "#FF3B30",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  primaryButtonText: { color: "white", fontWeight: "600" },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "black",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  secondaryButtonText: { color: "#4b6584", fontWeight: "600" },
  loaderContainer: { justifyContent: "center", alignItems: "center" },
});

export default MotorcycleBookScreen;
