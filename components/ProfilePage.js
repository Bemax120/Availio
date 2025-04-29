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
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/firebaseConfig";

const defaultProfileImage = require("../assets/download.png");

const ProfilePage = ({ route }) => {
  const filters = route?.params?.filters || {};
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneNum, setPhoneNum] = useState("");
  const navigation = useNavigation();
  const auth = getAuth();

  useEffect(() => {
    if (!auth.currentUser) {
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "Login",
            params: {
              filters,
            },
          },
        ],
      });
    }
  }, [auth.currentUser]);

  const fetchUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUser({
          ...data,
          profileImage:
            data.profileImage ||
            Image.resolveAssetSource(defaultProfileImage).uri,
        });
        setPhoneNum(data.phoneNum || "");
      }
    } catch (error) {
      console.error("Error retrieving user data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const uploadImage = async (folder, setter) => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          "Permission Denied",
          "You need to grant access to upload images."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
      });

      if (result.canceled) {
        return;
      }

      const imageUri = result.assets[0].uri;
      const response = await fetch(imageUri);
      const blob = await response.blob();

      const uid = auth.currentUser.uid;

      let imageRef = null;
      if (folder === "profile_pictures") {
        const fileName = uid;
        imageRef = ref(storage, `profile_pictures/personal/${fileName}`);
      } else {
        const fileName = "valid_id.jpg";
        imageRef = ref(storage, `verification_docs/${uid}/${fileName}`);
      }

      await uploadBytes(imageRef, blob);
      const downloadURL = await getDownloadURL(imageRef);

      const fieldName =
        folder === "profile_pictures" ? "profilePicture" : "verificationDoc";

      await updateDoc(doc(db, "users", uid), {
        [fieldName]: downloadURL,
      });

      fetchUserData();
      Alert.alert("Success", "Upload complete.");
    } catch (error) {
      console.error("❌ Upload error:", error);
      Alert.alert("Error", "Upload failed. Try again.");
    }
  };

  const savePhoneNumber = async () => {
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        phoneNum,
      });
      Alert.alert("Saved", "Phone number updated.");
      setEditingPhone(false);
    } catch (error) {
      console.error("Phone update error:", error);
      Alert.alert("Error", "Could not update phone number.");
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("userData");
      await signOut(auth);
      navigation.replace("Filter");
    } catch (error) {
      console.error("Logout Error:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  if (loading || !user) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4b6584" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <TouchableOpacity onPress={() => uploadImage("profile_pictures")}>
          <Image
            source={{ uri: user.profileImage }}
            style={styles.profileImage}
          />
          <Text style={styles.uploadText}>Upload Photo</Text>
        </TouchableOpacity>
        <View style={styles.profileInfo}>
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <View style={styles.ridesBadge}>
            <Ionicons name="bicycle" size={18} color="white" />
            <Text style={styles.ridesText}>0 Rides</Text>
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
            {editingPhone ? (
              <TextInput
                style={styles.input}
                value={phoneNum}
                onChangeText={setPhoneNum}
                keyboardType="phone-pad"
                placeholder="Enter phone number"
              />
            ) : (
              <Text style={styles.infoValue}>{phoneNum}</Text>
            )}
          </View>
          <TouchableOpacity
            onPress={
              editingPhone ? savePhoneNumber : () => setEditingPhone(true)
            }
          >
            <Ionicons
              name={editingPhone ? "checkmark" : "create"}
              size={20}
              color="#007AFF"
            />
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.uploadButton, { backgroundColor: "#007AFF" }]}
        onPress={() => uploadImage("verification_docs")}
      >
        <Text style={styles.logoutButtonText}>Upload Valid ID</Text>
      </TouchableOpacity>

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
    gap: 20,
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
  uploadText: {
    color: "#007AFF",
    marginTop: 5,
    fontSize: 12,
    textAlign: "center",
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
  input: {
    borderBottomWidth: 1,
    borderColor: "#CCC",
    paddingVertical: 4,
    fontSize: 16,
    color: "#333",
  },
  uploadButton: {
    marginHorizontal: 20,
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
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
