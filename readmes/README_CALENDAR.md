# 🗓️ SUDATA Events Calendar - Implementation Guide

A retro-styled, neon-themed events calendar for your data science society website, built with Astro and React.

### Repository structure fo Events calendar

```
src/
├── components/
│   ├── EventCalendar.jsx       # Main calendar with month navigation & filters
│   └── EventModal.jsx          # Event detail modal popup
├── data/
│   └── events.json             # All your event data (14 placeholder events)
├── pages/
    └── events.astro            # Events calendar page
|
├── convertExcelToJson.py       # `python3 scripts/convertExcelToJson.py src/data/events_template.xlsx src/data/events.json` (excel -> json)
├── createMultiYearTemplate.py  # `python3 createMultiYearTemplate.py events_copy.json events_template.xlsx` (json -> excel in python)
└── events_template.xlsx        # Excel template for SUDATA directors to fill in their event details of the year 
```

For Careers page, sponsorships opportunities: 
python3 scripts/convertOpportunitiesExcelToJson.py src/data/opportunities_template.xlsx src/data/opportunities.json

## 🎨 Design Features

Your events calendar maintains the SUDATA design system:

### Visual Style
- ✨ **Neon Blue Glow** (`#00F0FF`) - Primary interactive elements
- 🌌 **Deep Navy Background** (`#020617`) - Consistent with main site
- 🔲 **Pixelated Icons** - Retro 32-bit aesthetic
- 💎 **Glass Morphism** - Backdrop blur effects on cards
- ⚡ **Smooth Animations** - Hover effects and transitions

### Event Types & Colors
- 🎓 **Academic** (Neon Blue `#00F0FF`) - Workshops, hackathons, study groups
- 🎉 **Social** (Magenta `#FF00FF`) - Mixers, BBQs, game nights
- 💼 **Industry** (Gold `#FFD700`) - Career panels, networking, company visits

## 🚀 Quick Start

### 1. Fill in Your Event Data

Open `events_template.xlsx` and add SUDATA events.

### 2. Test It Out

```bash
npm run dev
```
Navigate to `http://localhost:4321/events` to see your calendar.

## 📝 Adding Your Events

### JSON Structure

Each event in `events.json` follows this format:

```json
{
  "id": "event_001",
  "title": "Python Workshop",
  "date": "2025-03-15",
  "time": "18:00",
  "venue": "Computer Lab 3B",
  "type": "academic",
  "description": "Learn Python basics and data manipulation",
  "collaborators": ["SUDATA", "CS Department"],
  "catering": "Pizza and drinks",
  "signupLink": "https://forms.google.com/...",
  "attendees": 45
}
```

### Quick Tips

1. **Date Format**: Always `YYYY-MM-DD` (e.g., `2025-03-15`)
2. **Time Format**: 24-hour format (e.g., `18:00` for 6 PM)
3. **Event Types**: Must be exactly `academic`, `social`, or `industry`
4. **Collaborators**: Array format `["Org1", "Org2"]`

## 🎯 Features

### Calendar View
- 📅 **Monthly Navigation** - Browse through all 12 months of 2025
- 🔍 **Event Filters** - Toggle Academic/Social/Industry categories
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎯 **Visual Indicators** - Events shown as colored dots on calendar dates

### Event Details
- 📋 **Full Information** - Title, date, time, venue, description
- 👥 **Collaborators** - See which organizations partnered
- 🍕 **Catering Info** - Know what food/drinks to expect
- 📝 **Sign-up Links** - Direct links to registration forms
- 📊 **Attendance** - See how many people attended

### Interactive Elements
- ✨ **Hover Effects** - Glass-slab style lifts and glows
- 🎨 **Modal Popups** - Clean, detailed event view
- ⌨️ **Keyboard Support** - Press ESC to close modals
- 🎭 **Smooth Transitions** - Polished animations throughout

## 🔧 Customization

### Change Event Type Colors

In `src/components/EventCalendar.jsx`:

```javascript
const filterConfig = {
  academic: { color: '#00F0FF', icon: '...' },
  social: { color: '#YOUR_COLOR', icon: '...' },
  industry: { color: '#YOUR_COLOR', icon: '...' }
};
```

Also update in `src/components/EventModal.jsx`:

```javascript
const typeColors = {
  academic: '#00F0FF',
  social: '#YOUR_COLOR',
  industry: '#YOUR_COLOR'
};
```

### Update to 2026 Calendar

When ready to show 2026 events:

1. In `src/components/EventCalendar.jsx`, line 45:
   ```javascript
   const firstDay = new Date(2026, selectedMonth, 1);
   ```

2. In `src/pages/events.astro`:
   ```astro
   <span class="text-[#00F0FF] font-bold text-lg">2026 Calendar</span>
   ```

3. Update your `events.json` with 2026 event dates

### Add New Event Types

1. Add to filter config in `EventCalendar.jsx`
2. Add colors and icons in `EventModal.jsx`
3. Use new type in your `events.json`

## 📱 Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Troubleshooting

### Events Not Showing
- Check date format is `YYYY-MM-DD`
- Verify event type is exactly `academic`, `social`, or `industry`
- Ensure JSON syntax is valid (no trailing commas)

### Styling Issues
- Clear browser cache
- Check that Tailwind classes are loading
- Verify all imports are correct

### Modal Not Opening
- Check React hydration with `client:load` directive
- Verify event has all required fields
- Check browser console for errors

## 🎓 Learning Resources

- [Astro Documentation](https://docs.astro.build)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)

## 📬 Support

If you run into issues:
1. Check the setup instructions carefully
2. Verify all files are in correct locations
3. Check browser console for error messages
4. Ensure all dependencies are installed (`npm install`)

## 🎉 Next Steps

After setting up the calendar:
1. ✅ Fill in your real 2025 events
2. ✅ Test all filters and month navigation
3. ✅ Verify sign-up links work
4. ✅ Share with your society members!

---

**Built with ❤️ for SUDATA**

Maintaining the retro-neon aesthetic while providing a professional, functional events platform.
