# Pie Chart Data

The About page displays four membership demographic charts (Field, Degree, Gender, Ethnicity) populated from a CSV file. Place an updated `sudata_members_cleaned.csv` in `src/data/` with the exact column names below and the charts will reflect the new data on the next build.

`src/utils/processChartData.js` expects these EXACT column names:

- `major_std` (for Field Distribution chart)
- `degree_std` (for Degree Distribution chart)
- `gender` (for Gender Balance chart)
- `ethnicity_std` (for Ethnicity Diversity chart)
