import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialIcons";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

const FilterScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const filters = route?.params?.filters || {};

  const [vehicleRating, setVehicleRating] = useState(null);
  const [businessRating, setBusinessRating] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [priceRangeFilter, setPriceRangeFilter] = useState(null);
  const [minDisplacement, setMinDisplacement] = useState("100");
  const [maxDisplacement, setMaxDisplacement] = useState("1000");

  const applyFilter = () => {
    const dashboardFilters = {
      vehicleRating,
      businessRating,
      priceRangeFilter,
      displacementRangeFilter: minDisplacement + "-" + maxDisplacement,
    };
    navigation.navigate("HomeTabs", { filters, dashboardFilters });
  };

  const clearFilters = () => {
    navigation.navigate("HomeTabs", { filters, dashboardFilters: {} });
  };

  return (
    <View
      style={{ flex: 1, paddingTop: 60, backgroundColor: "#FCFBF4", gap: 20 }}
    >
      <View
        style={{
          width: "100%",
          paddingHorizontal: 20,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("HomeTabs", { filters });
          }}
        >
          <Ionicons name="arrow-back" size={30} color="gray" />
        </TouchableOpacity>
        <Text
          style={{
            fontFamily: "Inter-Semibold",
            textAlign: "center",
            fontSize: 20,
            width: "80%",
          }}
        >
          Filter
        </Text>
      </View>

      <View
        style={{
          paddingHorizontal: 10,
          flexDirection: "column",
          gap: 10,
          borderBottomWidth: 1,
          borderColor: "#F4F4F4",
          paddingBottom: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Text style={{ fontFamily: "Inter-Semibold" }}>
            Vehicle Star Rating
          </Text>
          {vehicleRating ? (
            <>
              <Text style={{ color: "gray" }}>({vehicleRating})</Text>
              <Icon name="star" size={16} color="#FFD700" />
            </>
          ) : null}
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: 5,
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setVehicleRating("0-1");
            }}
            style={styles.starContainer}
          >
            <Text>1</Text>
            <Icon name="star" size={16} color="#FFD700" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setVehicleRating("1-2");
            }}
            style={styles.starContainer}
          >
            <Text>2</Text>
            <Icon name="star" size={16} color="#FFD700" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setVehicleRating("2-3");
            }}
            style={styles.starContainer}
          >
            <Text>3</Text>
            <Icon name="star" size={16} color="#FFD700" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setVehicleRating("3-4");
            }}
            style={styles.starContainer}
          >
            <Text>4</Text>
            <Icon name="star" size={16} color="#FFD700" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setVehicleRating("4-5");
            }}
            style={styles.starContainer}
          >
            <Text>5</Text>
            <Icon name="star" size={16} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{
          paddingHorizontal: 10,
          flexDirection: "column",
          borderBottomWidth: 1,
          borderColor: "#F4F4F4",
          paddingBottom: 10,
        }}
      >
        <Text style={{ fontFamily: "Inter-Semibold" }}>Price</Text>
        <Text
          style={{ fontFamily: "Inter-Regular", color: "#333", marginTop: 5 }}
        >
          ₱{priceRange[0]} - ₱{priceRange[1]}
        </Text>

        <View style={{ paddingHorizontal: 10, width: "100%", marginTop: -5 }}>
          <MultiSlider
            values={priceRange}
            onValuesChangeFinish={(values) => {
              const priceRangeString = `${values[0]}-${values[1]}`;
              setPriceRangeFilter(priceRangeString);
              setPriceRange(values);
            }}
            min={0}
            max={10000}
            step={100}
            allowOverlap={false}
            snapped
            selectedStyle={{
              backgroundColor: "#EF0000",
            }}
            markerStyle={{
              height: 20,
              width: 20,
              backgroundColor: "#EF0000",
            }}
          />
        </View>
      </View>

      <View
        style={{
          paddingHorizontal: 10,
          flexDirection: "column",
          gap: 10,
          borderBottomWidth: 1,
          borderColor: "#F4F4F4",
          paddingBottom: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            alignItems: "center",
            gap: 5,
          }}
        >
          <Text style={{ fontFamily: "Inter-Semibold" }}>
            Supplier Star Rating
          </Text>
          {businessRating ? (
            <>
              <Text style={{ color: "gray" }}>({businessRating})</Text>
              <Icon name="star" size={16} color="#FFD700" />
            </>
          ) : null}
        </View>

        <View
          style={{
            flexDirection: "row",
            gap: 5,
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setBusinessRating("0-1");
            }}
            style={styles.starContainer}
          >
            <Text>1</Text>
            <Icon name="star" size={16} color="#FFD700" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setBusinessRating("1-2");
            }}
            style={styles.starContainer}
          >
            <Text>2</Text>
            <Icon name="star" size={16} color="#FFD700" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setBusinessRating("2-3");
            }}
            style={styles.starContainer}
          >
            <Text>3</Text>
            <Icon name="star" size={16} color="#FFD700" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setBusinessRating("3-4");
            }}
            style={styles.starContainer}
          >
            <Text>4</Text>
            <Icon name="star" size={16} color="#FFD700" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setBusinessRating("4-5");
            }}
            style={styles.starContainer}
          >
            <Text>5</Text>
            <Icon name="star" size={16} color="#FFD700" />
          </TouchableOpacity>
        </View>
      </View>

      <View
        style={{
          paddingHorizontal: 10,
          flexDirection: "column",
          gap: 10,
          borderBottomWidth: 1,
          borderColor: "#F4F4F4",
          paddingBottom: 10,
        }}
      >
        <Text style={{ fontFamily: "Inter-Semibold" }}>Displacement</Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TextInput
            style={{
              width: "40%",
              textAlign: "center",
              borderWidth: 1,
              borderColor: "#D3D3D3",
              backgroundColor: "white",
              borderRadius: 5,
            }}
            value={minDisplacement}
            onChangeText={setMinDisplacement}
          />
          <Text style={{ fontFamily: "Inter-Regular", color: "gray" }}>To</Text>
          <TextInput
            style={{
              width: "40%",
              textAlign: "center",
              borderWidth: 1,
              borderColor: "#D3D3D3",
              backgroundColor: "white",
              borderRadius: 5,
            }}
            value={maxDisplacement}
            onChangeText={setMaxDisplacement}
          />
        </View>
      </View>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          height: 60,
          width: "100%",
          alignItems: "center",
          flexDirection: "row",
          padding: 20,
          backgroundColor: "white",
          gap: 10,
        }}
      >
        <TouchableOpacity
          onPress={clearFilters}
          style={{
            borderRadius: 100,
            borderWidth: 1,
            borderColor: "#D3D3D3",
            justifyContent: "center",
            alignItems: "center",
            width: "40%",
            height: 38,
          }}
        >
          <Text style={{ color: "#EF0000", fontFamily: "Inter-Semibold" }}>
            Clear
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={applyFilter}
          style={{
            backgroundColor: "#EF0000",
            borderRadius: 100,
            flex: 1,
            height: 38,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontFamily: "Inter-Semibold",
            }}
          >
            Filter
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FilterScreen;

const styles = StyleSheet.create({
  starContainer: {
    width: "18%",
    height: 40,
    borderWidth: 1,
    borderColor: "#D3D3D3",
    borderRadius: 5,
    justifyContent: "center",
    backgroundColor: "white",
    alignItems: "center",
    flexDirection: "row",
  },
});
