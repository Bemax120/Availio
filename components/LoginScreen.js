import React, { useState } from "react";
import {
  Image,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, doc, getDoc, query, where, getDocs } from "firebase/firestore";
import { SocialIcon } from "react-native-elements";
import { auth, db } from "../firebase/firebaseConfig";

const defaultProfileImage = require("../assets/download.png");

const LoginScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState(""); // Email or username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch email if the user enters a username
  const fetchEmailFromUsername = async (username) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data().email; // Return the first matched email
      }
      return null; // Username not found
    } catch (error) {
      console.error("Error fetching email:", error);
      return null;
    }
  };

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) {
      Alert.alert("Error", "Both fields are required!");
      return;
    }

    setLoading(true);
    let emailToUse = identifier;

    // If identifier is a username, get the email
    if (!identifier.includes("@")) {
      const foundEmail = await fetchEmailFromUsername(identifier);
      if (!foundEmail) {
        setLoading(false);
        Alert.alert("Error", "Username not found!");
        return;
      }
      emailToUse = foundEmail;
    }

    try {
      console.log("🔍 Logging in:", emailToUse);
      const userCredential = await signInWithEmailAndPassword(auth, emailToUse, password);
      const user = userCredential.user;

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // ✅ Check if emailVerify is true in Firestore
        if (!userData.emailVerified) {
          setLoading(false);
          Alert.alert("Error", "Please verify your email before logging in.");
          return;
        }

        console.log("✅ Login Success:", userData);

        // Set default profile image if null
        const finalUserData = {
          ...userData,
          profileImage: userData.profileImage || Image.resolveAssetSource(defaultProfileImage).uri,
        };

        // ✅ Save user data to AsyncStorage
        await AsyncStorage.setItem("userData", JSON.stringify(finalUserData));

        Alert.alert("Success", `Welcome, ${finalUserData.firstName}!`);
        navigation.replace("MotorcycleList");
      } else {
        throw new Error("User data not found in Firestore");
      }

    } catch (error) {
      console.error("❌ Login Error:", error);
      Alert.alert("Error", error.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter your email/username and password to continue</Text>

        <TextInput
          style={styles.input}
          placeholder="Email or Username"
          autoCapitalize="none"
          value={identifier}
          onChangeText={setIdentifier}
        />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, loading && styles.disabledButton]}
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enter</Text>}
      </TouchableOpacity>

      <Text style={styles.orText}>or</Text>

      <SocialIcon title="Sign in with Google" button type="google" />
      <SocialIcon title="Sign in with Facebook" button type="facebook" />

      <Text style={styles.registerText}>
        Don't have an account?{" "}
        <Text style={styles.registerLink} onPress={() => navigation.navigate("Register")}>
          Register Here.
        </Text>
      </Text>
    
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
    fontWeight: "bold",
    color: "#333",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  forgotPassword: {
    textAlign: "right",
    color: "#007BFF",
    marginBottom: 20,
    fontWeight: "500",
  },
  button: {
    backgroundColor: "#ff0000",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  orText: {
    textAlign: "center",
    marginBottom: 20,
    color: "#888",
  },
  registerText: {
    textAlign: "center",
    marginTop: 20,
    color: "#888",
    fontSize: 14,
  },
  registerLink: {
    color: "#ff0000",
    fontWeight: "bold",
  },
});

export default LoginScreen;
