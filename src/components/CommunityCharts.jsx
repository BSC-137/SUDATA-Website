import { useState } from 'react';
import InteractivePieChart from './InteractivePieChart';

const TABS = [
  { key: 'major',     label: 'Major' },
  { key: 'degree',    label: 'Degree' },
  { key: 'gender',    label: 'Gender' },
  { key: 'ethnicity', label: 'Ethnicity' },
];

export default function CommunityCharts({ majorData, degreeData, genderData, ethnicityData }) {
  const [activeTab, setActiveTab] = useState('major');

  const dataMap = {
    major:     { data: majorData,     title: 'FIELD_DISTRIBUTION' },
    degree:    { data: degreeData,    title: 'DEGREE_DISTRIBUTION' },
    gender:    { data: genderData,    title: 'GENDER_BALANCE' },
    ethnicity: { data: ethnicityData, title: 'ETHNICITY_DIVERSITY' },
  };

  return (
    <>
      {/* Mobile: tabbed single chart */}
      <div className="md:hidden">
        <div className="flex gap-2 flex-wrap mb-4">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1 rounded-full font-mono-tech text-xs tracking-wider border transition-all duration-200 ${
                activeTab === tab.key
                  ? 'bg-sudata-neon/20 border-sudata-neon text-sudata-neon'
                  : 'bg-transparent border-sudata-neon/30 text-sudata-grey hover:border-sudata-neon/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="w-full">
          <InteractivePieChart
            data={dataMap[activeTab].data}
            title={dataMap[activeTab].title}
          />
        </div>
      </div>

      {/* Desktop: 2-column grid (unchanged layout) */}
      <div className="hidden md:grid md:grid-cols-2 gap-6 sm:gap-8">
        <div className="w-full">
          <InteractivePieChart data={majorData} title="FIELD_DISTRIBUTION" />
        </div>
        <div className="w-full">
          <InteractivePieChart data={degreeData} title="DEGREE_DISTRIBUTION" />
        </div>
        <div className="w-full">
          <InteractivePieChart data={genderData} title="GENDER_BALANCE" />
        </div>
        <div className="w-full">
          <InteractivePieChart data={ethnicityData} title="ETHNICITY_DIVERSITY" />
        </div>
      </div>
    </>
  );
}
