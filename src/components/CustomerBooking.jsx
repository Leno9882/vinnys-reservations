import React, { useState } from 'react';
import { useReservations } from '../context/ReservationContext';
import { Calendar, Clock, Users, MapPin, CheckCircle2, Sparkles, User, Mail, Phone, MessageSquare } from 'lucide-react';

export default function CustomerBooking() {
  const { addReservation } = useReservations();
  const [submittedRes, setSubmittedRes] = useState(null);

  const [formData, setFormData] = useState({
    guestName: '',
    email: '',
    phone: '',
    partySize: '2',
    date: new Date().toISOString().split('T')[0],
    time: '19:00',
    area: 'Main Dining Room',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const created = addReservation({
      ...formData,
      partySize: parseInt(formData.partySize, 10),
      status: 'Pending'
    });
    setSubmittedRes(created);
  };

  const handleReset = () => {
    setSubmittedRes(null);
    setFormData({
      guestName: '',
      email: '',
      phone: '',
      partySize: '2',
      date: new Date().toISOString().split('T')[0],
      time: '19:00',
      area: 'Main Dining Room',
      notes: ''
    });
  };

  if (submittedRes) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4">
        <div className="bg-neutral-900 border border-amber-500/30 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-500 to-amber-300 text-neutral-950 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-3xl font-bold font-serif text-amber-100 mb-2">
            Reservation Requested!
          </h2>
          <p className="text-neutral-400 text-sm mb-6">
            We have received your reservation request for <span className="text-amber-400 font-semibold">Vinny's at Night</span>.
          </p>

          <div className="bg-neutral-950/80 rounded-2xl p-6 border border-neutral-800 text-left space-y-3 mb-8">
            <div className="flex justify-between items-center pb-3 border-b border-neutral-800">
              <span className="text-xs uppercase tracking-wider text-neutral-400">Confirmation Code</span>
              <span className="text-amber-400 font-mono font-bold">{submittedRes.id}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-neutral-200">
              <span className="text-neutral-400">Guest Name:</span>
              <span className="font-medium">{submittedRes.guestName}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-neutral-200">
              <span className="text-neutral-400">Date & Time:</span>
              <span className="font-medium">{submittedRes.date} at {submittedRes.time}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-neutral-200">
              <span className="text-neutral-400">Party Size:</span>
              <span className="font-medium">{submittedRes.partySize} Guests</span>
            </div>
            <div className="flex justify-between items-center text-sm text-neutral-200">
              <span className="text-neutral-400">Seating Area:</span>
              <span className="font-medium">{submittedRes.area}</span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold py-3.5 px-6 rounded-xl shadow-lg transition-all"
          >
            Make Another Reservation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" /> Reserve A Table
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-amber-100 tracking-tight">
          Join Us At Vinny's
        </h2>
        <p className="text-neutral-400 text-sm mt-2">
          Experience authentic Italian dining. Book your evening table below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Contact Info */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-amber-500/90 pb-1 border-b border-neutral-800">
            Guest Details
          </h3>
          
          <div>
            <label className="block text-xs text-neutral-300 font-medium mb-1.5">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                required
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                placeholder="e.g. Marco Rossi"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-amber-100 text-sm focus:outline-none focus:border-amber-500 transition-all placeholder:text-neutral-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-neutral-300 font-medium mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@example.com"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-amber-100 text-sm focus:outline-none focus:border-amber-500 transition-all placeholder:text-neutral-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-300 font-medium mb-1.5">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 000-0000"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-amber-100 text-sm focus:outline-none focus:border-amber-500 transition-all placeholder:text-neutral-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Party Details */}
        <div className="space-y-4">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-amber-500/90 pb-1 border-b border-neutral-800">
            Table Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-neutral-300 font-medium mb-1.5">Party Size</label>
              <div className="relative">
                <Users className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <select
                  value={formData.partySize}
                  onChange={(e) => setFormData({ ...formData, partySize: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-amber-100 text-sm focus:outline-none focus:border-amber-500 transition-all"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-300 font-medium mb-1.5">Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-amber-100 text-sm focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-neutral-300 font-medium mb-1.5">Time</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
                <select
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-amber-100 text-sm focus:outline-none focus:border-amber-500 transition-all"
                >
                  {['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs text-neutral-300 font-medium mb-1.5">Seating Preference</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <select
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-amber-100 text-sm focus:outline-none focus:border-amber-500 transition-all"
              >
                <option value="Main Dining Room">Main Dining Room</option>
                <option value="Bar & Lounge">Bar & Lounge</option>
                <option value="Outdoor Patio">Outdoor Patio</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-neutral-300 font-medium mb-1.5">Special Requests / Dietary Restrictions</label>
            <div className="relative">
              <MessageSquare className="w-4 h-4 text-neutral-500 absolute left-3.5 top-3.5" />
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="High chair needed, allergies, special occasion..."
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl pl-10 pr-4 py-2.5 text-amber-100 text-sm focus:outline-none focus:border-amber-500 transition-all placeholder:text-neutral-600 resize-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold py-4 px-6 rounded-xl shadow-xl transition-all tracking-wide font-sans text-base"
        >
          Request Reservation
        </button>
      </form>
    </div>
  );
}