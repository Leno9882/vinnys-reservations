import React, { createContext, useContext, useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const ReservationContext = createContext();

export const ReservationProvider = ({ children }) => {
  const [reservations, setReservations] = useState([]);
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedDateFilter, setSelectedDateFilter] = useState(''); // Empty string shows all bookings by default
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Firestore Real-time Listener
  useEffect(() => {
    const reservationsRef = collection(db, 'reservations');

    const unsubscribe = onSnapshot(
      reservationsRef,
      (snapshot) => {
        const liveData = snapshot.docs.map((docItem) => ({
          id: docItem.id,
          ...docItem.data()
        }));

        // Sort newest reservations first
        liveData.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

        setReservations(liveData);
      },
      (error) => {
        console.error("Firestore subscription error: ", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // Add new reservation to Firestore
  const addReservation = async (newRes) => {
    const resDate = newRes.date || newRes.res_date || new Date().toISOString().split('T')[0];

    const reservationData = {
      guestName: newRes.guestName || newRes.customer_name || 'Guest',
      phone: newRes.phone || newRes.customer_phone || '',
      email: newRes.email || '',
      partySize: Number(newRes.partySize || newRes.guest_count || 1),
      date: resDate,
      time: newRes.time || newRes.res_time || '5:00 PM',
      area: newRes.area || 'Main Dining Room',
      notes: newRes.notes || newRes.occasion || '',
      status: newRes.status || 'Pending',
      createdAt: new Date().toISOString()
    };

    try {
      await addDoc(collection(db, 'reservations'), reservationData);
      if (resDate) {
        setSelectedDateFilter(resDate);
      }
    } catch (err) {
      console.error("Error writing document to Firestore: ", err);
    }
  };

  // Update reservation status in Firestore
  const updateStatus = async (id, status) => {
    try {
      const resDoc = doc(db, 'reservations', id);
      await updateDoc(resDoc, { status });
    } catch (err) {
      console.error("Error updating status in Firestore: ", err);
    }
  };

  // NEW: Update arbitrary reservation fields (party size, service steps, seatedAt timestamp, etc.)
  const updateReservation = async (id, fieldsToUpdate) => {
    try {
      const resDoc = doc(db, 'reservations', id);
      await updateDoc(resDoc, fieldsToUpdate);
    } catch (err) {
      console.error("Error updating reservation fields in Firestore: ", err);
    }
  };

  // Delete reservation from Firestore
  const deleteReservation = async (id) => {
    try {
      const resDoc = doc(db, 'reservations', id);
      await deleteDoc(resDoc);
    } catch (err) {
      console.error("Error deleting document from Firestore: ", err);
    }
  };

  return (
    <ReservationContext.Provider
      value={{
        reservations,
        addReservation,
        updateStatus,
        updateReservation, // <-- Now exported for party size edits & service step checklists
        deleteReservation,
        activeView,
        setActiveView,
        selectedDateFilter,
        setSelectedDateFilter,
        statusFilter,
        setStatusFilter,
        searchQuery,
        setSearchQuery
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservations = () => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservations must be used within a ReservationProvider');
  }
  return context;
};