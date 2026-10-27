import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useReservations } from '../context/ReservationContext';
import StatsOverview from './StatsOverview';
import QuickAddModal from './QuickAddModal';
import { 
  Search, Plus, Calendar, Filter, Phone, Trash2, Check, 
  UserCheck, CheckCircle2, AlertCircle, Cpu, Users, Edit3, 
  Clock, AlertTriangle, CheckSquare, Square, BarChart3, TrendingUp, X, Sparkles, LayoutGrid, ListOrdered, Move, Link2, Unlink, Bell, Radio, CalendarDays, ChevronLeft, ChevronRight, Edit, Layers
} from 'lucide-react';

// Web Audio API Synthesizer Chime
const playReservationDing = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    const ctx = new AudioContext();
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.frequency.setValueAtTime(1318.51, ctx.currentTime);
    osc2.frequency.setValueAtTime(1661.22, ctx.currentTime);

    osc1.type = 'sine';
    osc2.type = 'sine';

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();
    osc1.stop(ctx.currentTime + 1.2);
    osc2.stop(ctx.currentTime + 1.2);
  } catch (err) {
    console.warn("Audio chime prevented:", err);
  }
};

export default function HostDashboard({ onOpenCalendar }) {
  const {
    reservations = [],
    updateStatus = () => {},
    updateReservation = () => {},
    deleteReservation = () => {},
    statusFilter = 'All',
    setStatusFilter = () => {},
    searchQuery = '',
    setSearchQuery = () => {}
  } = useReservations() || {};

  // Compute Today's Date String (YYYY-MM-DD)
  const getTodayString = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const todayStr = getTodayString();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);

  // Reservation Merging Selection State
  const [selectedResIdsForMerge, setSelectedResIdsForMerge] = useState([]);
  const [isMergeModeActive, setIsMergeModeActive] = useState(false);

  // Dynamic Floor Layout State (Enables moving tables around)
  const [tableLayout, setTableLayout] = useState([
    { id: 1, name: 'T1', section: 'left', maxCap: 4, status: 'available' },
    { id: 2, name: 'T2', section: 'left', maxCap: 4, status: 'available' },
    { id: 3, name: 'T3', section: 'left', maxCap: 4, status: 'available' },
    { id: 4, name: 'T4', section: 'left', maxCap: 4, status: 'available' },
    { id: 5, name: 'T5', section: 'left', maxCap: 4, status: 'available' },
    { id: 6, name: 'T6', section: 'left', maxCap: 4, status: 'available' },
    { id: 7, name: 'T7', section: 'right', maxCap: 2, status: 'available' },
    { id: 8, name: 'T8', section: 'right', maxCap: 2, status: 'available' },
    { id: 9, name: 'T9', section: 'right', maxCap: 2, status: 'available' },
    { id: 10, name: 'T10', section: 'right', maxCap: 2, status: 'available' },
    { id: 11, name: 'T11', section: 'right', maxCap: 2, status: 'available' },
    { id: 12, name: 'T12', section: 'right', maxCap: 2, status: 'available' }
  ]);

  const [isReorderMode, setIsReorderMode] = useState(false);

  // Calendar Navigation State
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedCalendarDateStr, setSelectedCalendarDateStr] = useState(null);

  // Audio Notification Listener
  const prevReservationCount = useRef(reservations.length);

  useEffect(() => {
    if (reservations.length > prevReservationCount.current) {
      playReservationDing();
    }
    prevReservationCount.current = reservations.length;
  }, [reservations.length]);

  // Touch & Selection State
  const [selectedResId, setSelectedResId] = useState(null);
  const [draggedResId, setDraggedResId] = useState(null);
  const [dragOverTable, setDragOverTable] = useState(null);

  // Physical Table Station Merging State
  const [selectedTableForMerge, setSelectedTableForMerge] = useState(null);
  const [mergeConfirmModal, setMergeConfirmModal] = useState({ isOpen: false, sourceTable: null, targetTable: null });
  const [joinedTableGroups, setJoinedTableGroups] = useState([]);

  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const getTableMaxCapacity = (tableNum) => (tableNum <= 6 ? 4 : 2);

  // Compute Graphic Analytics (Busiest Days & Hourly Breakdown)
  const analyticsData = useMemo(() => {
    const dayOfWeekCovers = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
    const hourlyCovers = {};

    reservations
      .filter((r) => !r.isDeleted)
      .forEach((r) => {
        const partyCount = Number(r.partySize || 1);
        if (r.date) {
          const d = new Date(r.date + 'T00:00:00');
          if (!isNaN(d.getTime())) {
            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const dayName = dayNames[d.getDay()];
            dayOfWeekCovers[dayName] = (dayOfWeekCovers[dayName] || 0) + partyCount;
          }
        }
        if (r.time) {
          const hourKey = r.time.split(':')[0] + (r.time.toLowerCase().includes('pm') ? ' PM' : ' AM');
          hourlyCovers[hourKey] = (hourlyCovers[hourKey] || 0) + partyCount;
        }
      });

    const maxDayCovers = Math.max(...Object.values(dayOfWeekCovers), 1);
    const maxHourCovers = Math.max(...Object.values(hourlyCovers), 1);

    return { dayOfWeekCovers, maxDayCovers, hourlyCovers, maxHourCovers };
  }, [reservations]);

  // STRICT TODAY-ONLY ROUTING
  const todaysReservations = useMemo(() => {
    return reservations.filter((r) => r.date === todayStr && !r.isDeleted);
  }, [reservations, todayStr]);

  const upcomingReservationsCount = useMemo(() => {
    return reservations.filter((r) => r.date > todayStr && !r.isDeleted).length;
  }, [reservations, todayStr]);

  // Calendar Day Map
  const reservationsByDateMap = useMemo(() => {
    const map = {};
    reservations.filter(r => !r.isDeleted && r.date).forEach(r => {
      if (!map[r.date]) map[r.date] = [];
      map[r.date].push(r);
    });
    return map;
  }, [reservations]);

  // Calendar Grid Generator
  const calendarGrid = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ dayNum: null, dateStr: null });
    }
    for (let d = 1; d <= totalDays; d++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;
      days.push({ dayNum: d, dateStr });
    }
    return { year, monthName: calendarDate.toLocaleString('default', { month: 'long' }), days };
  }, [calendarDate]);

  const handlePrevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));
  };

  // MERGE PARTY RESERVATIONS FUNCTIONALITY
  const toggleResSelectionForMerge = (id) => {
    if (selectedResIdsForMerge.includes(id)) {
      setSelectedResIdsForMerge(selectedResIdsForMerge.filter(mId => mId !== id));
    } else {
      setSelectedResIdsForMerge([...selectedResIdsForMerge, id]);
    }
  };

  const handleMergeSelectedReservations = () => {
    if (selectedResIdsForMerge.length < 2) return;
    
    const targetRes = todaysReservations.find(r => r.id === selectedResIdsForMerge[0]);
    const mergedResList = todaysReservations.filter(r => selectedResIdsForMerge.includes(r.id));
    
    const combinedPartySize = mergedResList.reduce((sum, r) => sum + Number(r.partySize || 1), 0);
    const combinedGuestName = `${targetRes.guestName} (Party of ${combinedPartySize} - Merged)`;
    const combinedNotes = mergedResList.map(r => `${r.guestName} (${r.partySize}p)`).join(' + ');

    updateReservation(targetRes.id, {
      partySize: combinedPartySize,
      guestName: combinedGuestName,
      notes: `Merged Party: ${combinedNotes}`
    });

    selectedResIdsForMerge.slice(1).forEach(id => {
      deleteReservation(id);
    });

    setSelectedResIdsForMerge([]);
    setIsMergeModeActive(false);
  };

  // REORDER TABLE LAYOUT
  const handleMoveTablePosition = (draggedId, targetId) => {
    const updated = [...tableLayout];
    const dragIdx = updated.findIndex(t => t.id === draggedId);
    const targetIdx = updated.findIndex(t => t.id === targetId);

    if (dragIdx >= 0 && targetIdx >= 0) {
      const [removed] = updated.splice(dragIdx, 1);
      updated.splice(targetIdx, 0, removed);
      setTableLayout(updated);
    }
  };

  // PHYSICAL TABLE STATION MERGE HANDLERS
  const confirmTableMerge = () => {
    const { sourceTable, targetTable } = mergeConfirmModal;
    if (!sourceTable || !targetTable) return;

    let updatedGroups = [...joinedTableGroups];
    const existingGroupIndex = updatedGroups.findIndex(g => g.tables.includes(targetTable) || g.tables.includes(sourceTable));

    if (existingGroupIndex >= 0) {
      const group = updatedGroups[existingGroupIndex];
      if (!group.tables.includes(sourceTable)) group.tables.push(sourceTable);
      if (!group.tables.includes(targetTable)) group.tables.push(targetTable);
      group.name = `T${group.tables.sort((a,b)=>a-b).join('+')}`;
      group.capacity = group.tables.reduce((sum, t) => sum + getTableMaxCapacity(t), 0);
    } else {
      const newTables = [sourceTable, targetTable].sort((a, b) => a - b);
      const newGroup = {
        id: `group-${Date.now()}`,
        tables: newTables,
        name: `T${newTables.join('+')}`,
        capacity: newTables.reduce((sum, t) => sum + getTableMaxCapacity(t), 0)
      };
      updatedGroups.push(newGroup);
    }

    setJoinedTableGroups(updatedGroups);
    setMergeConfirmModal({ isOpen: false, sourceTable: null, targetTable: null });
  };

  const handleUnjoinGroup = (groupId) => {
    setJoinedTableGroups(joinedTableGroups.filter(g => g.id !== groupId));
  };

  const getTableDisplayInfo = (tableNum) => {
    const group = joinedTableGroups.find(g => g.tables.includes(tableNum));
    if (!group) {
      return { isPrimary: true, group: null, displayName: `T${tableNum}`, maxCap: getTableMaxCapacity(tableNum) };
    }
    const primaryTable = Math.min(...group.tables);
    if (tableNum === primaryTable) {
      return { isPrimary: true, group, displayName: `${group.name}`, maxCap: group.capacity };
    }
    return { isPrimary: false, group, primaryTable };
  };

  const getStandardTurnTime = (partySize) => {
    const size = Number(partySize) || 2;
    if (size <= 2) return 75;
    if (size <= 4) return 90;
    if (size <= 6) return 105;
    return 120;
  };

  const getTableTimerInfo = (seatedAtISO, partySize) => {
    const seatedTime = seatedAtISO ? new Date(seatedAtISO).getTime() : new Date().getTime();
    const now = new Date().getTime();
    const elapsedMins = Math.max(0, Math.floor((now - seatedTime) / (1000 * 60)));
    const targetMins = getStandardTurnTime(partySize);
    const remainingMins = targetMins - elapsedMins;

    return { elapsedMins, targetMins, remainingMins: Math.abs(remainingMins), isOverdue: remainingMins <= 0 };
  };

  const filteredReservations = useMemo(() => {
    return todaysReservations.filter((res) => {
      const matchesStatus = statusFilter === 'All' || res.status === statusFilter;
      const query = searchQuery ? searchQuery.toLowerCase().trim() : '';
      const guestNameLower = res.guestName ? res.guestName.toLowerCase() : '';
      return matchesStatus && (!query || guestNameLower.includes(query) || (res.phone && res.phone.includes(query)));
    });
  }, [todaysReservations, statusFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    const counts = { All: todaysReservations.length, Confirmed: 0, Seated: 0, Completed: 0, Cancelled: 0 };
    todaysReservations.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });
    return counts;
  }, [todaysReservations]);

  const handleSeatTable = (id, tableNum = null) => {
    const seatedAt = new Date().toISOString();
    const defaultSteps = { apps: false, mains: false, dessert: false, checkDropped: false, paid: false };
    
    if (updateReservation) {
      updateReservation(id, { 
        status: 'Seated', 
        seatedAt: seatedAt,
        serviceSteps: defaultSteps,
        ...(tableNum && { tableNum: tableNum })
      });
    } else {
      updateStatus(id, 'Seated');
    }
    setSelectedResId(null);
  };

  const handleClearSeatAndRestoreTables = (resId, tableNum) => {
    updateStatus(resId, 'Completed');
    const group = joinedTableGroups.find(g => g.tables.includes(tableNum));
    if (group) {
      const remainingPartiesInGroup = todaysReservations.filter(
        r => group.tables.includes(r.tableNum) && r.status === 'Seated' && r.id !== resId
      );
      if (remainingPartiesInGroup.length === 0) {
        setJoinedTableGroups(joinedTableGroups.filter(g => g.id !== group.id));
      }
    }
  };

  const handleTableCardClick = (tableNum) => {
    if (isReorderMode) return;

    if (selectedResId) {
      handleSeatTable(selectedResId, tableNum);
      return;
    }

    if (!selectedTableForMerge) {
      setSelectedTableForMerge(tableNum);
    } else if (selectedTableForMerge !== tableNum) {
      setMergeConfirmModal({
        isOpen: true,
        sourceTable: selectedTableForMerge,
        targetTable: tableNum
      });
      setSelectedTableForMerge(null);
    } else {
      setSelectedTableForMerge(null);
    }
  };

  const handleResDragStart = (e, resId) => {
    setDraggedResId(resId);
    e.dataTransfer.setData('text/plain', resId);
  };

  const handleDragOver = (e, tableNum) => {
    e.preventDefault();
    setDragOverTable(tableNum);
  };

  const handleDragLeave = () => {
    setDragOverTable(null);
  };

  const handleDropToSeat = (e, tableNum) => {
    e.preventDefault();
    const resId = e.dataTransfer.getData('text/plain') || draggedResId;
    if (resId) {
      handleSeatTable(resId, tableNum);
    }
    setDraggedResId(null);
    setDragOverTable(null);
  };

  const handleToggleStep = (res, stepKey) => {
    if (!updateReservation) return;
    const currentSteps = res.serviceSteps || { apps: false, mains: false, dessert: false, checkDropped: false, paid: false };
    const updatedSteps = { ...currentSteps, [stepKey]: !currentSteps[stepKey] };
    updateReservation(res.id, { serviceSteps: updatedSteps });
  };

  const serviceChecklist = [
    { key: 'apps', label: 'Antipasti / Drinks' },
    { key: 'mains', label: 'Primi & Secondi' },
    { key: 'dessert', label: 'Dolci & Espresso' },
    { key: 'checkDropped', label: 'Conto (Check Dropped)' },
    { key: 'paid', label: 'Saldato & Bussing' }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Confirmed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200">Confirmed</span>;
      case 'Seated':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-sky-100 text-sky-800 border border-sky-200 animate-pulse">Seated</span>;
      case 'Completed':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-slate-100 text-slate-700 border border-slate-200">Completed</span>;
      case 'Cancelled':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-rose-100 text-rose-800 border border-rose-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide bg-amber-100 text-amber-800 border border-amber-200">Booked</span>;
    }
  };

  const renderVisualTableCard = (tableObj) => {
    const tableNum = tableObj.id;
    const displayInfo = getTableDisplayInfo(tableNum);

    if (!displayInfo.isPrimary) {
      return (
        <div key={`joint-${tableNum}`} className="relative p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 flex flex-col items-center justify-center min-h-[120px]">
          <div className="w-7 h-7 rounded-lg border border-dashed border-slate-300 flex items-center justify-center font-mono text-xs font-semibold text-slate-500 mb-1 bg-white">
            T{tableNum}
          </div>
          <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">Merged Station Space</span>
        </div>
      );
    }

    const effectiveTables = displayInfo.group ? displayInfo.group.tables : [tableNum];
    const maxCap = displayInfo.maxCap;
    const tableParties = filteredReservations.filter(r => effectiveTables.includes(Number(r.tableNum)) && r.status === 'Seated');
    const isSeated = tableParties.length > 0;
    const currentSeatedGuests = tableParties.reduce((sum, p) => sum + Number(p.partySize || 1), 0);
    const remainingSeats = Math.max(0, maxCap - currentSeatedGuests);
    const isHovering = dragOverTable === tableNum;
    const isSelectedForMerge = selectedTableForMerge === tableNum;

    return (
      <div
        key={`table-${tableNum}`}
        draggable={isReorderMode}
        onClick={() => handleTableCardClick(tableNum)}
        onDragStart={(e) => {
          if (isReorderMode) {
            e.dataTransfer.setData('text/table-reorder', tableNum);
          }
        }}
        onDragOver={(e) => handleDragOver(e, tableNum)}
        onDragLeave={handleDragLeave}
        onDrop={(e) => {
          const reorderId = Number(e.dataTransfer.getData('text/table-reorder'));
          if (reorderId) {
            handleMoveTablePosition(reorderId, tableNum);
          } else {
            handleDropToSeat(e, tableNum);
          }
        }}
        className={`relative p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm ${
          isReorderMode
            ? 'border-dashed border-emerald-400 bg-emerald-50/70 cursor-grab hover:bg-emerald-100/50'
            : selectedResId
            ? 'border-sky-500 bg-sky-50 shadow-md ring-2 ring-sky-400/30'
            : isSelectedForMerge
            ? 'border-amber-500 bg-amber-50 shadow-md ring-2 ring-amber-400/30'
            : isHovering
            ? 'border-emerald-500 bg-emerald-50 shadow-md ring-2 ring-emerald-400'
            : isSeated
            ? 'border-sky-300 bg-sky-50/60 shadow'
            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow'
        }`}
      >
        <div className="relative z-10 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs">
          <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center font-mono">
                {displayInfo.displayName}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900">
                  {maxCap}-Top Station
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  Table {tableNum} {isReorderMode && '(Draggable)'}
                </span>
              </div>
            </div>

            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
              remainingSeats === 0 ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}>
              {remainingSeats} Open
            </span>
          </div>

          {tableParties.length > 0 ? (
            <div className="space-y-1.5 mt-1.5">
              {tableParties.map(p => (
                <div key={p.id} className="flex items-center justify-between text-xs bg-slate-50 p-2 rounded-lg border border-slate-200">
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">{p.guestName}</span>
                    <span className="text-[11px] text-sky-700 font-mono font-medium">{p.partySize} Guests • {p.time}</span>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleClearSeatAndRestoreTables(p.id, p.tableNum); }}
                    className="text-[10px] bg-slate-900 hover:bg-slate-800 text-white font-bold px-2 py-1 rounded transition-colors"
                  >
                    Clear
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic py-1 text-center font-mono">
              {isReorderMode ? '↕️ Drag to move table' : selectedResId ? '👉 Tap to seat / Drop here' : 'Available Table'}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8 py-6 font-['Montserrat'] text-slate-900 bg-slate-100 min-h-screen">
      
      {/* HEADER BANNER */}
      <div className="relative mb-6 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-slate-500 text-xs font-semibold tracking-wider uppercase mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-slate-900 font-bold">Vinny's Ristorante</span>
              <span className="text-slate-300">•</span>
              <span>Lenoper IntelOS™ System</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-['Playfair_Display'] tracking-tight">
              Main Dining Room (Today)
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsMergeModeActive(!isMergeModeActive)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all shadow-2xs ${
                isMergeModeActive ? 'bg-amber-500 text-white ring-2 ring-amber-300' : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>{isMergeModeActive ? 'Cancel Party Merge' : 'Merge Party Reservations'}</span>
            </button>

            <button
              onClick={() => setIsReorderMode(!isReorderMode)}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold uppercase text-xs tracking-wider transition-all shadow-2xs ${
                isReorderMode ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              <Move className="w-4 h-4" />
              <span>{isReorderMode ? 'Done Moving Floor' : 'Move Floor Layout'}</span>
            </button>

            <button
              onClick={() => setIsCalendarModalOpen(true)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase text-xs tracking-wider px-4 py-3 rounded-xl transition-colors shadow"
            >
              <CalendarDays className="w-4 h-4 text-emerald-400" />
              <span>Upcoming Year Calendar</span>
            </button>

            <button
              onClick={() => setIsAnalyticsOpen(true)}
              className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold uppercase text-xs tracking-wider px-4 py-3 rounded-xl transition-colors shadow-2xs"
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Covers Graphics Analytics</span>
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase text-xs tracking-wider px-5 py-3 rounded-xl shadow transition-colors"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Add Reservation</span>
            </button>
          </div>
        </div>
      </div>

      <StatsOverview />

      {/* MERGE TOOLBAR BANNER */}
      {isMergeModeActive && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-amber-600" />
            <div>
              <span className="font-bold text-slate-900 text-sm block">Party Merge Tool Active</span>
              <span className="text-xs text-slate-600">Select 2 or more reservations from today's queue to combine into a single party booking.</span>
            </div>
          </div>
          {selectedResIdsForMerge.length >= 2 && (
            <button
              onClick={handleMergeSelectedReservations}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase px-5 py-2.5 rounded-xl shadow transition-colors"
            >
              Combine {selectedResIdsForMerge.length} Selected Bookings
            </button>
          )}
        </div>
      )}

      {/* CONTROL BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search today's reservations by Guest Name, Phone, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 text-xs focus:outline-none focus:border-slate-900 placeholder:text-slate-400 font-medium"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-bold mr-2">Filter Today:</span>
          {['All', 'Confirmed', 'Seated', 'Completed', 'Cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              <span>{status}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                statusFilter === status ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {statusCounts[status] || 0}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* FLOOR MAP & QUEUE GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: Floor Layout with Drag Reorder & Table Station Merging */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h2 className="text-xl font-bold text-slate-900 font-['Playfair_Display'] flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-emerald-600" /> Dining Room Floor Map
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">
              {isReorderMode ? '↕️ Drag table cards to rearrange floor' : 'Drag reservation to table, or tap card to seat'}
            </span>
          </div>

          {joinedTableGroups.length > 0 && (
            <div className="mb-4 space-y-2">
              <span className="text-[11px] uppercase font-bold tracking-wider text-emerald-700 block">
                Active Joined Table Stations:
              </span>
              <div className="flex flex-wrap gap-2">
                {joinedTableGroups.map((group) => (
                  <div key={group.id} className="bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg flex items-center gap-2.5 text-xs">
                    <span className="font-bold text-slate-900">{group.name} ({group.capacity}-Top Station)</span>
                    <button onClick={() => handleUnjoinGroup(group.id)} className="text-slate-500 hover:text-rose-600 flex items-center gap-1 text-[11px]">
                      <Unlink className="w-3 h-3" /> Separate Tables
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <div className="text-center py-2 bg-white border border-slate-200 rounded-lg mb-5 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-2xs">
              🚪 Entrance & Kitchen Pass
            </div>

            <div className="grid grid-cols-2 gap-5 min-w-[480px]">
              <div className="space-y-3.5">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1">
                  Left Row (4-Tops)
                </div>
                {tableLayout.filter(t => t.section === 'left').map((table) => renderVisualTableCard(table))}
              </div>

              <div className="space-y-3.5">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-1">
                  Right Row (2-Tops)
                </div>
                {tableLayout.filter(t => t.section === 'right').map((table) => renderVisualTableCard(table))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Active Reservation Queue */}
        <div className="lg:col-span-5 space-y-3.5">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <span className="text-base font-bold text-slate-900 font-['Playfair_Display']">Today's Queue ({filteredReservations.length})</span>
            <span className="text-[11px] text-slate-500 font-mono">Drag card to seat</span>
          </div>

          <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
            {filteredReservations.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-xs font-mono">
                No reservations scheduled for today ({todayStr}). Check the <button onClick={() => setIsCalendarModalOpen(true)} className="text-sky-700 underline font-semibold">Upcoming Calendar</button> for future dates.
              </div>
            ) : (
              filteredReservations.map((res) => {
                const timerInfo = res.status === 'Seated' ? getTableTimerInfo(res.seatedAt, res.partySize) : null;
                const steps = res.serviceSteps || { apps: false, mains: false, dessert: false, checkDropped: false, paid: false };
                const isSelected = selectedResId === res.id;
                const isSelectedForMerge = selectedResIdsForMerge.includes(res.id);

                return (
                  <div
                    key={res.id}
                    draggable={!isMergeModeActive}
                    onClick={() => {
                      if (isMergeModeActive) {
                        toggleResSelectionForMerge(res.id);
                      } else {
                        setSelectedResId(isSelected ? null : res.id);
                      }
                    }}
                    onDragStart={(e) => handleResDragStart(e, res.id)}
                    className={`bg-white border rounded-2xl p-4 shadow-2xs transition-all cursor-grab active:cursor-grabbing ${
                      isSelectedForMerge
                        ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400'
                        : isSelected 
                        ? 'border-sky-500 bg-sky-50/50 ring-1 ring-sky-400' 
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-2xl font-extrabold text-slate-900 font-['Playfair_Display']">{res.time}</span>
                        <span className="text-[11px] text-slate-500 block font-mono">{res.id}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {isMergeModeActive ? (
                          <input
                            type="checkbox"
                            checked={isSelectedForMerge}
                            onChange={() => toggleResSelectionForMerge(res.id)}
                            className="w-5 h-5 rounded text-amber-600 border-slate-300"
                          />
                        ) : (
                          <>
                            {getStatusBadge(res.status)}
                            <button 
                              onClick={(e) => { e.stopPropagation(); setEditingReservation(res); }}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                              title="Edit Reservation"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-0.5 mb-3">
                      <h3 className="text-lg font-bold text-slate-900 font-['Playfair_Display']">{res.guestName}</h3>
                      <div className="text-xs text-slate-600 font-semibold flex items-center gap-2">
                        <span className="text-emerald-700">{res.partySize} Guests</span>
                        <span>•</span>
                        <span>{res.area || 'Main Dining'}</span>
                        {res.tableNum && <span className="text-sky-700">• Table {res.tableNum}</span>}
                        {res.phone && <span className="text-slate-500">• {res.phone}</span>}
                      </div>
                      {res.notes && <p className="text-[11px] text-amber-700 font-medium italic mt-1">{res.notes}</p>}
                    </div>

                    {/* Timer */}
                    {res.status === 'Seated' && timerInfo && (
                      <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg mb-2.5 flex items-center justify-between text-xs text-slate-700 font-semibold font-mono">
                        <span>{timerInfo.elapsedMins}m elapsed</span>
                        <span>Target: {timerInfo.targetMins}m</span>
                      </div>
                    )}

                    {/* Service Checklist */}
                    {res.status === 'Seated' && (
                      <div className="mb-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Service Milestones:</span>
                        {serviceChecklist.map(({ key, label }) => {
                          const isChecked = steps[key] || false;
                          return (
                            <button
                              key={key}
                              onClick={(e) => { e.stopPropagation(); handleToggleStep(res, key); }}
                              className={`w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-md border transition-all ${
                                isChecked ? 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold' : 'bg-white border-slate-200 text-slate-700'
                              }`}
                            >
                              <span className={isChecked ? 'line-through opacity-75' : ''}>{label}</span>
                              {isChecked && <span className="text-emerald-600 font-bold">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {/* Action Toolbar */}
                    {!isMergeModeActive && (
                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          {res.status !== 'Seated' && (
                            <button onClick={(e) => { e.stopPropagation(); handleSeatTable(res.id); }} className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-lg transition-colors">Seat Guest</button>
                          )}
                          {res.status === 'Seated' && (
                            <button onClick={(e) => { e.stopPropagation(); handleClearSeatAndRestoreTables(res.id, res.tableNum); }} className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg">Complete</button>
                          )}
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); deleteReservation(res.id); }} className="text-slate-400 hover:text-rose-600 p-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* FULL INTERACTIVE YEAR & MONTH CALENDAR MODAL */}
      {isCalendarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-['Montserrat']">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-3">
                <CalendarDays className="w-6 h-6 text-emerald-600" />
                <h3 className="text-2xl font-bold text-slate-900 font-['Playfair_Display']">
                  Upcoming Reservations Calendar ({calendarGrid.monthName} {calendarGrid.year})
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handlePrevMonth} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={handleNextMonth} className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button onClick={() => setIsCalendarModalOpen(false)} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 ml-2">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 flex-1 overflow-hidden">
              <div className="md:col-span-7 flex flex-col overflow-y-auto pr-2">
                <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-500 uppercase mb-2">
                  <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {calendarGrid.days.map((item, idx) => {
                    if (!item.dayNum) return <div key={`empty-${idx}`} className="h-24 bg-slate-50/50 rounded-2xl" />;
                    const dayResList = reservationsByDateMap[item.dateStr] || [];
                    const isSelected = selectedCalendarDateStr === item.dateStr;
                    const isToday = item.dateStr === todayStr;

                    return (
                      <div
                        key={item.dateStr}
                        onClick={() => setSelectedCalendarDateStr(item.dateStr)}
                        className={`h-24 p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected 
                            ? 'border-slate-900 bg-slate-900 text-white shadow-md' 
                            : isToday 
                            ? 'border-emerald-500 bg-emerald-50/60 font-bold' 
                            : 'border-slate-200 bg-white hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-mono font-bold ${isSelected ? 'text-white' : 'text-slate-900'}`}>{item.dayNum}</span>
                          {isToday && <span className="text-[9px] uppercase bg-emerald-600 text-white px-1.5 rounded">Today</span>}
                        </div>
                        {dayResList.length > 0 && (
                          <div className={`text-[10px] font-mono px-2 py-1 rounded-lg text-center font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                            {dayResList.length} booking{dayResList.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="md:col-span-5 bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col overflow-hidden">
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between pb-2 border-b border-slate-200">
                  <span>Reservations for: <span className="text-emerald-700">{selectedCalendarDateStr || todayStr}</span></span>
                </h4>

                <div className="space-y-2.5 flex-1 overflow-y-auto pr-1">
                  {(!selectedCalendarDateStr ? reservationsByDateMap[todayStr] : reservationsByDateMap[selectedCalendarDateStr])?.length ? (
                    (reservationsByDateMap[selectedCalendarDateStr || todayStr] || []).map(res => (
                      <div key={res.id} className="bg-white border border-slate-200 p-3 rounded-xl shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 text-xs">{res.guestName}</span>
                          <span className="text-xs font-mono font-bold text-sky-700">{res.time}</span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {res.partySize} Guests • {res.phone || 'No phone'} • <span className="font-semibold text-slate-900">Table {res.tableNum || 'Unassigned'}</span>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => { setEditingReservation(res); }}
                            className="text-[10px] bg-slate-900 text-white px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-slate-800"
                          >
                            <Edit className="w-3 h-3" /> Edit Booking
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-400 text-xs font-mono">
                      No reservations booked for this date. Click a date on the calendar to inspect.
                    </div>
                  )}
                </div>
              </div>

            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button onClick={() => setIsCalendarModalOpen(false)} className="px-6 py-2.5 bg-slate-900 text-white font-bold text-xs uppercase rounded-xl hover:bg-slate-800 transition-colors">
                Close Calendar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GRAPHIC ANALYTICS MODAL (BUSIEST DAYS & PEAK HOURLY BREAKDOWN) */}
      {isAnalyticsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-['Montserrat']">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-xl font-bold text-slate-900 font-['Playfair_Display'] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" /> Busiest Days & Hourly Covers Graphic Report
              </h3>
              <button onClick={() => setIsAnalyticsOpen(false)} className="text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-1">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Busiest Days (Covers Volume)</h4>
                <div className="grid grid-cols-7 gap-2 items-end h-36 pt-4">
                  {Object.entries(analyticsData.dayOfWeekCovers).map(([day, covers]) => {
                    const heightPercent = Math.round((covers / analyticsData.maxDayCovers) * 100);
                    return (
                      <div key={day} className="flex flex-col items-center gap-1.5 h-full justify-end">
                        <span className="text-[10px] font-mono font-bold text-slate-700">{covers}</span>
                        <div 
                          style={{ height: `${Math.max(heightPercent, 8)}%` }} 
                          className="w-full bg-slate-900 rounded-t-lg transition-all" 
                        />
                        <span className="text-[11px] font-bold text-slate-600">{day}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Peak Hourly Covers Breakdown</h4>
                <div className="space-y-2">
                  {Object.keys(analyticsData.hourlyCovers).length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs font-mono">No hourly time data recorded.</div>
                  ) : (
                    Object.entries(analyticsData.hourlyCovers).map(([hour, covers]) => {
                      const widthPercent = Math.round((covers / analyticsData.maxHourCovers) * 100);
                      return (
                        <div key={hour} className="flex items-center gap-3 text-xs">
                          <span className="w-16 font-mono font-bold text-slate-700">{hour}</span>
                          <div className="flex-1 bg-slate-200 h-4 rounded-full overflow-hidden">
                            <div style={{ width: `${widthPercent}%` }} className="bg-emerald-600 h-full rounded-full transition-all" />
                          </div>
                          <span className="w-12 font-mono font-bold text-slate-900 text-right">{covers} p</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 text-right">
              <button onClick={() => setIsAnalyticsOpen(false)} className="px-5 py-2 bg-slate-900 text-white font-bold text-xs uppercase rounded-lg">Close Report</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT RESERVATION MODAL */}
      {editingReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-['Montserrat']">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-xl font-bold text-slate-900 font-['Playfair_Display']">Edit Reservation</h3>
              <button onClick={() => setEditingReservation(null)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                updateReservation(editingReservation.id, editingReservation);
                setEditingReservation(null);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Guest Name</label>
                <input
                  type="text"
                  value={editingReservation.guestName || ''}
                  onChange={(e) => setEditingReservation({...editingReservation, guestName: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={editingReservation.date || ''}
                    onChange={(e) => setEditingReservation({...editingReservation, date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    value={editingReservation.time || ''}
                    onChange={(e) => setEditingReservation({...editingReservation, time: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Party Size (Guests)</label>
                  <input
                    type="number"
                    min="1"
                    value={editingReservation.partySize || 2}
                    onChange={(e) => setEditingReservation({...editingReservation, partySize: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Table #</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    value={editingReservation.tableNum || ''}
                    onChange={(e) => setEditingReservation({...editingReservation, tableNum: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                    placeholder="e.g. 4"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editingReservation.phone || ''}
                  onChange={(e) => setEditingReservation({...editingReservation, phone: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-medium text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5">
                <button type="button" onClick={() => setEditingReservation(null)} className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl uppercase tracking-wider">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MERGE CONFIRMATION MODAL */}
      {mergeConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900 font-['Playfair_Display'] mb-2">
              Merge Table {mergeConfirmModal.sourceTable} & Table {mergeConfirmModal.targetTable}?
            </h3>
            <p className="text-xs text-slate-600 mb-5 leading-relaxed">Combines both table stations into a single large party station.</p>
            <div className="flex justify-end gap-2.5">
              <button onClick={() => setMergeConfirmModal({ isOpen: false, sourceTable: null, targetTable: null })} className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">Cancel</button>
              <button onClick={confirmTableMerge} className="px-5 py-2 bg-slate-900 text-white font-bold rounded-lg text-xs uppercase">Confirm Merge</button>
            </div>
          </div>
        </div>
      )}

      <QuickAddModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}