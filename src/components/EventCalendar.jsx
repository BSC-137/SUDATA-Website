import { useState, useMemo } from 'react';
import EventModal from './EventModal';
import { getSemesterInfo } from '../data/semesterDates';
import { getHolidayName } from '../data/publicHolidays';

const EventCalendar = ({ events }) => {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0 = January
  const [selectedEvent, setSelectedEvent] = useState(null);
  // ALL TAGS SELECTED BY DEFAULT
  const [activeFilters, setActiveFilters] = useState(new Set(['academic', 'social']));

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const availableYears = [2024, 2025, 2026]; // Can add more years as needed

  // Get semester week info for a given date using the config
  const getSemesterWeek = (day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return getSemesterInfo(dateStr, selectedYear);
  };

  // Check if date is a public holiday
  const getPublicHoliday = (day) => {
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return getHolidayName(dateStr, selectedYear);
  };

  // Filter events by active tags and selected year
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const eventYear = new Date(event.date).getFullYear();
      const yearMatches = eventYear === selectedYear;
      
      // If no filters are active, show no events
      if (activeFilters.size === 0) {
        return false;
      }
      
      // Only show events that match the active filters
      return yearMatches && activeFilters.has(event.type);
    });
  }, [events, activeFilters, selectedYear]);

  // Get events for selected month
  const monthEvents = useMemo(() => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === selectedMonth;
    });
  }, [filteredEvents, selectedMonth]);

  // Generate calendar grid for selected month
  const generateCalendar = () => {
    const firstDay = new Date(selectedYear, selectedMonth, 1);
    const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    const calendar = [];
    let day = 1;

    // Create calendar grid (6 weeks max)
    for (let week = 0; week < 6; week++) {
      const weekDays = [];
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        if ((week === 0 && dayOfWeek < startingDayOfWeek) || day > daysInMonth) {
          weekDays.push(null);
        } else {
          weekDays.push(day);
          day++;
        }
      }
      calendar.push(weekDays);
      if (day > daysInMonth) break;
    }

    return calendar;
  };

  const calendar = generateCalendar();

  // Get events for a specific day
  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayEvents = monthEvents.filter(event => event.date === dateStr);
    // Sort by time (chronological order)
    return dayEvents.sort((a, b) => {
      const timeA = a.time || '00:00';
      const timeB = b.time || '00:00';
      return timeA.localeCompare(timeB);
    });
  };

  const toggleFilter = (type) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev);
      
      // If all two filters are currently active (initial state),
      // clicking one should show ONLY that one
      if (newFilters.size === 2) {
        return new Set([type]);
      }
      
      // Otherwise, toggle the clicked filter on/off (multi-select mode)
      if (newFilters.has(type)) {
        newFilters.delete(type);
      } else {
        newFilters.add(type);
      }
      
      return newFilters;
    });
  };

  // TWO COLORS: bright teal for academic, light blue for social
  const filterConfig = {
    academic: { 
      color: '#00F0FF',  // Bright cyan
      bgActive: 'bg-[#00F0FF]/20',
      borderActive: 'border-[#00F0FF]',
      textActive: 'text-[#00F0FF]',
      shadow: 'shadow-[0_0_20px_rgba(0,240,255,0.5)]',
      icon: 'M12 2L2 7V11C2 16.55 6.84 21.74 12 23C17.16 21.74 22 16.55 22 11V7L12 2Z' 
    },
    social: { 
      color: '#3B82F6',  // Bold blue
      bgActive: 'bg-[#3B82F6]/20',
      borderActive: 'border-[#3B82F6]',
      textActive: 'text-[#3B82F6]',
      shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
      icon: 'M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z' 
    },
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="reveal-on-scroll flex flex-wrap justify-center gap-4">
        {Object.entries(filterConfig).map(([type, config]) => (
          <button
            key={type}
            onClick={() => toggleFilter(type)}
            className={`
              px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider
              transition-all duration-300 ease-out
              ${activeFilters.has(type)
                ? `${config.bgActive} border-2 ${config.borderActive} ${config.textActive} ${config.shadow}`
                : 'bg-[#020617] border-2 border-[#94a3b8]/30 text-[#94a3b8] hover:border-[#94a3b8]/50'
              }
            `}
            style={{
              backdropFilter: 'blur(20px)'
            }}
          >
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" style={{ imageRendering: 'pixelated' }}>
                <path d={config.icon} />
              </svg>
              {type}
            </div>
          </button>
        ))}
      </div>

      {/* Year Selector - Current Year + Archive Dropdown */}
      <div className="reveal-on-scroll flex justify-center items-center gap-4">
        <button
          onClick={() => {
            setSelectedYear(currentYear);
            setSelectedMonth(new Date().getMonth());
          }}
          className={`
            px-6 py-2 rounded-lg font-bold text-sm
            transition-all duration-300 ease-out
            ${selectedYear === currentYear
              ? 'bg-[#00F0FF]/20 border-2 border-[#00F0FF] text-[#00F0FF]'
              : 'bg-[#020617] border-2 border-[#94a3b8]/30 text-[#94a3b8] hover:border-[#94a3b8]/50'
            }
          `}
          style={{
            backdropFilter: 'blur(20px)'
          }}
        >
          {currentYear}
        </button>

        <div className="relative">
          <select
            value={selectedYear === currentYear ? '' : selectedYear}
            onChange={(e) => {
              if (e.target.value) {
                setSelectedYear(parseInt(e.target.value));
                setSelectedMonth(0);
              }
            }}
            className={`
              px-6 py-2 rounded-lg font-bold text-sm cursor-pointer appearance-none pr-10
              transition-all duration-300 ease-out
              ${selectedYear !== currentYear
                ? 'bg-[#00F0FF]/20 border-2 border-[#00F0FF] text-[#00F0FF]'
                : 'bg-[#020617] border-2 border-[#94a3b8]/30 text-[#94a3b8] hover:border-[#94a3b8]/50'
              }
            `}
            style={{
              backdropFilter: 'blur(20px)'
            }}
          >
            <option value="">Multi-Year Archive</option>
            {availableYears.filter(y => y !== currentYear).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <svg 
            className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${selectedYear !== currentYear ? 'text-[#00F0FF]' : 'text-[#94a3b8]'}`}
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            style={{ imageRendering: 'pixelated' }}
          >
            <path d="M7 10L12 15L17 10H7Z" />
          </svg>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="reveal-on-scroll flex items-center justify-between max-w-2xl mx-auto">
        <button
          onClick={() => {
            if (selectedMonth === 0) {
              // Go to December of previous year
              const prevYear = selectedYear - 1;
              if (availableYears.includes(prevYear)) {
                setSelectedYear(prevYear);
                setSelectedMonth(11);
              }
            } else {
              setSelectedMonth(prev => prev - 1);
            }
          }}
          disabled={selectedMonth === 0 && !availableYears.includes(selectedYear - 1)}
          className="p-3 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] 
                     hover:bg-[#00F0FF]/20 hover:scale-110 transition-all duration-300
                     disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{ backdropFilter: 'blur(20px)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ imageRendering: 'pixelated' }}>
            <path d="M15 18L9 12L15 6V18Z" />
          </svg>
        </button>

        <h2 className="text-3xl font-bold text-[#00F0FF]" style={{ textShadow: '0 0 20px #00F0FF' }}>
          {months[selectedMonth]} {selectedYear}
        </h2>

        <button
          onClick={() => {
            if (selectedMonth === 11) {
              // Go to January of next year
              const nextYear = selectedYear + 1;
              if (availableYears.includes(nextYear)) {
                setSelectedYear(nextYear);
                setSelectedMonth(0);
              }
            } else {
              setSelectedMonth(prev => prev + 1);
            }
          }}
          disabled={selectedMonth === 11 && !availableYears.includes(selectedYear + 1)}
          className="p-3 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] 
                     hover:bg-[#00F0FF]/20 hover:scale-110 transition-all duration-300
                     disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
          style={{ backdropFilter: 'blur(20px)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" style={{ imageRendering: 'pixelated' }}>
            <path d="M9 18L15 12L9 6V18Z" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="reveal-on-scroll bg-[#020617] rounded-2xl border border-[#00F0FF]/20 p-6 backdrop-blur-2xl"
           style={{ boxShadow: '0 0 40px rgba(0,240,255,0.1)' }}>
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-[#00F0FF] font-bold text-sm py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="space-y-2">
          {calendar.map((week, weekIdx) => (
            <div key={weekIdx} className="grid grid-cols-7 gap-2">
              {week.map((day, dayIdx) => {
                const dayEvents = day ? getEventsForDay(day) : [];
                const semesterInfo = day ? getSemesterWeek(day) : null;
                const holidayName = day ? getPublicHoliday(day) : null;
                
                return (
                  <div
                    key={dayIdx}
                    className={`
                      aspect-square rounded-lg p-2 relative
                      ${day
                        ? 'bg-[#00F0FF]/5 border border-[#00F0FF]/20 hover:bg-[#00F0FF]/10 hover:border-[#00F0FF]/40 cursor-pointer transition-all duration-300'
                        : 'bg-transparent'
                      }
                      ${dayEvents.length > 0 ? 'ring-2 ring-[#00F0FF]/50' : ''}
                      ${holidayName ? 'bg-[#FF00FF]/10 border-[#FF00FF]/30' : ''}
                    `}
                    title={holidayName || ''}
                  >
                    {day && (
                      <>
                        <div className="flex items-start justify-between gap-1">
                          <div className={`font-bold text-sm ${holidayName ? 'text-[#FF00FF]' : 'text-[#94a3b8]'}`}>
                            {day}
                          </div>
                          {semesterInfo && (
                            <div className="text-[9px] text-[#00F0FF]/60 font-mono leading-tight">
                              {semesterInfo.week 
                                ? `S${semesterInfo.semester}W${semesterInfo.week}`
                                : semesterInfo.period
                              }
                            </div>
                          )}
                        </div>
                        
                        {/* Public Holiday Indicator */}
                        {holidayName && !dayEvents.length && (
                          <div className="absolute bottom-1 left-1 right-1">
                            <div className="text-[9px] text-[#FF00FF] font-bold truncate">
                              {holidayName}
                            </div>
                          </div>
                        )}
                        
                        {/* Events - positioned at top */}
                        {dayEvents.length > 0 && (
                          <div className="mt-1 space-y-1">
                            {dayEvents.map(event => {
                              const eventConfig = filterConfig[event.type];
                              return (
                                <button
                                  key={event.id}
                                  onClick={() => setSelectedEvent(event)}
                                  className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-bold truncate transition-colors`}
                                  style={{
                                    backgroundColor: eventConfig.color,
                                    color: '#020617'
                                  }}
                                  title={event.title}
                                >
                                  {event.title}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Events List for Mobile */}
      <div className="lg:hidden space-y-4">
        <h3 className="text-xl font-bold text-[#00F0FF] mb-4">
          Events This Month ({monthEvents.length})
        </h3>
        {monthEvents.length === 0 ? (
          <div className="text-center py-12 text-[#94a3b8]">
            <p>No events this month with selected filters.</p>
          </div>
        ) : (
          monthEvents.map(event => (
            <button
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className="w-full text-left p-4 rounded-lg bg-[#00F0FF]/10 border border-[#00F0FF]/30
                       hover:bg-[#00F0FF]/20 hover:scale-[1.02] transition-all duration-300"
              style={{ backdropFilter: 'blur(20px)' }}
            >
              <div className="font-bold text-[#00F0FF] mb-1">{event.title}</div>
              <div className="text-sm text-[#94a3b8]">
                {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} • {event.time} • {event.venue}
              </div>
            </button>
          ))
        )}
      </div>

      {/* Event Modal */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
};

export default EventCalendar;
