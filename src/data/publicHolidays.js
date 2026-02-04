// publicHolidays.js - Australian Public Holidays Configuration

/**
 * PUBLIC HOLIDAYS - Two Options:
 * 
 * OPTION 1: Use Australian Government API (Recommended)
 * - Automatically fetches NSW public holidays
 * - Always up-to-date
 * - Free API: https://data.gov.au/data/dataset/australian-holidays-machine-readable-dataset
 * 
 * OPTION 2: Manual config (Fallback)
 * - Update manually each year
 * - Reliable if API fails
 */

// OPTION 1: Fetch from Australian Government API
export async function fetchPublicHolidays(year, state = 'nsw') {
  try {
    const response = await fetch(
      `https://data.gov.au/data/api/3/action/datastore_search?resource_id=253d63c0-af1f-4f4c-b8d5-eb9d9b1d46ab&filters={"jurisdiction":"${state}","date":"${year}"}`
    );
    
    if (!response.ok) {
      console.warn('Public holidays API failed, using fallback data');
      return getFallbackHolidays(year);
    }
    
    const data = await response.json();
    return parseApiHolidays(data.result.records);
  } catch (error) {
    console.error('Error fetching public holidays:', error);
    return getFallbackHolidays(year);
  }
}

function parseApiHolidays(records) {
  return records.map(record => ({
    date: record.date,
    name: record.holiday_name,
    type: 'public_holiday'
  }));
}

// OPTION 2: Manual Fallback Data
// Update this if the API is unavailable or you prefer manual control
export const PUBLIC_HOLIDAYS = {
  2024: [
    { date: '2024-01-01', name: "New Year's Day" },
    { date: '2024-01-26', name: 'Australia Day' },
    { date: '2024-03-29', name: 'Good Friday' },
    { date: '2024-03-30', name: 'Easter Saturday' },
    { date: '2024-03-31', name: 'Easter Sunday' },
    { date: '2024-04-01', name: 'Easter Monday' },
    { date: '2024-04-25', name: 'ANZAC Day' },
    { date: '2024-06-10', name: "King's Birthday" },
    { date: '2024-10-07', name: 'Labour Day' },
    { date: '2024-12-25', name: 'Christmas Day' },
    { date: '2024-12-26', name: 'Boxing Day' }
  ],
  
  2025: [
    { date: '2025-01-01', name: "New Year's Day" },
    { date: '2025-01-27', name: 'Australia Day' }, // Observed on Monday
    { date: '2025-04-18', name: 'Good Friday' },
    { date: '2025-04-19', name: 'Easter Saturday' },
    { date: '2025-04-20', name: 'Easter Sunday' },
    { date: '2025-04-21', name: 'Easter Monday' },
    { date: '2025-04-25', name: 'ANZAC Day' },
    { date: '2025-06-09', name: "King's Birthday" },
    { date: '2025-10-06', name: 'Labour Day' },
    { date: '2025-12-25', name: 'Christmas Day' },
    { date: '2025-12-26', name: 'Boxing Day' }
  ],
  
  2026: [
    { date: '2026-01-01', name: "New Year's Day" },
    { date: '2026-01-26', name: 'Australia Day' },
    { date: '2026-04-03', name: 'Good Friday' },
    { date: '2026-04-04', name: 'Easter Saturday' },
    { date: '2026-04-05', name: 'Easter Sunday' },
    { date: '2026-04-06', name: 'Easter Monday' },
    { date: '2026-04-25', name: 'ANZAC Day' }, // Falls on Saturday
    { date: '2026-04-27', name: 'ANZAC Day (observed)' }, // Observed on Monday
    { date: '2026-06-08', name: "King's Birthday" },
    { date: '2026-10-05', name: 'Labour Day' },
    { date: '2026-12-25', name: 'Christmas Day' },
    { date: '2026-12-26', name: 'Boxing Day' },
    { date: '2026-12-28', name: 'Boxing Day (observed)' } // Observed on Monday
  ]
};

function getFallbackHolidays(year) {
  return PUBLIC_HOLIDAYS[year] || [];
}

// Helper function to check if a date is a public holiday
export function isPublicHoliday(dateString, year) {
  const holidays = PUBLIC_HOLIDAYS[year] || [];
  return holidays.some(holiday => holiday.date === dateString);
}

// Helper function to get holiday name for a date
export function getHolidayName(dateString, year) {
  const holidays = PUBLIC_HOLIDAYS[year] || [];
  const holiday = holidays.find(h => h.date === dateString);
  return holiday ? holiday.name : null;
}

// Usage example in your calendar:
// const holidays = await fetchPublicHolidays(2026, 'nsw');
// Or use fallback: const holidays = PUBLIC_HOLIDAYS[2026];

export default PUBLIC_HOLIDAYS;
