import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, FlatList, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { getAuth } from 'firebase/auth';
import { useNavigation } from '@react-navigation/native';

const MotorcycleBookScreen = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Upcoming');
  const navigation = useNavigation(); 

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    setLoading(true); 
    const myBookingRef = collection(db, 'users', userId, 'myBooking');

    const unsubscribe = onSnapshot(myBookingRef, async (snapshot) => {
      const bookingPromises = snapshot.docs.map(async (docSnap) => {
        const bookingId = docSnap.id;
        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingSnap = await getDoc(bookingRef);

        if (!bookingSnap.exists()) return null;

        const bookingData = bookingSnap.data();
        const vehicleRef = doc(db, 'vehicles', bookingData.vehicleId);
        const vehicleSnap = await getDoc(vehicleRef);

        return {
          id: bookingId,
          bike: vehicleSnap.exists() ? vehicleSnap.data().name : 'Unknown Vehicle',
          image: vehicleSnap.exists() ? vehicleSnap.data().defaultImg : null,
          date: formatDateTime(bookingData.createdAt),
          status: bookingData.bookingStatus,
          total: bookingData.totalPrice,
        };
      });

      const resolvedBookings = (await Promise.all(bookingPromises)).filter(Boolean);
      setBookings(resolvedBookings);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId, filter]);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'Unknown Date';
    const dateObj = new Date(timestamp);
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? ' PM' : ' AM';
    hours = hours % 12 || 12;

    return `${year}-${month}-${day} / ${hours}:${minutes}${ampm}`;
  };


  const filteredBookings = bookings.filter((booking) => {
    const isUpcoming = booking.status === 'Confirmed' || booking.status === 'Pending';
    return filter === 'Upcoming' ? isUpcoming : !isUpcoming;
  });

  const StatusBadge = ({ status }) => {
    let backgroundColor;
  
    if (status === 'Complete') {
      backgroundColor = '#4CD964'; 
    } else if (status === 'Cancel') {
      backgroundColor = '#FF3B30'; 
    } else {
      backgroundColor = '#FFCC00'; 
    }
  
    return (
      <View style={[styles.statusBadge, { backgroundColor }]}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    );
  };

 
  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>My Bookings</Text>

      <View style={styles.segmentContainer}>
        <TouchableOpacity
          style={[styles.segmentButton, filter === 'Upcoming' && styles.activeSegment]}
          onPress={() => {
            setLoading(true);
            setFilter('Upcoming');
          }}
        >
          <Text style={filter === 'Upcoming' ? styles.activeSegmentText : styles.segmentText}>Pending</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentButton, filter === 'Past' && styles.activeSegment]}
          onPress={() => {
            setLoading(true);
            setFilter('Past');
          }}
        >
          <Text style={filter === 'Past' ? styles.activeSegmentText : styles.segmentText}>Completed</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="red" />
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.scrollContainer}
          renderItem={({ item }) => (
            <View style={styles.bookingCard}>
              
              <View style={styles.bookingHeader}>
                <View style={styles.bikeInfo}>
                  <Ionicons name="calendar" size={20} color="#4b6584" />
                  <Text style={styles.bookingDate}>{item.date}</Text>
                </View>
                <StatusBadge status={item.status} />
              </View>

              <View style={styles.bookingContent}>
                {item.image ? (
                  <Image source={{ uri: item.image }} style={styles.bookingImage} />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Text style={styles.placeholderText}>No Image</Text>
                  </View>
                )}
                <View style={styles.bookingDetails}>
                  <Text style={styles.bikeName}>{item.bike}</Text>
                  <Text style={styles.totalText}>Total: ₱ {item.total}</Text>
                </View>
              </View>

              <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => {
                  navigation.navigate('Inquire', { bookingId: item.id, totalPrice: item.total, motorcycle: item });
                }}
              >
                <Text style={styles.secondaryButtonText}>View Details</Text>
              </TouchableOpacity>

                <TouchableOpacity style={styles.primaryButton}
                onPress={() => {
                  navigation.navigate('Inquire', { bookingId: item.id, totalPrice: item.total, motorcycle: item });
                }}>
                  <Text style={styles.primaryButtonText}>Modify</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  screenTitle: { fontSize: 28, fontWeight: '800', color: '#333', padding: 20, backgroundColor: 'white' },
  segmentContainer: { flexDirection: 'row', padding: 15, backgroundColor: 'white' },
  segmentButton: { flex: 1, padding: 12, alignItems: 'center', borderRadius: 8, marginHorizontal: 5 },
  activeSegment: { backgroundColor: '#FF3B30' },
  segmentText: { color: '#666', fontWeight: '600' },
  activeSegmentText: { color: 'white', fontWeight: '600' },
  scrollContainer: { padding: 15 },
  bookingCard: { backgroundColor: 'white', borderRadius: 15, marginBottom: 15, padding: 15, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  bookingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  bikeInfo: { flexDirection: 'row', alignItems: 'center' },
  bookingDate: { marginLeft: 8, color: 'black', fontWeight: '600' },
  statusBadge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 15 },
  statusText: { color: 'white', fontWeight: '600', fontSize: 12 },
  bookingContent: { flexDirection: 'row', marginBottom: 15 },
  bookingImage: { width: 100, height: 80, borderRadius: 10 },
  imagePlaceholder: { width: 100, height: 80, backgroundColor: 'black', justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  placeholderText: { color: 'white', fontSize: 12 },
  bookingDetails: { flex: 1, marginLeft: 15, justifyContent: 'space-between' },
  bikeName: { fontSize: 18, fontWeight: '700', color: '#333' },
  totalText: { fontSize: 16, color: '#4CD964', fontWeight: '600' },
  actionButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },
  primaryButton: { backgroundColor: '#FF3B30', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8, marginLeft: 10 },
  primaryButtonText: { color: 'white', fontWeight: '600' },
  secondaryButton: { borderWidth: 1, borderColor: 'black', paddingVertical: 8, paddingHorizontal: 20, borderRadius: 8 },
  secondaryButtonText: { color: '#4b6584', fontWeight: '600' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default MotorcycleBookScreen;
