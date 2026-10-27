import React, { useState } from 'react';
import { useReservations } from '../context/ReservationContext';
import { X, User, Phone, Users, Clock, Calendar, MapPin, MessageSquare, PlusCircle } from 'lucide-react';

export default function QuickAddModal({ isOpen, onClose }) {
  const { addReservation } = useReservations();

  const [formData, setFormData] = useState({
    guestName: '',
    phone: '',
    partySize: '2',
    date: new Date().toISOString().split('T')[0],
    time: '7:00 PM', // Standard 12-hour AM/PM format by default
    area: 'Main Dining Room',
    notes: '',
    status: 'Confirmed'
  });

  if (!isOpen) return null;

  // Standard 12-Hour AM/PM Dining Time Slots
  const standardTimeSlots = [
    '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
    '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
    '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedPartySize = parseInt(formData.partySize, 10) || 1;
    const isSeatedImmediately = formData.status === 'Seated';

    addReservation({
      ...formData,
      guestName: formData.guestName.trim() || 'Walk-In Guest',
      partySize: selectedPartySize,
      time: formData.time, // Saved as standard AM/PM format (e.g. "7:00 PM")
      email: 'walk-in@vinnysatnight.com',
      ...(isSeatedImmediately && {
        seatedAt: new Date().toISOString(),
        serviceSteps: { apps: false, mains: false, dessert: false, checkDropped: false, paid: false }
      })
    });

    onClose();

    // Reset Form State
    setFormData({
      guestName: '',
      phone: '',
      partySize: '2',
      date: new Date().toISOString().split('T')[0],
      time: '7:00 PM',
      area: 'Main Dining Room',
      notes: '',
      status: 'Confirmed'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md font-['Montserrat']">
      <div className="relative w-full max-w-lg bg-[#181818] border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Italian Tricolore Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#00a859] via-neutral-100 to-[#d9383a]" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center space-x-2 text-[#c9a063] font-black text-lg font-['Playfair_Display']">
            <PlusCircle className="w-5 h-5 text-[#00a859]" />
            <span>Walk-In / Add Reservation</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-100 hover:bg-[#121212] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                Guest Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#c9a063] absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Marco Rossi"
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-neutral-100 text-sm focus:outline-none focus:border-[#c9a063]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#c9a063] absolute left-3 top-3" />
                <input
                  type="tel"
                  placeholder="(555) 000-0000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-neutral-100 text-sm focus:outline-none focus:border-[#c9a063]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                Party Size
              </label>
              <div className="relative">
                <Users className="w-4 h-4 text-[#00a859] absolute left-3 top-3" />
                <select
                  value={formData.partySize}
                  onChange={(e) => setFormData({ ...formData, partySize: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl pl-9 pr-2 py-2.5 text-[#00a859] font-bold text-sm focus:outline-none focus:border-[#c9a063]"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((n) => (
                    <option key={n} value={n}>{n} Guests</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#c9a063] absolute left-2.5 top-3" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl pl-8 pr-2 py-2.5 text-[#c9a063] text-xs focus:outline-none focus:border-[#c9a063]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                Time
              </label>
              <div className="relative">
                <Clock className="w-4 h-4 text-[#c9a063] absolute left-2.5 top-3" />
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl pl-8 pr-2 py-2.5 text-neutral-100 text-xs focus:outline-none focus:border-[#c9a063]"
                >
                  {standardTimeSlots.map((slot) => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                Seating Area
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#c9a063] absolute left-3 top-3" />
                <select
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  className="w-full bg-[#121212] border border-neutral-800 rounded-xl pl-9 pr-2 py-2.5 text-neutral-100 text-xs focus:outline-none focus:border-[#c9a063]"
                >
                  <option value="Main Dining Room">Main Dining Room</option>
                  <option value="Bar & Lounge">Bar & Lounge</option>
                  <option value="Outdoor Patio">Outdoor Patio</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-[#121212] border border-neutral-800 rounded-xl px-3 py-2.5 text-[#c9a063] font-bold text-xs focus:outline-none focus:border-[#c9a063]"
              >
                <option value="Confirmed">Confirmed</option>
                <option value="Seated">Seated Immediately</option>
                <option value="Pending">Pending Request</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-neutral-300 mb-1">
              Notes / Table #
            </label>
            <div className="relative">
              <MessageSquare className="w-4 h-4 text-[#c9a063] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Table #, allergies, or special occasion..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full bg-[#121212] border border-neutral-800 rounded-xl pl-9 pr-3 py-2.5 text-neutral-100 text-xs focus:outline-none focus:border-[#c9a063] placeholder:text-neutral-600"
              />
            </div>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-3 rounded-xl border border-neutral-800 text-neutral-400 font-bold text-xs uppercase tracking-wider hover:bg-[#121212] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="w-1/2 py-3 rounded-xl bg-[#c9a063] hover:bg-[#b58c50] text-neutral-950 font-black text-xs uppercase tracking-widest shadow-lg transition-all"
            >
              Add Reservation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}