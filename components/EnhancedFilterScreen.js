import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";

const EnhancedFilterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const filters = route?.params?.filters || {};

  const locationAddress = route.params?.locationAddress || null;

  const locationFilter = route.params?.locationFilter || null;
  const startDate = route.params?.startDate;
  const endDate = route.params?.endDate;
  const pickUpTime = route.params?.pickUpTime;
  const returnTime = route.params?.returnTime;

  const [vehicleType, setVehicleType] = useState(null);

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
      vehicleType,
      locationAddress,
      locationFilter,
      startDate,
      endDate,
      pickUpTime,
      returnTime,
    };

    if(locationAddress == "Near Me" ||locationAddress == null ){
        Alert.alert("Address is empty", "Please Select A Location!");
        return;
      }else{
        
        if (!startDate || !endDate || !pickUpTime || !returnTime) {
          Alert.alert("No Booking Date", "Please Select A Booking Date!");
          return;
          Alert.alert("Address is empty", "Please Select A Location!");
        return;
         }
      }
    
    navigation.replace("HomeTabs", { filters });
  };

  let topGradient = "";
  let bottomGradient = "";

  if (vehicleType === "2 Wheels") {
    topGradient = "#ffa3a6";
    bottomGradient = "#ffeded";
  } else if (vehicleType === "4 Wheels") {
    topGradient = "#6497b1";
    bottomGradient = "#b3cde0";
  } else {
    topGradient = "#E4A0F7";
    bottomGradient = "#D7BFDC";
  }

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <LinearGradient
        colors={[topGradient, bottomGradient]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.headerContainer}
      >
        <Text
          style={{
            fontSize: 20,
            fontFamily: "Inter-Semibold",
            marginTop: 10,
          }}
        >
          Preference
        </Text>

        {vehicleType === "2 Wheels" ? (
          <MaterialIcons
            style={{ position: "absolute", bottom: 30, right: 25 }}
            name="two-wheeler"
            size={75}
            color="red"
          />
        ) : vehicleType === "4 Wheels" ? (
          <Ionicons
            style={{ position: "absolute", bottom: 30, right: 25 }}
            name="car-sport"
            size={75}
            color="blue"
          />
        ) : (
          <>
            <MaterialIcons
              style={{ position: "absolute", bottom: 30, right: 25 }}
              name="two-wheeler"
              size={75}
              color="#702963"
            />
            <Ionicons
              style={{ position: "absolute", bottom: 30, right: 100 }}
              name="car-sport"
              size={75}
              color="#702963"
            />
          </>
        )}
      </LinearGradient>

      <View style={styles.container}>
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
              paddingVertical: 4,
            }}
          >
            <Ionicons name="search" size={20} color="gray" />
            {locationAddress ? null : (
              <Text style={styles.mapButtonText}>Select location</Text>
            )}
            {locationAddress && (
              <Text style={{ maxWidth: 400, color: "#1e293b" }}>
                ({locationAddress})
              </Text>
            )}
          </View>

          <Ionicons name="send" size={20} color="black" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            flexDirection: "row",
            backgroundColor: "#ECECEC",
            paddingHorizontal: 12,
            paddingVertical: 16,
            borderRadius: 100,
            gap: 5,
            marginBottom: 20,
          }}
          onPress={() => {
            navigation.navigate("DateTimePicker", {
              vehicleType,
              locationFilter,
              locationAddress,
            });
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
            paddingHorizontal: 16,
            borderRadius: 100,
            gap: 5,
            marginBottom: 20,
            alignItems: "center",
          }}
        >
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

        <View
          style={{ flexDirection: "row", justifyContent: "center", gap: 12 }}
        >
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("MapBusinessScreen", {
                filters,
                vehicleType,
                locationAddress,
                startDate,
                endDate,
                pickUpTime,
                returnTime,
                screen: "Filter",
              })
            }
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
    position: "relative",
    height: 150,
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
  picker: {
    width: "100%",
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
