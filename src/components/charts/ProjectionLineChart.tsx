import React, { useState } from 'react';
import { Table, TrendingUp } from 'lucide-react';

interface Props {
  currentAge: number;
  retirementAge: number;
  planningAge: number;
  lumpSumNeeded: number;
  projectedFund: number;
  fundedPercentage: number;
}

export const ProjectionLineChart: React.FC<Props> = ({
  currentAge,
  retirementAge,
  planningAge,
  lumpSumNeeded,
  projectedFund,
  fundedPercentage,
}) => {
  const [showTable, setShowTable] = useState(false);

  // Generate trajectory points from currentAge to planningAge
  const yearsToRetire = Math.max(1, retirementAge - currentAge);
  const yearsInRetire = Math.max(1, planningAge - retirementAge);
  const totalYears = yearsToRetire + yearsInRetire;

  const samplePoints: { age: number; projected: number; target: number }[] = [];
  const step = totalYears > 30 ? 5 : 2;

  for (let age = currentAge; age <= planningAge; age += step) {
    let projVal = 0;
    let targetVal = 0;

    if (age <= retirementAge) {
      // Accumulation phase
      const progressRatio = (age - currentAge) / yearsToRetire;
      // Exponential-like curve towards projectedFund
      projVal = projectedFund * Math.pow(progressRatio, 1.4);
      targetVal = lumpSumNeeded * Math.pow(progressRatio, 1.4);
    } else {
      // Decumulation phase
      const deProgress = (age - retirementAge) / yearsInRetire;
      targetVal = Math.max(0, lumpSumNeeded * (1 - deProgress));
      projVal = Math.max(0, projectedFund * (1 - deProgress * 1.1));
    }

    samplePoints.push({
      age,
      projected: Math.round(projVal),
      target: Math.round(targetVal),
    });
  }

  // Ensure retirement age point is explicitly included
  if (!samplePoints.some((p) => p.age === retirementAge)) {
    samplePoints.push({
      age: retirementAge,
      projected: projectedFund,
      target: lumpSumNeeded,
    });
    samplePoints.sort((a, b) => a.age - b.age);
  }

  const maxY = Math.max(lumpSumNeeded, projectedFund, 10000) * 1.15;
  const svgWidth = 500;
  const svgHeight = 200;
  const paddingX = 45;
  const paddingY = 25;

  const getX = (age: number) => {
    return paddingX + ((age - currentAge) / totalYears) * (svgWidth - 2 * paddingX);
  };

  const getY = (val: number) => {
    return svgHeight - paddingY - (val / maxY) * (svgHeight - 2 * paddingY);
  };

  // Build SVG path strings
  const projPath = samplePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.age).toFixed(1)} ${getY(p.projected).toFixed(1)}`)
    .join(' ');

  const targetPath = samplePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(p.age).toFixed(1)} ${getY(p.target).toFixed(1)}`)
    .join(' ');

  const retireX = getX(retirementAge);
  const isFunded = fundedPercentage >= 1.0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-semibold text-stone-900">Capital Trajectory to Retirement</h4>
          <p className="text-xs text-stone-500">Projected accumulation vs lump sum required over your lifespan</p>
        </div>
        <button
          type="button"
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/70 rounded-lg transition-colors"
        >
          {showTable ? <TrendingUp className="w-3.5 h-3.5" /> : <Table className="w-3.5 h-3.5" />}
          <span>{showTable ? 'View Chart' : 'Data Table'}</span>
        </button>
      </div>

      {!showTable ? (
        <div>
          <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-48 select-none">
              {/* Grid lines */}
              <line
                x1={paddingX}
                y1={getY(0)}
                x2={svgWidth - paddingX}
                y2={getY(0)}
                stroke="#e7e5e4"
                strokeWidth="1"
              />
              <line
                x1={paddingX}
                y1={getY(maxY / 2)}
                x2={svgWidth - paddingX}
                y2={getY(maxY / 2)}
                stroke="#f5f5f4"
                strokeWidth="1"
                strokeDasharray="4 4"
              />

              {/* Retirement age vertical marker */}
              <line
                x1={retireX}
                y1={paddingY}
                x2={retireX}
                y2={svgHeight - paddingY}
                stroke="#d97706"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <text
                x={retireX}
                y={paddingY - 5}
                textAnchor="middle"
                className="text-[10px] font-sans fill-amber-700 font-semibold"
              >
                Retire (Age {retirementAge})
              </text>

              {/* Target Line (Dashed) */}
              <path
                d={targetPath}
                fill="none"
                stroke="#78716c"
                strokeWidth="2"
                strokeDasharray="4 4"
              />

              {/* Projected Line (Solid) */}
              <path
                d={projPath}
                fill="none"
                stroke={isFunded ? '#059669' : '#d97706'}
                strokeWidth="3"
              />

              {/* Target Marker at Retirement */}
              <circle
                cx={retireX}
                cy={getY(lumpSumNeeded)}
                r="4"
                fill="#78716c"
              />

              {/* Projected Marker at Retirement */}
              <circle
                cx={retireX}
                cy={getY(projectedFund)}
                r="5"
                fill={isFunded ? '#059669' : '#d97706'}
                stroke="#fff"
                strokeWidth="2"
              />

              {/* Axis labels */}
              <text
                x={paddingX}
                y={svgHeight - 8}
                className="text-[10px] font-sans fill-stone-400"
              >
                Age {currentAge} (Today)
              </text>
              <text
                x={svgWidth - paddingX}
                y={svgHeight - 8}
                textAnchor="end"
                className="text-[10px] font-sans fill-stone-400"
              >
                Age {planningAge} (Horizon)
              </text>
            </svg>
          </div>

          <div className="flex items-center justify-center gap-6 mt-1 text-xs">
            <span className="flex items-center gap-1.5 text-stone-700">
              <span className={`w-3 h-0.5 inline-block ${isFunded ? 'bg-emerald-600' : 'bg-amber-600'}`} />
              <span className="font-medium">Projected Fund</span>
              <span className="font-mono-num font-semibold text-stone-900">
                ${Math.round(projectedFund).toLocaleString()}
              </span>
            </span>
            <span className="flex items-center gap-1.5 text-stone-700">
              <span className="w-3 h-0.5 inline-block border-b-2 border-dashed border-stone-500" />
              <span className="font-medium">Lump Sum Target</span>
              <span className="font-mono-num font-semibold text-stone-900">
                ${Math.round(lumpSumNeeded).toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-stone-200 text-stone-500 font-medium">
                <th className="py-2">Milestone Age</th>
                <th className="py-2 text-right">Projected Fund</th>
                <th className="py-2 text-right">Required Target</th>
                <th className="py-2 text-right">Phase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono-num">
              {samplePoints.map((p) => (
                <tr key={p.age} className={p.age === retirementAge ? 'bg-amber-50/70 font-semibold' : ''}>
                  <td className="py-2 text-stone-800 font-sans">
                    Age {p.age} {p.age === retirementAge ? '(Retirement Year)' : ''}
                  </td>
                  <td className="py-2 text-right text-stone-900">${p.projected.toLocaleString()}</td>
                  <td className="py-2 text-right text-stone-600">${p.target.toLocaleString()}</td>
                  <td className="py-2 text-right font-sans text-stone-500">
                    {p.age < retirementAge ? 'Accumulation' : p.age === retirementAge ? 'Retirement' : 'Drawdown'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
