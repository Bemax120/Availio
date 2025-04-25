import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Calendar } from "react-native-calendars";
import { Picker } from "@react-native-picker/picker";
import { useRoute } from "@react-navigation/native";

export default function DateTimePickerScreen({ navigation }) {
  const route = useRoute();

  const vehicleType = route.params?.vehicleType || null;
  const locationFilter = route.params?.locationFilter || null;

  const [selectedDates, setSelectedDates] = useState({});
  const [pickUpTime, setPickUpTime] = useState("10:00 AM");
  const [returnTime, setReturnTime] = useState("9:00 PM");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

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

  const confirmSelection = () => {
    if (!startDate || !endDate) {
      Alert.alert("Missing Info", "Please select a start and end date.");
      return;
    }

    navigation.navigate("Filter", {
      startDate,
      endDate,
      pickUpTime,
      returnTime,
      vehicleType,
      locationFilter,
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Set Booking Time</Text>
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
        <Picker
          onValueChange={(value) => setPickUpTime(value)}
          selectedValue={pickUpTime}
        >
          <Picker.Item label="9:00 PM" value="9:00 PM" />
          <Picker.Item label="10:00 PM" value="10:00 PM" />
          <Picker.Item label="11:00 PM" value="11:00 PM" />
        </Picker>
      </View>

      <View style={styles.pickerContainer}>
        <Text>Return time</Text>
        <Picker
          onValueChange={(value) => setReturnTime(value)}
          selectedValue={returnTime}
        >
          <Picker.Item label="9:00 PM" value="9:00 PM" />
          <Picker.Item label="10:00 PM" value="10:00 PM" />
          <Picker.Item label="11:00 PM" value="11:00 PM" />
        </Picker>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={confirmSelection}>
        <Text style={styles.confirmButtonText}>Confirm</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 12,
    backgroundColor: "#FCFBF4",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  pickerContainer: {
    marginTop: 20,
  },
  confirmButton: {
    backgroundColor: "red",
    padding: 16,
    borderRadius: 10,
    marginTop: 30,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
