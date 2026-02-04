// semesterDates.js - University Semester Calendar Configuration
// Update this file once per year when new USyd calendar is released

export const SEMESTER_DATES = {
  2024: {
    semester1: {
      welcomeProgram: { start: '2024-02-05', end: '2024-02-16' },
      teaching: { start: '2024-02-19', end: '2024-05-24' },
      censusDate: '2024-04-02',
      midSemesterBreak: { start: '2024-04-01', end: '2024-04-05' },
      stuvac: { start: '2024-05-27', end: '2024-05-31' },
      exams: { start: '2024-06-03', end: '2024-06-15' }
    },
    semester2: {
      welcomeProgram: { start: '2024-07-22', end: '2024-08-02' },
      teaching: { start: '2024-07-29', end: '2024-11-01' },
      censusDate: '2024-09-02',
      midSemesterBreak: { start: '2024-09-30', end: '2024-10-04' },
      stuvac: { start: '2024-11-04', end: '2024-11-08' },
      exams: { start: '2024-11-11', end: '2024-11-23' }
    }
  },
  
  2025: {
    semester1: {
      welcomeProgram: { start: '2025-02-10', end: '2025-02-21' },
      teaching: { start: '2025-02-24', end: '2025-06-01' },
      censusDate: '2025-03-31',
      midSemesterBreak: { start: '2025-04-21', end: '2025-04-27' },
      stuvac: { start: '2025-06-02', end: '2025-06-08' },
      exams: { start: '2025-06-10', end: '2025-06-21' }
    },
    semester2: {
      welcomeProgram: { start: '2025-07-21', end: '2025-08-01' },
      teaching: { start: '2025-08-04', end: '2025-11-09' },
      censusDate: '2025-09-01',
      midSemesterBreak: { start: '2025-09-29', end: '2025-10-05' },
      stuvac: { start: '2025-11-10', end: '2025-11-16' },
      exams: { start: '2025-11-17', end: '2025-11-29' }
    }
  },
  
  2026: {
    semester1: {
      welcomeProgram: { start: '2026-02-09', end: '2026-02-20' },
      teaching: { start: '2026-02-23', end: '2026-05-31' },
      censusDate: '2026-03-31',
      midSemesterBreak: { start: '2026-04-06', end: '2026-04-12' },
      stuvac: { start: '2026-06-01', end: '2026-06-07' },
      exams: { start: '2026-06-09', end: '2026-06-20' }
    },
    semester2: {
      welcomeProgram: { start: '2026-07-20', end: '2026-07-31' },
      teaching: { start: '2026-08-03', end: '2026-11-08' },
      censusDate: '2026-08-31',
      midSemesterBreak: { start: '2026-09-28', end: '2026-10-05' },
      stuvac: { start: '2026-11-09', end: '2026-11-15' },
      exams: { start: '2026-11-16', end: '2026-11-28' }
    }
  }
};

// Helper function to get semester info for a specific date
export function getSemesterInfo(dateString, year) {
  const date = new Date(dateString);
  const yearData = SEMESTER_DATES[year];
  
  if (!yearData) return null;
  
  // Check Semester 1
  const sem1 = yearData.semester1;
  const sem1Start = new Date(sem1.teaching.start);
  const sem1End = new Date(sem1.exams.end);
  
  if (date >= sem1Start && date <= sem1End) {
    return getSemester1Period(date, sem1);
  }
  
  // Check Semester 2
  const sem2 = yearData.semester2;
  const sem2Start = new Date(sem2.teaching.start);
  const sem2End = new Date(sem2.exams.end);
  
  if (date >= sem2Start && date <= sem2End) {
    return getSemester2Period(date, sem2);
  }
  
  return null;
}

function getSemester1Period(date, sem1Data) {
  // Welcome Program
  if (isInPeriod(date, sem1Data.welcomeProgram)) {
    return { semester: 1, period: 'Welcome' };
  }
  
  // Teaching weeks
  if (isInPeriod(date, sem1Data.teaching)) {
    // Check if in mid-semester break
    if (isInPeriod(date, sem1Data.midSemesterBreak)) {
      return { semester: 1, period: 'Mid-Sem' };
    }
    
    // Calculate week number
    const weekNum = calculateWeekNumber(date, sem1Data.teaching.start, sem1Data.midSemesterBreak);
    return { semester: 1, week: weekNum };
  }
  
  // STUVAC
  if (isInPeriod(date, sem1Data.stuvac)) {
    return { semester: 1, period: 'STUVAC' };
  }
  
  // Exams
  if (isInPeriod(date, sem1Data.exams)) {
    return { semester: 1, period: 'Exams' };
  }
  
  return null;
}

function getSemester2Period(date, sem2Data) {
  // Welcome Program
  if (isInPeriod(date, sem2Data.welcomeProgram)) {
    return { semester: 2, period: 'Welcome' };
  }
  
  // Teaching weeks
  if (isInPeriod(date, sem2Data.teaching)) {
    // Check if in mid-semester break
    if (isInPeriod(date, sem2Data.midSemesterBreak)) {
      return { semester: 2, period: 'Mid-Sem' };
    }
    
    // Calculate week number
    const weekNum = calculateWeekNumber(date, sem2Data.teaching.start, sem2Data.midSemesterBreak);
    return { semester: 2, week: weekNum };
  }
  
  // STUVAC
  if (isInPeriod(date, sem2Data.stuvac)) {
    return { semester: 2, period: 'STUVAC' };
  }
  
  // Exams
  if (isInPeriod(date, sem2Data.exams)) {
    return { semester: 2, period: 'Exams' };
  }
  
  return null;
}

function isInPeriod(date, period) {
  const start = new Date(period.start);
  const end = new Date(period.end);
  return date >= start && date <= end;
}

function calculateWeekNumber(date, teachingStart, midSemBreak) {
  const startDate = new Date(teachingStart);
  const breakStart = new Date(midSemBreak.start);
  const breakEnd = new Date(midSemBreak.end);
  
  // Calculate days since semester start
  let daysSinceStart = Math.floor((date - startDate) / (24 * 60 * 60 * 1000));
  
  // If after mid-sem break, subtract break duration
  if (date > breakEnd) {
    const breakDuration = Math.floor((breakEnd - breakStart) / (24 * 60 * 60 * 1000)) + 1;
    daysSinceStart -= breakDuration;
  }
  
  // Calculate week (1-indexed)
  const weekNum = Math.floor(daysSinceStart / 7) + 1;
  
  // Cap at week 13
  return Math.min(weekNum, 13);
}

// Export for easy access
export default SEMESTER_DATES;
