import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { doc, updateDoc } from 'firebase/firestore'; 
import { db } from '../firebase/firebaseConfig'; 

export default function BookingDetailScreen({ route, navigation }) {
  const {
    bookingNumber,
    itemName,
    vendorName,
    pickupDate,
    returnDate,
  } = route.params;

  const [rentalDuration, setRentalDuration] = useState('');

  useEffect(() => {
    const calculateDuration = () => {
      if (!pickupDate || !returnDate) {
        setRentalDuration('N/A');
        return;
      }

      const parseDate = (dateString) => {
        const [datePart, timePart, meridian] = dateString.split(' ');
        const [year, month, day] = datePart.split('-').map(Number);
        let [hours, minutes] = timePart.split(':').map(Number);

        if (meridian === 'PM' && hours !== 12) hours += 12;
        if (meridian === 'AM' && hours === 12) hours = 0; 

        return new Date(year, month - 1, day, hours, minutes);
      };

      const pickup = parseDate(pickupDate);
      const returnD = parseDate(returnDate);

      if (!isNaN(pickup.getTime()) && !isNaN(returnD.getTime())) {
        const diffInHours = (returnD - pickup) / (1000 * 60 * 60);
        setRentalDuration(`${Math.ceil(diffInHours / 24)} days`);
      } else {
        setRentalDuration('Invalid Date');
      }
    };

    calculateDuration();
  }, [pickupDate, returnDate]);

  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Booked Details</Text>
        <Text style={styles.bookNo}>Book ID. {bookingNumber}</Text>
      </View>

      <View style={styles.container}>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>Waiting for Confirmation</Text>
        </View>

        <Text style={styles.itemTitle}>{itemName}</Text>
        <Text style={styles.itemSubtitle}>{vendorName}</Text>

        <View style={styles.refundContainer}>
          <View style={styles.refundItem}>
            <Text style={styles.checkMark}>✅</Text>
            <Text style={styles.refundText}>Can be refunded</Text>
          </View>
          <View style={styles.refundItem}>
            <Text style={styles.crossMark}>❌</Text>
            <Text style={styles.refundText}>Can't reschedule</Text>
          </View>
        </View>

        <View style={styles.tenantInfoContainer}>
          <Text style={styles.sectionTitle}>Tenants Information</Text>
          <Text style={styles.tenantName}>John Doe</Text>
          <Text style={styles.tenantContact}>
            scootergaming@gmail.com • 09667778888
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Pick Up Time</Text>
          <Text style={styles.value}>{pickupDate}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Return Time</Text>
          <Text style={styles.value}>{returnDate}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Rental Duration</Text>
          <Text style={styles.value}>{rentalDuration}</Text>
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => {
            navigation.navigate('Chat', {
              bookingNumber,
              itemName,
              vendorName,
            });
          }}
        >
          <Text style={styles.primaryButtonText}>Contact the Rental Office</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={async () => {
            try {
              const bookingRef = doc(db, 'bookings', bookingNumber); 
              await updateDoc(bookingRef, {
                bookingStatus: 'Cancel', 
              });

              navigation.navigate('HomeTabs', { screen: 'Home' }); 
            } catch (error) {
              console.error('Error updating booking status:', error);
            }
          }}
        >
          <Text style={styles.secondaryButtonText}>Cancel Booking</Text>
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
    alignItems: 'center',
    paddingVertical: 16,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  bookNo: {
    color: '#fff',
    fontSize: 14,
    marginTop: 4,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  statusContainer: {
    backgroundColor: '#FEE2E2',
    padding: 8,
    alignItems: 'center',
    borderRadius: 4,
    marginBottom: 16,
  },
  statusText: {
    color: 'red',
    fontWeight: 'bold',
  },
  itemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  refundContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  refundItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  checkMark: {
    marginRight: 4,
  },
  crossMark: {
    marginRight: 4,
  },
  refundText: {
    fontSize: 14,
  },
  tenantInfoContainer: {
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tenantName: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  tenantContact: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  primaryButton: {
    backgroundColor: 'red',
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderColor: 'red',
    borderWidth: 1,
    paddingVertical: 14,
    borderRadius: 4,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
