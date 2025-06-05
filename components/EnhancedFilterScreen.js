import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import useFilterStore from "../context/filterStore";

const EnhancedFilterScreen = () => {
  const navigation = useNavigation();
  const {
    vehicleType,
    locationAddress,
    locationFilter,
    startDate,
    endDate,
    pickUpTime,
    returnTime,
    setVehicleType,
  } = useFilterStore();

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
    if (!locationAddress || locationAddress === "Near Me") {
      Alert.alert("Address is empty", "Please Select A Location!");
      return;
    }

    if (!startDate || !endDate || !pickUpTime || !returnTime) {
      Alert.alert("No Booking Date", "Please Select A Booking Date!");
      return;
    }

    navigation.replace("HomeTabs", {
      filters: {
        vehicleType,
        locationAddress,
        locationFilter,
        startDate,
        endDate,
        pickUpTime,
        returnTime,
      },
    });
  };

  const topGradient = vehicleType === "2 Wheels" ? "#ffa3a6" :
                      vehicleType === "4 Wheels" ? "#6497b1" : "#E4A0F7";
  const bottomGradient = vehicleType === "2 Wheels" ? "#ffeded" :
                         vehicleType === "4 Wheels" ? "#b3cde0" : "#D7BFDC";

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <LinearGradient
        colors={[topGradient, bottomGradient]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.headerContainer}
      >
        <Text style={styles.headerText}>Preference</Text>
        {vehicleType === "2 Wheels" ? (
          <MaterialIcons name="two-wheeler" size={75} color="red" style={styles.vehicleIcon} />
        ) : vehicleType === "4 Wheels" ? (
          <Ionicons name="car-sport" size={75} color="blue" style={styles.vehicleIcon} />
        ) : (
          <>
            <MaterialIcons name="two-wheeler" size={75} color="#702963" style={[styles.vehicleIcon, { right: 100 }]} />
            <Ionicons name="car-sport" size={75} color="#702963" style={styles.vehicleIcon} />
          </>
        )}
      </LinearGradient>

      <View style={styles.container}>
        {/* Location Button */}
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() =>
            navigation.navigate("MapPinScreen", {
              vehicleType,
              startDate,
              endDate,
              pickUpTime,
              returnTime,
            })
          }
        >
          <View style={styles.row}>
            <Ionicons name="search" size={20} color="gray" />
            <Text style={styles.mapButtonText}>
              {locationAddress ? `(${locationAddress})` : "Select location"}
            </Text>
          </View>
          <Ionicons name="send" size={20} color="black" />
        </TouchableOpacity>

        {/* Booking Date Button */}
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() =>
            navigation.navigate("DateTimePicker", {
              vehicleType,
              locationFilter,
              locationAddress,
            })
          }
        >
          <Ionicons name="calendar" size={20} color="gray" />
          <Text style={styles.mapButtonText}>
            {startDate && endDate && pickUpTime && returnTime
              ? "Reselect Booking Date"
              : "Select Booking Date"}
          </Text>
        </TouchableOpacity>

        {/* Selected Date Preview */}
        {startDate && endDate && pickUpTime && returnTime && (
          <View style={styles.datePreviewRow}>
            <View style={styles.dateBadge}>
              <Ionicons name="time" size={20} color="gray" />
              <Text>{formattedStart}</Text>
            </View>
            <View style={styles.dateBadge}>
              <Ionicons name="time" size={20} color="gray" />
              <Text>{formattedEnd}</Text>
            </View>
          </View>
        )}

        {/* Vehicle Type Picker */}
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={vehicleType}
            onValueChange={(itemValue) => setVehicleType(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="All Vehicles" value={null} />
            <Picker.Item label="2 Wheels" value="2 Wheels" />
            <Picker.Item label="4 Wheels" value="4 Wheels" />
          </Picker>
        </View>

        {/* Buttons */}
        <View style={styles.bottomButtonRow}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("MapBusinessScreen", {
                vehicleType,
                locationAddress,
                startDate,
                endDate,
                pickUpTime,
                returnTime,
                screen: "Filter",
              })
            }
            style={styles.mapIconButton}
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

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#f8f8f8",
  },
  headerContainer: {
    height: 150,
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    justifyContent: "center",
    position: "relative",
  },
  headerText: {
    fontSize: 20,
    fontFamily: "Inter-Semibold",
    marginTop: 10,
  },
  vehicleIcon: {
    position: "absolute",
    bottom: 30,
    right: 25,
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
  mapButton: {
    backgroundColor: "#ECECEC",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 100,
    marginBottom: 20,
  },
  dateButton: {
    flexDirection: "row",
    backgroundColor: "#ECECEC",
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 100,
    gap: 5,
    marginBottom: 20,
    alignItems: "center",
  },
  mapButtonText: {
    color: "#3f3f3f",
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  datePreviewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  dateBadge: {
    backgroundColor: "#ECECEC",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  pickerContainer: {
    backgroundColor: "#ECECEC",
    paddingHorizontal: 16,
    borderRadius: 100,
    marginBottom: 20,
  },
  picker: {
    width: "100%",
  },
  bottomButtonRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  mapIconButton: {
    paddingHorizontal: 12,
    borderColor: "gray",
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 100,
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

export default EnhancedFilterScreen;
