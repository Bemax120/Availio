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
import MotorcycleDetailScreen from "./components/MotorcycleDetailScreen";
import DateTimePickerScreen from "./components/DateTimePickerScreen";
import PaymentScreen from "./components/PaymentScreen";
import PaymentDetailsScreen from "./components/PaymentDetailsScreen";
import PaymentSuccessScreen from "./components/PaymentSuccessScreen";
import InquireScreen from "./components/InquireScreen";
import BookingDetailScreen from "./components/BookingDetailScreen";
import ChatScreen from "./components/ChatScreen";
import EnhancedFilterScreen from "./components/EnhancedFilterScreen";
import RatingScreen from "./components/RatingScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
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
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Favorite" component={MotorcycleFavoritesScreen} />
      <Tab.Screen name="Book" component={MotorcycleBookScreen} />
      <Tab.Screen name="Account" component={ProfilePage} />
    </Tab.Navigator>
  );
}

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Register" component={RegisterScreen} />
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
          name="MotorcycleDetail"
          component={MotorcycleDetailScreen}
        />
        <Stack.Screen name="DateTimePicker" component={DateTimePickerScreen} />
        <Stack.Screen name="Rating" component={RatingScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="PaymentDetails" component={PaymentDetailsScreen} />
        <Stack.Screen name="PaymentSuccess" component={PaymentSuccessScreen} />
        <Stack.Screen
          name="Inquire"
          component={InquireScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="BookingDetail"
          component={BookingDetailScreen}
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
