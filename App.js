import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet } from "react-native";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import MotorcycleListScreen from "./components/MotorcycleListScreen";
import MotorcycleFavoritesScreen from "./components/MotorcycleFavoritesScreen";
import MotorcycleBookScreen from "./components/MotorcycleBookScreen";
import ProfilePage from "./components/ProfilePage";
import DashboardScreen from "./components/DashboardScreen";
import ConfirmBookingScreen from "./components/ConfirmBookingScreen";
import DateTimePickerScreen from "./components/DateTimePickerScreen";
import PaymentScreen from "./components/PaymentScreen";
import PaymentDetailsScreen from "./components/PaymentDetailsScreen";
import PaymentSuccessScreen from "./components/PaymentSuccessScreen";
import InquireScreen from "./components/InquireScreen";
import ChatScreen from "./components/ChatScreen";
import EnhancedFilterScreen from "./components/EnhancedFilterScreen";
import RatingScreen from "./components/RatingScreen";
import MapPinScreen from "./components/MapPinScreen";
import VehicleDetailScreen from "./components/VehicleDetailScreen";
import LandingScreen from "./components/LandingScreen";
import { useFonts } from "expo-font";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs({ route }) {
  const filters = route?.params?.filters || null;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Favorite") {
            iconName = "heart";
          } else if (route.name === "Book") {
            iconName = "book";
          } else if (route.name === "Account") {
            iconName = "person";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "red",
        tabBarInactiveTintColor: "gray",
      })}
    >
      <Tab.Screen
        name="Home"
        options={{ headerShown: false }}
        initialParams={{ filters }}
        component={DashboardScreen}
      />
      <Tab.Screen name="Favorite" component={MotorcycleFavoritesScreen} />
      <Tab.Screen name="Book" component={MotorcycleBookScreen} />
      <Tab.Screen name="Account" component={ProfilePage} />
    </Tab.Navigator>
  );
}

const App = () => {
  useFonts({
    "Inter-Regular": require("./fonts/Inter-Regular.ttf"),
    "Inter-Semibold": require("./fonts/Inter-Semibold.ttf"),
    "Inter-Bold": require("./fonts/Inter-Bold.ttf"),
  });

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Landing">
        <Stack.Screen
          name="Landing"
          component={LandingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen
          name="MapPinScreen"
          options={{ headerShown: false }}
          component={MapPinScreen}
        />
        <Stack.Screen
          name="Filter"
          component={EnhancedFilterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="HomeTabs"
          component={HomeTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="MotorcycleList"
          component={MotorcycleListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ConfirmBooking"
          options={{ headerShown: false }}
          component={ConfirmBookingScreen}
        />
        <Stack.Screen
          name="VehicleDetail"
          options={{ headerShown: false }}
          component={VehicleDetailScreen}
        />
        <Stack.Screen
          name="DateTimePicker"
          options={{ headerShown: false }}
          component={DateTimePickerScreen}
        />
        <Stack.Screen
          name="Rating"
          options={{ headerShown: false }}
          component={RatingScreen}
        />
        <Stack.Screen
          name="Payment"
          options={{ headerShown: false }}
          component={PaymentScreen}
        />
        <Stack.Screen
          name="PaymentDetails"
          options={{ headerShown: false }}
          component={PaymentDetailsScreen}
        />
        <Stack.Screen
          name="PaymentSuccess"
          options={{ headerShown: false }}
          component={PaymentSuccessScreen}
        />
        <Stack.Screen
          name="Inquire"
          component={InquireScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
