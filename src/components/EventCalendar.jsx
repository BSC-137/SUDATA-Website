import { useState, useMemo } from 'react';
import EventModal from './EventModal';

const EventCalendar = ({ events }) => {
  const [selectedMonth, setSelectedMonth] = useState(0); // 0 = January
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [activeFilters, setActiveFilters] = useState(new Set(['academic', 'social', 'industry']));

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get semester week info for a given date
  const getSemesterWeek = (date) => {
    const dateObj = new Date(2025, selectedMonth, date);
    
    // Semester 1: Week 1 starts Feb 24, 2025
    const sem1Start = new Date(2025, 1, 24); // Feb 24
    const sem1End = new Date(2025, 5, 1);    // Jun 1
    
    // Semester 2: Week 1 starts Aug 4, 2025
    const sem2Start = new Date(2025, 7, 4);  // Aug 4
    const sem2End = new Date(2025, 10, 9);   // Nov 9
    
    if (dateObj >= sem1Start && dateObj <= sem1End) {
      const weekNum = Math.floor((dateObj - sem1Start) / (7 * 24 * 60 * 60 * 1000)) + 1;
      if (weekNum <= 13) return { semester: 1, week: weekNum };
      // STUVAC/Exams
      if (dateObj >= new Date(2025, 5, 2) && dateObj <= new Date(2025, 5, 8)) {
        return { semester: 1, week: 'STUVAC' };
      }
      if (dateObj >= new Date(2025, 5, 10)) {
        return { semester: 1, week: 'Exams' };
      }
    }
    
    if (dateObj >= sem2Start && dateObj <= sem2End) {
      const weekNum = Math.floor((dateObj - sem2Start) / (7 * 24 * 60 * 60 * 1000)) + 1;
      if (weekNum <= 13) return { semester: 2, week: weekNum };
      // STUVAC/Exams
      if (dateObj >= new Date(2025, 10, 10) && dateObj <= new Date(2025, 10, 16)) {
        return { semester: 2, week: 'STUVAC' };
      }
      if (dateObj >= new Date(2025, 10, 17)) {
        return { semester: 2, week: 'Exams' };
      }
    }
    
    return null;
  };

  // Filter events by active tags
  const filteredEvents = useMemo(() => {
    return events.filter(event => activeFilters.has(event.type));
  }, [events, activeFilters]);

  // Get events for selected month
  const monthEvents = useMemo(() => {
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === selectedMonth;
    });
  }, [filteredEvents, selectedMonth]);

  // Generate calendar grid for selected month
  const generateCalendar = () => {
    const firstDay = new Date(2025, selectedMonth, 1);
    const lastDay = new Date(2025, selectedMonth + 1, 0);
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
    const dateStr = `2025-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return monthEvents.filter(event => event.date === dateStr);
  };

  const toggleFilter = (type) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(type)) {
        newFilters.delete(type);
      } else {
        newFilters.add(type);
      }
      return newFilters;
    });
  };

  const filterConfig = {
    academic: { color: '#00F0FF', icon: 'M12 2L2 7V11C2 16.55 6.84 21.74 12 23C17.16 21.74 22 16.55 22 11V7L12 2Z' },
    social: { color: '#FF00FF', icon: 'M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z' },
    industry: { color: '#FFD700', icon: 'M12 2L1 7V11C1 16 5 21 12 23C19 21 23 16 23 11V7L12 2Z' }
  };

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-wrap justify-center gap-4">
        {Object.entries(filterConfig).map(([type, config]) => (
          <button
            key={type}
            onClick={() => toggleFilter(type)}
            className={`
              px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wider
              transition-all duration-300 ease-out
              ${activeFilters.has(type)
                ? 'bg-[#00F0FF]/20 border-2 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.5)]'
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

      {/* Month Navigation */}
      <div className="flex items-center justify-between max-w-2xl mx-auto">
        <button
          onClick={() => setSelectedMonth(prev => Math.max(0, prev - 1))}
          disabled={selectedMonth === 0}
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
          {months[selectedMonth]} 2025
        </h2>

        <button
          onClick={() => setSelectedMonth(prev => Math.min(11, prev + 1))}
          disabled={selectedMonth === 11}
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
      <div className="bg-[#020617] rounded-2xl border border-[#00F0FF]/20 p-6 backdrop-blur-2xl"
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
                    `}
                  >
                    {day && (
                      <>
                        <div className="flex items-start justify-between gap-1">
                          <div className="text-[#94a3b8] font-bold text-sm">{day}</div>
                          {semesterInfo && (
                            <div className="text-[10px] text-[#00F0FF]/60 font-mono leading-tight">
                              S{semesterInfo.semester}W{semesterInfo.week}
                            </div>
                          )}
                        </div>
                        {dayEvents.length > 0 && (
                          <div className="absolute bottom-1 left-1 right-1 space-y-1">
                            {dayEvents.map(event => (
                              <button
                                key={event.id}
                                onClick={() => setSelectedEvent(event)}
                                className="w-full text-left px-1.5 py-0.5 rounded text-[10px] font-bold truncate
                                         bg-[#00F0FF]/90 text-[#020617] hover:bg-[#00F0FF] transition-colors"
                                title={event.title}
                              >
                                {event.title}
                              </button>
                            ))}
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
