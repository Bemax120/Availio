import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Calendar } from "react-native-calendars";
import RNPickerSelect from "react-native-picker-select";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  arrayUnion,
  setDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { getAuth } from "firebase/auth";

export default function DateTimePickerScreen({ route, navigation }) {
  const { motorcycle } = route.params;
  const auth = getAuth();

  const [selectedDates, setSelectedDates] = useState({});
  const [pickUpTime, setPickUpTime] = useState("10:00 AM");
  const [returnTime, setReturnTime] = useState("9:00 PM");
  const [totalPrice, setTotalPrice] = useState(motorcycle.pricePerDay);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const onDayPress = (day) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(day.dateString);
      setEndDate(null);
      setSelectedDates({
        [day.dateString]: {
          startingDay: true,
          color: "red",
          textColor: "white",
        },
      });
    } else {
      const range = getDatesInRange(startDate, day.dateString);
      const newDates = {};
      range.forEach((date, index) => {
        newDates[date] = {
          color: "red",
          textColor: "white",
          startingDay: index === 0,
          endingDay: index === range.length - 1,
        };
      });
      setSelectedDates(newDates);
      setEndDate(day.dateString);
    }
  };

  const getDatesInRange = (start, end) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const dates = [];
    let currentDate = startDate;
    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split("T")[0]);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

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
      const daysSelected = Object.keys(selectedDates).length;
      setTotalPrice(daysSelected * Number(motorcycle.pricePerDay));
    }
  }, [selectedDates, motorcycle.pricePerDay]);

  const handleBooking = async () => {
    if (!startDate || !endDate) {
      Alert.alert("Error", "Please select a start and end date.");
      return;
    }

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
      Alert.alert("Success", "Your booking has been saved!");

      navigation.navigate("Inquire", { bookingId, totalPrice, motorcycle });
    } catch (error) {
      console.error("Booking Error:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to save booking. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Date & Time</Text>
      <Calendar
        onDayPress={onDayPress}
        markedDates={selectedDates}
        markingType={"period"}
        theme={{
          selectedDayBackgroundColor: "red",
          todayTextColor: "red",
          arrowColor: "red",
        }}
      />
      <View style={styles.pickerContainer}>
        <Text>Pick-up time</Text>
        <RNPickerSelect
          onValueChange={(value) => setPickUpTime(value)}
          items={[
            { label: "10:00 AM", value: "10:00 AM" },
            { label: "11:00 AM", value: "11:00 AM" },
          ]}
          value={pickUpTime}
        />
      </View>
      <View style={styles.pickerContainer}>
        <Text>Return time</Text>
        <RNPickerSelect
          onValueChange={(value) => setReturnTime(value)}
          items={[
            { label: "9:00 PM", value: "9:00 PM" },
            { label: "10:00 PM", value: "10:00 PM" },
          ]}
          value={returnTime}
        />
      </View>
      <View style={styles.footer}>
        <Text style={styles.priceText}>₱{totalPrice}</Text>
        <TouchableOpacity style={styles.bookButton} onPress={handleBooking}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={loading} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ActivityIndicator size="large" color="red" />
          <Text style={{ color: "white", marginTop: 10 }}>
            Processing your booking...
          </Text>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: "center",
  },
  pickerContainer: {
    marginVertical: 10,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  priceText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "red",
  },
  bookButton: {
    backgroundColor: "red",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
  },
  bookButtonText: {
    color: "#fff",
    fontSize: 16,
  },
});
