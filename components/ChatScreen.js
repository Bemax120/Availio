import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

// Firebase setup
import { auth } from "../firebase/firebaseConfig";
import {
  getOrCreateConversation,
  subscribeMessages,
  sendMessage
} from "../firebase/messageService";

export default function ChatScreen({ navigation, route }) {
  const currentUid = auth.currentUser?.uid;
  const otherUserId = route.params?.otherUserId;
  const businessName = route.params?.businessName || "Chat";

  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");

  // Log and bail if we never received an otherUserId
  useEffect(() => {
    if (!otherUserId) {
      console.error("ChatScreen: missing otherUserId in navigation params");
    }
  }, [otherUserId]);

  // Optionally preload an existing conversation
  useEffect(() => {
    if (!otherUserId || !currentUid) return;
    getOrCreateConversation(currentUid, otherUserId)
      .then(setConversationId)
      .catch(console.error);
  }, [otherUserId, currentUid]);

  // Subscribe to incoming messages as soon as we have a conversationId
  useEffect(() => {
    if (!conversationId) return;
    const unsubscribe = subscribeMessages(conversationId, setMessages);
    return unsubscribe;
  }, [conversationId]);

  // Auto-create + send in one go
  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;

    if (!otherUserId) {
      console.error("Cannot send message—otherUserId is undefined");
      return;
    }

    try {
      const convId = conversationId || await getOrCreateConversation(currentUid, otherUserId);
      if (!conversationId) {
        setConversationId(convId);
      }
      await sendMessage(convId, currentUid, text);
      setInputText("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const renderMessage = ({ item }) => (
    <View
      style={[
        styles.messageContainer,
        item.senderId === currentUid ? styles.userMessage : styles.recipientMessage,
      ]}
    >
      <Text style={styles.messageText}>{item.message}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{businessName}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatList}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type a message..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EF0000",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 12 },
  chatList: { padding: 16, paddingBottom: 100 },
  messageContainer: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 16,
    marginBottom: 10,
  },
  userMessage: { backgroundColor: "#DCF8C6", alignSelf: "flex-end" },
  recipientMessage: { backgroundColor: "#f1f1f1", alignSelf: "flex-start" },
  messageText: { fontSize: 14, color: "#000" },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#f9f9f9",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 10,
  },
  sendButton: { backgroundColor: "#EF0000", padding: 10, borderRadius: 20 },
});
