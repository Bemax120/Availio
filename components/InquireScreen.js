import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  BackHandler,
  Image,
} from "react-native";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
import { useFocusEffect } from "@react-navigation/native";

export default function InquireScreen({ route, navigation }) {
  const { bookingId, totalPrice, motorcycle } = route.params;
  const auth = getAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState("");
  const [motorcycleName, setMotorcycleName] = useState("");
  const [bookingStatus, setBookingStatus] = useState("");
  const [rentalDuration, setRentalDuration] = useState("");

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return;

      try {
        const bookingRef = doc(db, "bookings", bookingId);
        const bookingSnap = await getDoc(bookingRef);

        if (bookingSnap.exists()) {
          const bookingData = bookingSnap.data();
          setBooking({ id: bookingSnap.id, ...bookingData });
          setBookingStatus(bookingData.bookingStatus);

          const vehicleId = bookingData.vehicleId;
          const vehicleRef = doc(db, "vehicles", vehicleId);
          const vehicleSnap = await getDoc(vehicleRef);

          if (vehicleSnap.exists()) {
            setMotorcycleName(vehicleSnap.data().name);
          }
        } else {
          console.error("Booking not found");
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  useEffect(() => {
    const date = new Date();
    const options = {
      weekday: "short",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    setCurrentDate(date.toLocaleDateString("en-US", options));
  }, []);

  useEffect(() => {
    const calculateDuration = () => {
      if (!booking?.pickupDate || !booking?.returnDate) return;
      const pickup = booking?.pickupDate;
      const returnD = booking?.returnDate;

      const diffInHours = (returnD - pickup) / (1000 * 60 * 60);
      setRentalDuration(`${Math.ceil(diffInHours / 24)} days`);
    };

    calculateDuration();
  }, [booking]);

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

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("HomeTabs", { screen: "Home" });
        return true;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);
      return () => {
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
      };
    }, [navigation])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>Loading booking details...</Text>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>Booking not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Booked</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.card}>
          <Image
            style={styles.vehicleImage}
            source={{ uri: motorcycle.image }}
          />
          <Text style={styles.dateText}>{currentDate}</Text>
          <Text style={styles.itemTitle}>
            {motorcycleName || "No Motorcycle Name"}
          </Text>
          <Text style={styles.price}>₱{totalPrice}</Text>

          <View style={styles.statusContainer}>
            <Text
              style={[
                styles.statusText,
                { color: bookingStatus === "Complete" ? "green" : "red" },
              ]}
            >
              {bookingStatus === "Complete"
                ? "Complete"
                : bookingStatus === "Cancelled"
                ? "Cancelled"
                : "Waiting for Confirmation"}
            </Text>
          </View>
        </View>

        <View style={styles.detailContainer}>
          <View style={styles.refundContainer}>
            <View style={styles.refundItem}>
              <Text style={styles.checkMark}>✅</Text>
              <Text style={styles.refundText}>Can be refunded</Text>
            </View>
            <View style={styles.refundItem}>
              <Text style={styles.crossMark}>❌</Text>
              <Text style={styles.refundText}>Can't reschedule</Text>
            </View>
          </View>

          <View style={styles.tenantInfoContainer}>
            <Text style={styles.sectionTitle}>{motorcycle.businessName}</Text>
            <Text style={styles.tenantContact}>
              {motorcycle.businessEmail} • {motorcycle.contactNumber}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Pick Up Time</Text>
            <Text style={styles.value}>
              {formatDateTime(booking.pickupDate)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Return Time</Text>
            <Text style={styles.value}>
              {formatDateTime(booking.returnDate)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Rental Duration</Text>
            <Text style={styles.value}>{rentalDuration}</Text>
          </View>

          {bookingStatus !== "Cancelled" && bookingStatus !== "Complete" ? (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={async () => {
                try {
                  const bookingRef = doc(db, "bookings", booking.id);
                  await updateDoc(bookingRef, {
                    bookingStatus: "Cancel",
                  });
                  navigation.navigate("HomeTabs", { screen: "Home" });
                } catch (error) {
                  console.error("Error updating booking status:", error);
                }
              }}
            >
              <Text style={styles.secondaryButtonText}>Cancel Booking</Text>
            </TouchableOpacity>
          ) : null}

          {bookingStatus !== "Cancelled" && (
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => {
                navigation.navigate("Chat", {
                  bookingNumber: booking.id,
                  itemName: motorcycle.name,
                  vendorName: "Scooter Gaming PH",
                });
              }}
            >
              <Text style={styles.primaryButtonText}>
                Contact the Rental Office
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.itemButton}
          onPress={() => {
            navigation.navigate("HomeTabs", { screen: "Home" });
          }}
        >
          <Text style={styles.itemButtonText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "red",
  },
  vehicleImage: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  header: {
    backgroundColor: "red",
    paddingVertical: 16,
    alignItems: "center",
  },
  bookNo: {
    color: "#fff",
    fontSize: 14,
    marginTop: 4,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  statusContainer: {
    backgroundColor: "#FEE2E2",
    padding: 8,
    alignItems: "center",
    borderRadius: 4,
    marginBottom: 16,
  },
  statusText: {
    color: "red",
    fontWeight: "bold",
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  refundContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  refundItem: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 8,
  },
  checkMark: {
    marginRight: 4,
  },
  crossMark: {
    marginRight: 4,
  },
  refundText: {
    fontSize: 14,
  },
  tenantInfoContainer: {
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tenantName: {
    fontSize: 14,
    fontWeight: "bold",
  },
  tenantContact: {
    fontSize: 14,
    color: "#666",
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: "bold",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
  },
  card: {
    borderRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  bookNumber: {
    fontSize: 16,
    fontWeight: "bold",
  },
  dateText: {
    fontSize: 14,
    color: "#555",
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  statusContainer: {
    justifyContent: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  statusText: {
    color: "red",
    fontSize: 14,
    fontWeight: "bold",
  },
  itemButton: {
    backgroundColor: "red",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignItems: "center",
  },
  itemButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  primaryButton: {
    backgroundColor: "red",
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  secondaryButton: {
    backgroundColor: "#fff",
    borderColor: "red",
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: "center",
    marginVertical: 10,
  },
  secondaryButtonText: {
    color: "red",
    fontSize: 16,
    fontWeight: "bold",
  },

  refundContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },

  detailContainer: {
    marginVertical: 10,
  },
});
