import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
  ScrollView,
  Image,
} from "react-native";
import { Timestamp, addDoc, doc, setDoc, collection } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";
const { width } = Dimensions.get("window");

export default function ConfirmBooking({ route, navigation }) {
  const { motorcycle, startDate, endDate, pickUpTime, returnTime } =
    route.params;
  const auth = getAuth();

  const [loading, setLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  const parseAMPMToDate = (dateStr, timeStr) => {
    const [hoursMinutes, meridian] = timeStr.split(" ");
    let [hours, minutes] = hoursMinutes.split(":").map(Number);

    if (meridian === "PM" && hours !== 12) hours += 12;
    if (meridian === "AM" && hours === 12) hours = 0;

    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day, hours, minutes);
  };

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
      const price = diffDays * Number(motorcycle.pricePerDay);
      setTotalPrice(price);
    }
  }, [startDate, endDate]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "long",
      day: "numeric",
    });
  };

  const formattedStart = formatDate(startDate);
  const formattedEnd = formatDate(endDate);

  const handleConfirmBooking = async () => {
    if (!auth.currentUser) {
      Alert.alert("Error", "You must be logged in to book.");
      return;
    }

    const userId = auth.currentUser.uid;

    try {
      const parsedPickup = parseAMPMToDate(startDate, pickUpTime);
      const parsedReturn = parseAMPMToDate(endDate, returnTime);

      const bookingData = {
        createdAt: Timestamp.now(),
        pickupDate: Timestamp.fromDate(parsedPickup),
        returnDate: Timestamp.fromDate(parsedReturn),
        renterId: userId,
        totalPrice,
        vehicleId: motorcycle.id,
        bookingStatus: "Pending",
        rated: false,
      };

      setLoading(true);

      const bookingRef = await addDoc(collection(db, "bookings"), bookingData);
      const bookingId = bookingRef.id;

      const userBookingRef = doc(db, "users", userId, "myBooking", bookingId);
      await setDoc(userBookingRef, { bookingId });

      setLoading(false);
      Alert.alert("Success", "Booking confirmed!");
      navigation.navigate("Inquire", { bookingId, totalPrice, motorcycle });
    } catch (error) {
      console.error("ConfirmBooking Error:", error);
      setLoading(false);
      Alert.alert("Error", "Something went wrong. Try again.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageCarousel}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
        >
          {motorcycle.images &&
            motorcycle.images.map((imageUrl, index) => (
              <Image
                key={index}
                source={{ uri: imageUrl }}
                style={styles.image}
                resizeMode="cover"
              />
            ))}
        </ScrollView>
      </View>
      <View style={{ padding: 20 }}>
        <Text style={styles.title}>Confirm Booking</Text>
        <Text>
          Motorcycle: {motorcycle.name} - {motorcycle.brand}
        </Text>
        <Text>
          From: {formattedStart} at {pickUpTime}
        </Text>
        <Text>
          To: {formattedEnd} at {returnTime}
        </Text>
        <Text>Total: ₱{totalPrice}</Text>

        <TouchableOpacity style={styles.button} onPress={handleConfirmBooking}>
          <Text style={styles.buttonText}>Confirm Booking</Text>
        </TouchableOpacity>

        <Modal visible={loading} transparent animationType="fade">
          <View style={styles.modal}>
            <ActivityIndicator size="large" color="red" />
            <Text style={{ color: "white", marginTop: 10 }}>
              Saving your booking...
            </Text>
          </View>
        </Modal>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  imageCarousel: {
    backgroundColor: "#eee",
  },
  image: {
    width: width,
    height: 265,
  },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  button: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 8,
    marginTop: 30,
    alignItems: "center",
  },
  buttonText: { color: "white", fontWeight: "bold", fontSize: 16 },
  modal: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});
