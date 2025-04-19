import { ScrollView, View, Image, TouchableOpacity, Text } from "react-native";
const Availio = require("../assets/AvailioBanner.png");
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const LandingScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: "#FCFBF4",
      }}
    >
      <View style={{ paddingHorizontal: 15, paddingTop: 25 }}>
        <Image
          source={Availio}
          style={{ width: 125, height: 75, resizeMode: "contain" }}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          marginTop: 20,
        }}
      >
        <TouchableOpacity
          style={{
            width: 175,
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
            width: 175,
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
