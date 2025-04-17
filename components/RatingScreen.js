import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
} from "react-native";
import { doc, getDoc, collection, addDoc, updateDoc } from "firebase/firestore";
import { FontAwesome } from "@expo/vector-icons";
import { db } from "../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

export default function RatingScreen({ route, navigation }) {
  const { bookingId } = route.params;
  const auth = getAuth();

  const [vehicleRating, setVehicleRating] = useState(0);
  const [supplierRating, setSupplierRating] = useState(0);
  const [vehicleComment, setVehicleComment] = useState("");
  const [supplierComment, setSupplierComment] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        // 1. Get the booking
        const bookingRef = doc(db, "bookings", bookingId);
        const bookingSnap = await getDoc(bookingRef);

        if (!bookingSnap.exists()) {
          console.warn("Booking not found");
          return;
        }

        const bookingData = bookingSnap.data();
        const vehicleId = bookingData.vehicleId;

        // 2. Get the vehicle
        const vehicleRef = doc(db, "vehicles", vehicleId);
        const vehicleSnap = await getDoc(vehicleRef);

        if (!vehicleSnap.exists()) {
          console.warn("Vehicle not found");
          return;
        }

        const vehicleData = vehicleSnap.data();
        setVehicle({ ...vehicleData, id: vehicleSnap.id });

        // 3. Get the supplier (owner)
        const ownerId = vehicleData.ownerId;
        const supplierRef = doc(db, "users", ownerId);
        const supplierSnap = await getDoc(supplierRef);

        if (supplierSnap.exists()) {
          setSupplier(supplierSnap.data());
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId]);

  const handleSubmit = async () => {
    if (vehicleRating === 0 || supplierRating === 0) {
      Alert.alert(
        "Missing Rating",
        "Please rate both the vehicle and the supplier."
      );
      return;
    }

    setLoading(true);
    try {
      const bookingRef = doc(db, "bookings", bookingId);
      await updateDoc(bookingRef, {
        rated: true,
      });
      // Save vehicle rating
      const vehicleRatingRef = collection(
        db,
        "vehicles",
        vehicle.id,
        "ratings"
      );
      await addDoc(vehicleRatingRef, {
        bookingId,
        rating: vehicleRating,
        comment: vehicleComment,
        createdAt: new Date(),
        userId: auth.currentUser.uid,
      });

      // Save supplier rating
      const supplierRatingRef = collection(
        db,
        "users",
        vehicle.ownerId,
        "supplierRatings"
      );
      await addDoc(supplierRatingRef, {
        bookingId,
        rating: supplierRating,
        comment: supplierComment,
        createdAt: new Date(),
        userId: auth.currentUser.uid,
      });

      Alert.alert("Success", "Thank you for your feedback!");
      navigation.goBack();
    } catch (error) {
      console.error("Error submitting rating:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating, setRating) => {
    return (
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => setRating(star)}>
            <FontAwesome
              name={star <= rating ? "star" : "star-o"}
              size={28}
              color="#FFC107"
              style={styles.starIcon}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { flexGrow: 1 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.heading}>Rate Your Experience</Text>

      <Image style={styles.vehicleImg} source={{ uri: vehicle?.defaultImg }} />
      <Text style={styles.label}>Rate The {vehicle?.name || "Vehicle"}</Text>
      {renderStars(vehicleRating, setVehicleRating)}

      <Text style={styles.label}>Comment To Vehicle (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Write your experience to the vehicle..."
        multiline
        value={vehicleComment}
        onChangeText={setVehicleComment}
      />

      <Image
        style={styles.businessImg}
        source={{ uri: supplier?.businessProfile }}
      />
      <Text style={styles.label}>
        Rate {supplier.businessName || "The Business"}
      </Text>
      {renderStars(supplierRating, setSupplierRating)}

      <Text style={styles.label}>Comment To Supplier (Optional)</Text>
      <TextInput
        style={styles.input}
        placeholder="Write your experience to supplier..."
        multiline
        value={supplierComment}
        onChangeText={setSupplierComment}
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Submit Rating</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  stars: {
    flexDirection: "row",
  },
  starIcon: {
    marginRight: 8,
  },
  vehicleImg: {
    width: "100%",
    height: 150,
    borderRadius: 10,
    marginVertical: 5,
  },

  businessImg: {
    width: 100,
    height: 100,
    borderRadius: 100,
    marginTop: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    minHeight: 80,
    textAlignVertical: "top",
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: "#EF0000",
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
