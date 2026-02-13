import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

/**
 * Processes the SUDATA members CSV and returns chart data
 * Expects CSV with columns: major_std, degree_std, gender, ethnicity_std
 */
export function processChartData(csvPath) {
  // Decode URL-encoded path if necessary
  const decodedPath = decodeURIComponent(csvPath);
  const csvContent = readFileSync(decodedPath, 'utf-8');
  const lines = csvContent.trim().split('\n');
  
  // Parse CSV header
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
  
  // Find column indices
  const majorIdx = headers.indexOf('major_std');
  const degreeIdx = headers.indexOf('degree_std');
  const genderIdx = headers.indexOf('gender');
  const ethnicityIdx = headers.indexOf('ethnicity_std');
  
  // Initialize counters
  const majorCounts = {};
  const degreeCounts = {};
  const genderCounts = {};
  const ethnicityCounts = {};
  
  // Process each row
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Simple CSV parsing (handles quoted fields)
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    // Count values
    const major = values[majorIdx]?.replace(/"/g, '');
    const degree = values[degreeIdx]?.replace(/"/g, '');
    const gender = values[genderIdx]?.replace(/"/g, '');
    const ethnicity = values[ethnicityIdx]?.replace(/"/g, '');
    
    if (major) majorCounts[major] = (majorCounts[major] || 0) + 1;
    if (degree) degreeCounts[degree] = (degreeCounts[degree] || 0) + 1;
    if (gender) genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    if (ethnicity) ethnicityCounts[ethnicity] = (ethnicityCounts[ethnicity] || 0) + 1;
  }
  
  // Convert to chart data format
  const toChartData = (counts) => 
    Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  
  return {
    majorData: toChartData(majorCounts),
    degreeData: toChartData(degreeCounts),
    genderData: toChartData(genderCounts),
    ethnicityData: toChartData(ethnicityCounts)
  };
}
