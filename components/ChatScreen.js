import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function ChatScreen({ route, navigation }) {
  const {
    bookingNumber = "SMJ00233",
    bookingDate = "Wed, 23 July 2022",
    itemName = "Honda Beat Playful",
    vendorName = "Scooter Gaming PH",
    price = 2000,
  } = route.params || {};

  const [messages, setMessages] = useState([
    {
      id: "1",
      text: "Good morning sir, I want to confirm my order for Wednesday 23 June, is it available sir?",
      isUser: true,
    },
  ]);

  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (!inputText.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
  };

  const renderMessage = ({ item }) => {
    return (
      <View style={[styles.messageRow, item.isUser && styles.userMessageRow]}>
        <View style={[styles.messageBubble, item.isUser && styles.userBubble]}>
          <Text style={styles.messageText}>{item.text}</Text>
        </View>
        <Ionicons
          name="person-circle-outline"
          size={30}
          color="#888"
          style={styles.avatarIcon}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{vendorName}</Text>
          <Text style={styles.onlineText}>online</Text>
        </View>
      </View>

      <View style={styles.container}>
        <View style={styles.bookingCard}>
          <View style={styles.bookingCardTopRow}>
            <Text style={styles.bookNo}>Book No. {bookingNumber}</Text>
            <Text style={styles.bookDate}>{bookingDate}</Text>
          </View>
          <Text style={styles.itemName}>{itemName}</Text>
          <Text style={styles.vendorName}>{vendorName}</Text>
          <Text style={styles.price}>₱{price}</Text>

          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => {
              navigation.navigate("Inquire", {
                bookingId: item.id,
                totalPrice: item.total,
                motorcycle: item,
              });
            }}
          >
            <Text style={styles.viewDetailsText}>View Booked Details</Text>
            <Ionicons name="chevron-forward" size={18} color="red" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatList}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Write a message..."
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FCFBF4",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "red",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  onlineText: {
    color: "#fff",
    fontSize: 12,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  bookingCard: {
    backgroundColor: "#fff",
    padding: 16,
    margin: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingCardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  bookNo: {
    fontSize: 14,
    fontWeight: "bold",
  },
  bookDate: {
    fontSize: 14,
    color: "#555",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  vendorName: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    color: "red",
    fontWeight: "bold",
  },
  viewDetailsButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  viewDetailsText: {
    color: "red",
    fontSize: 14,
    marginRight: 4,
  },
  chatList: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 80,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  userMessageRow: {},
  messageBubble: {
    maxWidth: "70%",
    backgroundColor: "#DCF8C6",
    padding: 10,
    borderRadius: 8,
  },
  userBubble: {},
  messageText: {
    fontSize: 14,
    color: "#000",
  },
  avatarIcon: {
    marginLeft: 6,
  },
  inputContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    padding: 8,
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 12,
    fontSize: 14,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  sendButton: {
    backgroundColor: "green",
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
