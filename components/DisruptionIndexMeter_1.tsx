import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
// Styles loaded via index.html
// import 'react-circular-progressbar/dist/styles.css';

interface DisruptionIndexMeterProps {
  indexValue: number; // Numerical value of the disruption index (0-100)
  maxValue?: number; // Maximum value for the index (defaults to 100)
  meterLabel?: string; // Optional label for the meter, e.g., "Disruption Index"
}

const DisruptionIndexMeter: React.FC<DisruptionIndexMeterProps> = ({
  indexValue,
  maxValue = 100,
  meterLabel = 'Disruption Index',
}) => {
  // Ensure indexValue is within the valid range (0-maxValue)
  const normalizedIndex = Math.min(maxValue, Math.max(0, indexValue));
  const percentage = (normalizedIndex / maxValue) * 100;

  // Define color stops for the meter's color gradient
  const colorStops = [
    { stop: 0, color: '#E53935' },   // Red (Low disruption)
    { stop: 50, color: '#FB8C00' },  // Orange (Medium disruption)
    { stop: 100, color: '#43A047' }, // Green (High disruption)
  ];

  // Function to interpolate color based on percentage
  const getMeterColor = (percent: number): string => {
    for (let i = 0; i < colorStops.length - 1; i++) {
      const currentStop = colorStops[i];
      const nextStop = colorStops[i + 1];

      if (percent <= nextStop.stop) {
        const progress = (percent - currentStop.stop) / (nextStop.stop - currentStop.stop);

        const r1 = parseInt(currentStop.color.substring(1, 3), 16);
        const g1 = parseInt(currentStop.color.substring(3, 5), 16);
        const b1 = parseInt(currentStop.color.substring(5, 7), 16);

        const r2 = parseInt(nextStop.color.substring(1, 3), 16);
        const g2 = parseInt(nextStop.color.substring(3, 5), 16);
        const b2 = parseInt(nextStop.color.substring(5, 7), 16);

        const r = Math.round(r1 + (r2 - r1) * progress);
        const g = Math.round(g1 + (g2 - g1) * progress);
        const b = Math.round(b1 + (b2 - b1) * progress);

        return `rgb(${r}, ${g}, ${b})`;
      }
    }
    return colorStops[colorStops.length - 1].color;
  };

  const currentColor = getMeterColor(percentage);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: 150, height: 150 }}>
        <CircularProgressbar
          value={percentage}
          text={`${normalizedIndex}`}
          styles={buildStyles({
            // Rotation of path and trail, in number of turns (0-1)
            rotation: 0.25,

            // Whether to use rounded or flat corners on the ends - can use 'butt' or 'round'
            strokeLinecap: 'round',

            // Text size
            textSize: '24px',

            // How long animation takes to go from one percentage to another, in seconds
            pathTransitionDuration: 0.5,

            // Can specify path transition in more detail, or remove it entirely
            // pathTransition: 'none',

            // Colors
            pathColor: currentColor,
            textColor: '#fff',
            trailColor: '#d6d6d6',
            backgroundColor: '#3e98c7',
          })}
        />
      </div>
      {meterLabel && (
        <div style={{ marginTop: '10px', fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>
          {meterLabel}
        </div>
      )}
    </div>
  );
};

export default DisruptionIndexMeter;