import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import RNPickerSelect from "react-native-picker-select";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const EnhancedFilterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const locationAddress = route.params?.locationAddress || null;
  const trimmedAddress = locationAddress
    ? locationAddress.substring(locationAddress.lastIndexOf(",") + 1).trim()
    : "";

  const locationFilter = route.params?.locationFilter || null;
  const startDate = route.params?.startDate;
  const endDate = route.params?.endDate;
  const pickUpTime = route.params?.pickUpTime;
  const returnTime = route.params?.returnTime;

  const [sortOrder, setSortOrder] = useState("none");

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

  const applyFilters = () => {
    const filters = {
      locationFilter,
      sortOrder,
      startDate,
      endDate,
      pickUpTime,
      returnTime,
    };
    if (!startDate || !endDate || !pickUpTime || !returnTime) {
      Alert.alert("No Booking Date", "Please Select A Booking Date!");
      return;
    }
    navigation.replace("HomeTabs", { filters });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <LinearGradient
        colors={["#ffa3a6", "#ffeded"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.headerContainer}
      ></LinearGradient>

      <View style={styles.container}>
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => navigation.navigate("MapPinScreen")}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Ionicons name="search" size={20} color="gray" />
            <Text style={styles.mapButtonText}>Near Me</Text>
            {locationAddress && (
              <Text style={{ maxWidth: 200, color: "#1e293b" }}>
                ({trimmedAddress})
              </Text>
            )}
          </View>

          <Ionicons name="send" size={20} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            backgroundColor: "#ECECEC",
            padding: 12,
            borderRadius: 100,
            gap: 5,
            marginBottom: 20,
          }}
          onPress={() => {
            navigation.navigate("DateTimePicker");
          }}
        >
          <Ionicons name="calendar" size={20} color="gray" />
          <Text style={styles.mapButtonText}>
            {startDate && endDate && pickUpTime && returnTime
              ? "Reselect Booking Date"
              : "Select Booking Date"}
          </Text>
        </TouchableOpacity>

        {startDate && endDate && pickUpTime && returnTime && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <View
              style={{
                backgroundColor: "#ECECEC",
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 100,
                flexDirection: "row",
                gap: 5,
              }}
            >
              <Ionicons name="time" size={20} color="gray" />
              <Text>{formattedStart}</Text>
            </View>

            <View
              style={{
                backgroundColor: "#ECECEC",
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 100,
                flexDirection: "row",
                gap: 5,
              }}
            >
              <Ionicons name="time" size={20} color="gray" />
              <Text>{formattedEnd}</Text>
            </View>
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            backgroundColor: "#ECECEC",
            paddingVertical: 4,
            paddingHorizontal: 16,
            borderRadius: 100,
            gap: 5,
            marginBottom: 20,
          }}
        >
          <RNPickerSelect
            onValueChange={(value) => setSortOrder(value)}
            value={sortOrder}
            items={[
              { label: "No Sorting", value: "none" },
              { label: "Nearest First", value: "nearest" },
              { label: "Farthest First", value: "farthest" },
            ]}
            useNativeAndroidPickerStyle={false}
            style={{ flex: 1 }}
          />
        </View>

        <View
          style={{ flexDirection: "row", justifyContent: "center", gap: 12 }}
        >
          <TouchableOpacity
            onPress={() => navigation.navigate("MapPinScreen")}
            style={{
              paddingHorizontal: 12,
              borderColor: "gray",
              borderWidth: 1,
              justifyContent: "center",
              alignContent: "center",
              borderRadius: 100,
            }}
          >
            <Ionicons name="map" size={20} color="red" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
            <Text style={styles.applyButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default EnhancedFilterScreen;

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#f8f8f8",
  },
  mapButton: {
    backgroundColor: "#ECECEC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 100,
    marginBottom: 20,
    gap: 5,
  },
  mapButtonText: {
    color: "#3f3f3f",
    fontSize: 16,
  },
  selectedLocationText: {
    textAlign: "center",
    fontSize: 14,
    flexWrap: "nowrap",
    overflow: "hidden",
    zIndex: -1,
    color: "#444",
  },
  headerContainer: {
    height: 100,
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: "center",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#00000",
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  subHeader: {
    fontSize: 18,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  filterSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: "#555",
    marginBottom: 8,
  },
  applyButton: {
    flex: 1,
    backgroundColor: "red",
    paddingVertical: 12,
    borderRadius: 100,
    alignItems: "center",
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

const pickerStyles = {
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 8,
    color: "red",
    paddingRight: 30,
    backgroundColor: "#fff",
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "red",
    borderRadius: 8,
    color: "red",
    paddingRight: 30,
    backgroundColor: "#fff",
  },
};
