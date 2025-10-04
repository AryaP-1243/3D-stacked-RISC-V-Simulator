import React from 'react';

const tableData = [
  {
    metric: 'Latency',
    '2d': 'High (nanoseconds)',
    tsv: 'Ultra-Low (picoseconds)',
    impact: 'Orders of magnitude faster communication between CPU and cache.',
  },
  {
    metric: 'Bandwidth',
    '2d': 'Limited',
    tsv: 'Extremely High',
    impact: 'Thousands of parallel connections possible, breaking the data bottleneck.',
  },
  {
    metric: 'Power/Bit',
    '2d': 'High (picojoules)',
    tsv: 'Ultra-Low (femtojoules)',
    impact: 'Drastically lower energy consumption, leading to longer battery life.',
  },
  {
    metric: 'Density',
    '2d': 'Low',
    tsv: 'Very High',
    impact: 'More connections in a smaller area, enabling more complex designs.',
  },
];

const ComparisonTable: React.FC = () => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg">
        <thead className="bg-slate-100 dark:bg-slate-800">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Metric</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Traditional 2D Wire</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">Through-Silicon Via (TSV)</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">The Impact (Your Narrative)</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-slate-800/50 divide-y divide-slate-200 dark:divide-slate-700">
          {tableData.map((row) => (
            <tr key={row.metric}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{row.metric}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400">{row['2d']}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400">{row.tsv}</td>
              <td className="px-6 py-4 whitespace-normal text-sm text-slate-600 dark:text-slate-300 max-w-xs">{row.impact}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ComparisonTable;