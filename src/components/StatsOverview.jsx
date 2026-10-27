import React, { useMemo } from 'react';
import { useReservations } from '../context/ReservationContext';
import { UserCheck, CalendarDays, TrendingUp, Clock } from 'lucide-react';

export default function StatsOverview() {
  const { reservations, selectedDateFilter } = useReservations();

  const analytics = useMemo(() => {
    const now = new Date();

    // Start of current week (Monday)
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    // Filter active reservations (excluding soft-deleted)
    const active = reservations.filter((r) => !r.isDeleted);

    // Active subset based on date filter (if selectedDateFilter is empty, count all active)
    const currentScope = selectedDateFilter
      ? active.filter((r) => r.date === selectedDateFilter)
      : active;

    // Total Parties
    const todaysTotalBookings = currentScope.length;

    // Guests Seated or Completed
    const todaysSeatedGuests = currentScope
      .filter((r) => r.status === 'Seated' || r.status === 'Completed')
      .reduce((sum, r) => sum + Number(r.partySize || 1), 0);

    // Total Expected Guests (excluding cancelled)
    const todaysTotalExpectedGuests = currentScope
      .filter((r) => r.status !== 'Cancelled')
      .reduce((sum, r) => sum + Number(r.partySize || 1), 0);

    // Weekly Seated Guests Total across all completed/seated active reservations
    const thisWeekSeatedGuests = active
      .filter((r) => r.status === 'Seated' || r.status === 'Completed')
      .reduce((sum, r) => sum + Number(r.partySize || 1), 0);

    // Overdue Table Turnarounds
    const overdueTablesCount = active.filter((r) => {
      if (r.status !== 'Seated' || !r.seatedAt) return false;
      const seatedTime = new Date(r.seatedAt).getTime();
      const elapsedMins = Math.floor((now.getTime() - seatedTime) / (1000 * 60));
      const partySize = Number(r.partySize || 2);
      const targetMins = partySize <= 2 ? 75 : partySize <= 4 ? 90 : partySize <= 6 ? 105 : 120;
      return elapsedMins > targetMins;
    }).length;

    return {
      todaysTotalBookings,
      todaysSeatedGuests,
      todaysTotalExpectedGuests,
      thisWeekSeatedGuests,
      overdueTablesCount
    };
  }, [reservations, selectedDateFilter]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 font-['Montserrat']">
      
      {/* Today's Seated Guests */}
      <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">
            Guests Seated / Completed
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#00a859] font-['Playfair_Display']">
              {analytics.todaysSeatedGuests}
            </span>
            <span className="text-xs text-neutral-500 font-semibold">
              / {analytics.todaysTotalExpectedGuests} expected
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#00a859]/10 border border-[#00a859]/30 flex items-center justify-center">
          <UserCheck className="w-5 h-5 text-[#00a859]" />
        </div>
      </div>

      {/* This Week Total Guests */}
      <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">
            Total Weekly Covers
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-[#c9a063] font-['Playfair_Display']">
              {analytics.thisWeekSeatedGuests}
            </span>
            <span className="text-xs text-[#c9a063]/70 font-semibold">
              guests
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-[#c9a063]/10 border border-[#c9a063]/30 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-[#c9a063]" />
        </div>
      </div>

      {/* Total Bookings */}
      <div className="bg-[#181818] border border-neutral-800 rounded-2xl p-4 shadow-xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">
            Total Parties
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-neutral-100 font-['Playfair_Display']">
              {analytics.todaysTotalBookings}
            </span>
            <span className="text-xs text-neutral-500 font-semibold">
              reservations
            </span>
          </div>
        </div>
        <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
          <CalendarDays className="w-5 h-5 text-neutral-300" />
        </div>
      </div>

      {/* Overdue Rotation Alerts */}
      <div className={`border rounded-2xl p-4 shadow-xl flex items-center justify-between ${
        analytics.overdueTablesCount > 0 
          ? 'bg-[#d9383a]/10 border-[#d9383a]/40' 
          : 'bg-[#181818] border-neutral-800'
      }`}>
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-1">
            Overdue Table Turns
          </span>
          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black font-['Playfair_Display'] ${
              analytics.overdueTablesCount > 0 ? 'text-[#d9383a]' : 'text-neutral-400'
            }`}>
              {analytics.overdueTablesCount}
            </span>
            <span className="text-xs text-neutral-500 font-semibold">
              tables
            </span>
          </div>
        </div>
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${
          analytics.overdueTablesCount > 0 
            ? 'bg-[#d9383a]/20 border-[#d9383a]/40' 
            : 'bg-neutral-900 border-neutral-800'
        }`}>
          <Clock className={`w-5 h-5 ${analytics.overdueTablesCount > 0 ? 'text-[#d9383a]' : 'text-neutral-500'}`} />
        </div>
      </div>

    </div>
  );
}