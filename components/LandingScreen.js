import { ScrollView, View, Image, TouchableOpacity, Text } from "react-native";
const Availio = require("../assets/AvailioBanner.png");
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const LandingScreen = () => {
  const navigation = useNavigation();

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: "#FCFBF4",
      }}
    >
      <View style={{ paddingHorizontal: 15, paddingTop: 35 }}>
        <Image
          source={Availio}
          style={{ width: 125, height: 75, resizeMode: "contain" }}
        />
      </View>

      <TouchableOpacity
        style={{
          flex: 1,
          maxHeight: 100,
          marginHorizontal: 20,

          backgroundColor: "#E4A0F7",
          borderRadius: 15,
          position: "relative",
        }}
        onPress={() =>
          navigation.navigate("Filter", {
            vehicleType: "",
          })
        }
      >
        <MaterialIcons
          style={{ position: "absolute", bottom: 5, right: 10 }}
          size={60}
          color="#702963"
          name="two-wheeler"
        />
        <Ionicons
          style={{ position: "absolute", bottom: 5, right: 65 }}
          size={60}
          color="#702963"
          name="car-sport"
        />
        <Text
          style={{
            fontWeight: "bold",
            padding: 10,
            fontSize: 16,
            fontFamily: "Inter-Semibold",
          }}
        >
          All Vehicles
        </Text>
      </TouchableOpacity>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 10,
          gap: 10,
          marginHorizontal: 20,
        }}
      >
        <TouchableOpacity
          style={{
            width: "48%",
            height: 85,
            backgroundColor: "#ffb3b3",
            borderRadius: 15,
            position: "relative",
          }}
          onPress={() =>
            navigation.navigate("Filter", {
              vehicleType: "2 Wheels",
            })
          }
        >
          <MaterialIcons
            style={{ position: "absolute", bottom: 5, right: 10 }}
            size={60}
            color="red"
            name="two-wheeler"
          />
          <Text
            style={{ padding: 10, fontSize: 16, fontFamily: "Inter-Semibold" }}
          >
            2 Wheels
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            width: "48%",
            height: 85,
            backgroundColor: "#b3cde0",
            borderRadius: 15,
            position: "relative",
          }}
          onPress={() =>
            navigation.navigate("Filter", {
              vehicleType: "4 Wheels",
            })
          }
        >
          <Text
            style={{ padding: 10, fontSize: 16, fontFamily: "Inter-Semibold" }}
          >
            4 Wheels
          </Text>
          <Ionicons
            style={{ position: "absolute", bottom: 5, right: 10 }}
            size={60}
            color="blue"
            name="car-sport"
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default LandingScreen;
