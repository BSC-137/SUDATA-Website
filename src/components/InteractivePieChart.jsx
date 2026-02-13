import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const InteractivePieChart = ({ data, title, colorScheme = 'viridis' }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const tooltipRef = useRef(null);
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Viridis color scales based on your images
  const colorPalettes = {
    viridis: [
      '#440154', '#472D7B', '#3B528B', '#2C728E', '#21908C',
      '#27AD81', '#5DC863', '#AADC32', '#FDE724'
    ]
  };

  useEffect(() => {
    if (!data || data.length === 0 || !svgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Animate every time it comes into view
            animateChart();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [data]);

  const animateChart = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 10;

    const g = svg
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    // Use viridis colors
    const colors = colorPalettes[colorScheme];
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.name))
      .range(colors);

    const pie = d3.pie()
      .value(d => d.value)
      .sort(null);

    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(radius);

    const arcHover = d3.arc()
      .innerRadius(0)
      .outerRadius(radius + 15);

    const arcs = g.selectAll('.arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    // Calculate total for percentages
    const total = data.reduce((sum, d) => sum + d.value, 0);

    // Add paths with animation
    arcs.append('path')
      .attr('fill', d => color(d.data.name))
      .attr('stroke', '#1a1a1a')
      .attr('stroke-width', 2)
      .style('opacity', 0.9)
      .style('cursor', 'pointer')
      .transition()
      .duration(1000)
      .attrTween('d', function(d) {
        const interpolate = d3.interpolate({ startAngle: 0, endAngle: 0 }, d);
        return function(t) {
          return arc(interpolate(t));
        };
      });

    // Add hover effects
    arcs.selectAll('path')
      .on('mouseenter', function(event, d) {
        const percentage = ((d.data.value / total) * 100).toFixed(1);
        setHoveredSegment({ ...d.data, percentage });
        
        // Update tooltip position
        const containerRect = containerRef.current.getBoundingClientRect();
        setTooltipPos({
          x: event.clientX - containerRect.left,
          y: event.clientY - containerRect.top
        });
        
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arcHover)
          .style('opacity', 1);
      })
      .on('mousemove', function(event) {
        const containerRect = containerRef.current.getBoundingClientRect();
        setTooltipPos({
          x: event.clientX - containerRect.left,
          y: event.clientY - containerRect.top
        });
      })
      .on('mouseleave', function() {
        setHoveredSegment(null);
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc)
          .style('opacity', 0.9);
      });

    // Add spinning animation on scroll - happens every time
    g.transition()
      .duration(1500)
      .attrTween('transform', function() {
        return d3.interpolateString(
          `translate(${width / 2},${height / 2}) rotate(0)`,
          `translate(${width / 2},${height / 2}) rotate(360)`
        );
      });
  };

  const handleLegendHover = (itemName) => {
    const svg = d3.select(svgRef.current);
    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(Math.min(300, 300) / 2 - 10);
    
    const arcHover = d3.arc()
      .innerRadius(0)
      .outerRadius(Math.min(300, 300) / 2 - 10 + 15);

    svg.selectAll('path')
      .transition()
      .duration(200)
      .attr('d', function(d) {
        return d.data.name === itemName ? arcHover(d) : arc(d);
      })
      .style('opacity', function(d) {
        return d.data.name === itemName ? 1 : 0.9;
      });
  };

  const handleLegendLeave = () => {
    const svg = d3.select(svgRef.current);
    const arc = d3.arc()
      .innerRadius(0)
      .outerRadius(Math.min(300, 300) / 2 - 10);

    svg.selectAll('path')
      .transition()
      .duration(200)
      .attr('d', arc)
      .style('opacity', 0.9);
  };

  return (
    <div ref={containerRef} className="space-y-3 relative h-full flex flex-col">
      <div className="font-mono-tech text-sudata-neon/90 text-xs tracking-[0.2em]">
        {title}
      </div>
      <div className="relative w-full h-full rounded-lg border border-sudata-neon/20 hover:border-sudata-neon/50 transition-all duration-300 bg-black/40 p-4 flex flex-col">
        <div className="flex flex-col items-center flex-1">
          {/* SVG Chart */}
          <div className="relative flex-shrink-0">
            <svg ref={svgRef} className="max-w-full h-auto" />
            
            {/* Hover Tooltip */}
            {hoveredSegment && (
              <div
                ref={tooltipRef}
                className="absolute pointer-events-none bg-black/90 border border-sudata-neon/50 rounded px-3 py-2 font-mono-tech text-xs text-white z-50"
                style={{
                  left: `${tooltipPos.x + 10}px`,
                  top: `${tooltipPos.y - 40}px`,
                  transform: 'translate(0, 0)'
                }}
              >
                <div className="whitespace-nowrap">
                  <span className="text-sudata-neon">{hoveredSegment.name}</span>
                  <br />
                  <span className="text-sudata-grey">
                    {hoveredSegment.percentage}%
                  </span>
                </div>
              </div>
            )}
          </div>
          
          {/* Compact Legend */}
          <div className="mt-4 w-full flex flex-wrap gap-2 justify-center text-xs">
            {data.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-2 py-1 rounded font-mono-tech transition-all duration-200 cursor-pointer hover:bg-sudata-neon/10"
                onMouseEnter={() => handleLegendHover(item.name)}
                onMouseLeave={handleLegendLeave}
              >
                <div
                  className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{
                    backgroundColor: colorPalettes[colorScheme][idx % colorPalettes[colorScheme].length]
                  }}
                />
                <span className="text-[10px] text-sudata-grey whitespace-nowrap">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractivePieChart;
