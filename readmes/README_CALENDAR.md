# Events Calendar

## Scripts

**Events page** — fill in `src/data/events_template.xlsx`, then convert:
```bash
python3 scripts/convertExcelToJson.py src/data/events_template.xlsx src/data/events.json
```

**Careers/Sponsorships page** — fill in `src/data/opportunities_template.xlsx`, then convert:
```bash
python3 scripts/convertOpportunitiesExcelToJson.py src/data/opportunities_template.xlsx src/data/opportunities.json
```

## events.json field reference

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

- `date`: `YYYY-MM-DD`
- `time`: 24-hour format (e.g. `18:00`)
- `type`: must be exactly `academic`, `social`, or `industry`
- `collaborators`: array (e.g. `["Org1", "Org2"]`)
