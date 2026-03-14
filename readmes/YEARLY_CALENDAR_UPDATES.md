# Yearly Calendar Updates

Run once per year when USyd releases the new academic calendar (usually November).

Download the PDF from https://www.sydney.edu.au/students/key-dates.html

---

## 1. Update `src/data/semesterDates.js`

Add a new year block using dates from the PDF:

```javascript
export const SEMESTER_DATES = {
  // ... existing years ...

  2027: {
    semester1: {
      welcomeProgram: { start: '2027-02-XX', end: '2027-02-XX' },
      teaching: { start: '2027-02-XX', end: '2027-05-XX' },
      censusDate: '2027-03-XX',
      midSemesterBreak: { start: '2027-04-XX', end: '2027-04-XX' },
      stuvac: { start: '2027-06-XX', end: '2027-06-XX' },
      exams: { start: '2027-06-XX', end: '2027-06-XX' }
    },
    semester2: {
      welcomeProgram: { start: '2027-07-XX', end: '2027-08-XX' },
      teaching: { start: '2027-08-XX', end: '2027-11-XX' },
      censusDate: '2027-08-XX',
      midSemesterBreak: { start: '2027-09-XX', end: '2027-10-XX' },
      stuvac: { start: '2027-11-XX', end: '2027-11-XX' },
      exams: { start: '2027-11-XX', end: '2027-11-XX' }
    }
  }
};
```

### PDF to config mapping

| PDF says | Config field |
|----------|--------------|
| "Welcome Program: Feb 10-21" | `welcomeProgram: { start: '2025-02-10', end: '2025-02-21' }` |
| "Teaching weeks: Feb 24 - Jun 1" | `teaching: { start: '2025-02-24', end: '2025-06-01' }` |
| "Census date: 31 March" | `censusDate: '2025-03-31'` |
| "Mid-semester break: 21-27 April" | `midSemesterBreak: { start: '2025-04-21', end: '2025-04-27' }` |
| "Study vacation (STUVAC): 2-8 June" | `stuvac: { start: '2025-06-02', end: '2025-06-08' }` |
| "Examinations: 10-21 June" | `exams: { start: '2025-06-10', end: '2025-06-21' }` |

All dates use `YYYY-MM-DD` format.

---

## 2. Add year to `src/components/EventCalendar.jsx`

```javascript
const availableYears = [2024, 2025, 2026, 2027]; // add new year here
```

---

## 3. Update `src/data/publicHolidays.js` (only if API fetch fails)

NSW public holidays: https://www.industrialrelations.nsw.gov.au/public-holidays/

```javascript
export const PUBLIC_HOLIDAYS = {
  // ... existing years ...

  2027: [
    { date: '2027-01-01', name: "New Year's Day" },
    { date: '2027-01-26', name: 'Australia Day' },
    // ... remaining holidays
  ]
};
```
