import React from 'react';
import { useReservations } from '../context/ReservationContext';
import { LayoutDashboard, CalendarPlus, Utensils, Cpu } from 'lucide-react';

export default function NavBar() {
  const { activeView, setActiveView } = useReservations();

  return (
    <header className="bg-[#141414] border-b border-[#00a859]/40 sticky top-0 z-40 shadow-xl">
      {/* Italian Flag Accent Stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-[#00a859] via-neutral-100 to-[#d9383a]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Sicilian Subtitle */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-[#1e1e1e] border border-[#c9a063]/40 flex items-center justify-center shadow-md">
              <Utensils className="w-6 h-6 text-[#00a859]" />
            </div>
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#c9a063] font-['Playfair_Display'] tracking-tight">
                  VINNY'S <span className="text-neutral-100 font-normal italic text-lg sm:text-xl">at night</span>
                </h1>
              </div>
              <p className="text-[11px] text-neutral-400 flex items-center gap-2 font-['Montserrat'] tracking-wider uppercase font-semibold mt-0.5">
                <span className="text-[#00a859]">Sicilian-Style Italian Dining</span>
                <span className="text-neutral-600">•</span>
                <span className="text-neutral-300 flex items-center gap-1 font-mono text-[10px] lowercase normal-case tracking-normal">
                  <Cpu className="w-3 h-3 text-[#c9a063]" />
                  Lenoper Intel System
                </span>
              </p>
            </div>
          </div>

          {/* Navigation Controls */}
          <nav className="flex items-center gap-2 bg-[#1a1a1a] p-1.5 rounded-xl border border-neutral-800">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-['Montserrat'] font-bold uppercase tracking-wider transition-all ${
                activeView === 'dashboard'
                  ? 'bg-[#00a859] text-neutral-950 shadow-lg shadow-[#00a859]/20'
                  : 'text-neutral-300 hover:text-[#c9a063] hover:bg-neutral-800/60'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Host Stand</span>
            </button>

            <button
              onClick={() => setActiveView('guest')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-['Montserrat'] font-bold uppercase tracking-wider transition-all ${
                activeView === 'guest'
                  ? 'bg-[#00a859] text-neutral-950 shadow-lg shadow-[#00a859]/20'
                  : 'text-neutral-300 hover:text-[#c9a063] hover:bg-neutral-800/60'
              }`}
            >
              <CalendarPlus className="w-4 h-4" />
              <span>Guest Booking</span>
            </button>
          </nav>

        </div>
      </div>
    </header>
  );
}