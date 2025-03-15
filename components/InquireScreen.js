import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, BackHandler } from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { useFocusEffect } from '@react-navigation/native';

export default function InquireScreen({ route, navigation }) {
  const { bookingId, totalPrice, motorcycle } = route.params;
  const auth = getAuth();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) return; 

      try {
        const bookingRef = doc(db, "bookings", bookingId);
        const bookingSnap = await getDoc(bookingRef);

        if (bookingSnap.exists()) {
          setBooking({ id: bookingSnap.id, ...bookingSnap.data() });
        } else {
          console.error("Booking not found");
        }
      } catch (error) {
        console.error("Error fetching booking:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  useEffect(() => {
    const date = new Date();
    const options = { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' };
    setCurrentDate(date.toLocaleDateString('en-US', options));
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('MotorcycleList');
        return true;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        BackHandler.removeEventListener('hardwareBackPress', onBackPress);
      };
    }, [navigation])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>Loading booking details...</Text>
      </SafeAreaView>
    );
  }

  if (!booking) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Text>Booking not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Booked</Text>
      </View>
      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.bookNumber}>Book ID: {booking.id}</Text>
          </View>
          <Text style={styles.dateText}>{currentDate}</Text>
          <Text style={styles.itemTitle}>{motorcycle.name}</Text>
          <Text style={styles.itemSubtitle}>Scooter Gaming PH</Text>
          <Text style={styles.price}>₱{totalPrice}</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>Waiting for Confirmation</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.itemButton}
          onPress={() => {
            navigation.navigate('BookingDetail', {
              bookingNumber: booking.id,
              itemName: motorcycle.name,
              vendorName: 'Scooter Gaming PH',
              pickupDate: booking.pickupDate?.toDate 
                ? booking.pickupDate.toDate().toISOString() 
                : booking.pickupDate, 
              returnDate: booking.returnDate?.toDate 
                ? booking.returnDate.toDate().toISOString() 
                : booking.returnDate,
            });
          }}
        >
          <Text style={styles.itemButtonText}>View Booking Details</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'red',
  },
  header: {
    backgroundColor: 'red',
    paddingVertical: 16,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bookNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 14,
    color: '#555',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  statusText: {
    color: 'red',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemButton: {
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 16,
  },
  itemButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
