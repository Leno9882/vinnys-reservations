import React from 'react';
import { ReservationProvider, useReservations } from './context/ReservationContext';
import Navbar from './components/Navbar';
import HostDashboard from './components/HostDashboard';
import CustomerBooking from './components/CustomerBooking';

function MainLayout() {
  const { activeView } = useReservations();

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans antialiased selection:bg-amber-500 selection:text-neutral-950">
      <Navbar />
      <main>
        {activeView === 'dashboard' ? <HostDashboard /> : <CustomerBooking />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ReservationProvider>
      <MainLayout />
    </ReservationProvider>
  );
}