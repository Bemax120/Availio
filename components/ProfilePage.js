import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
const defaultProfileImage = require("../assets/download.png");
import { signOut } from "firebase/auth";
import { getAuth } from "firebase/auth";
const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const auth = getAuth();

  useEffect(() => {
    if (!auth.currentUser) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
  }, [auth.currentUser]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("userData");

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);

          // ✅ Ensure a default profile image if null
          setUser({
            ...parsedUser,
            profileImage:
              parsedUser.profileImage ||
              Image.resolveAssetSource(defaultProfileImage).uri,
          });
        }
      } catch (error) {
        console.error("Error retrieving user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4b6584" />
      </View>
    );
  }

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userData");
      await signOut(auth);
      navigation.replace("Landing");
    } catch (error) {
      console.error("❌ Logout Error:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: user.profileImage }}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <View style={styles.ridesBadge}>
            <Ionicons name="bicycle" size={18} color="white" />
            <Text style={styles.ridesText}>{user.numRides} Rides</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        <View style={styles.infoItem}>
          <Ionicons name="mail" size={20} color="#4b6584" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email Address</Text>
            <Text style={styles.infoValue}>{user.email}</Text>
          </View>
          {user.emailVerified && (
            <Ionicons name="checkmark-circle" size={20} color="#4CD964" />
          )}
        </View>

        <View style={styles.infoItem}>
          <Ionicons name="call" size={20} color="#4b6584" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone Number</Text>
            <Text style={styles.infoValue}>{user.phoneNum}</Text>
          </View>
        </View>
      </View>

      {/* ✅ Log Out Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { paddingTop: 60, flex: 1, backgroundColor: "#F5F5F5" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { textAlign: "center", marginTop: 20, fontSize: 16, color: "red" },
  profileHeader: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "white",
    marginBottom: 15,
  },
  profileImage: { width: 80, height: 80, borderRadius: 40 },
  imagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: "black",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  profileInfo: { flex: 1, justifyContent: "center" },
  userName: { fontSize: 24, fontWeight: "700", color: "#333", marginBottom: 4 },
  memberSince: { color: "#666", marginBottom: 8 },
  ridesBadge: {
    flexDirection: "row",
    backgroundColor: "#4b6584",
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 15,
    alignItems: "center",
  },
  ridesText: { color: "white", marginLeft: 6, fontWeight: "600" },
  section: {
    backgroundColor: "white",
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  infoContent: { flex: 1, marginLeft: 15 },
  infoLabel: { color: "#666", fontSize: 14, marginBottom: 2 },
  infoValue: { color: "#333", fontSize: 16, fontWeight: "500" },
  logoutButton: {
    backgroundColor: "#FF3B30",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: { color: "white", fontSize: 16, fontWeight: "600" },
});

export default ProfilePage;
