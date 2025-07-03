import React from 'react';

export default function DistributionSelector({ distributions, selected, onSelect }) {
  // Group distributions by category if available
  const groupedDistributions = distributions.reduce((groups, dist) => {
    const category = dist.category || 'Other';
    if (!groups[category]) groups[category] = [];
    groups[category].push(dist);
    return groups;
  }, {});

  const selectedDist = distributions.find(d => d.name === selected);

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="distribution-select" className="block text-sm font-medium text-gray-700 mb-4">
          Distribution
        </label>
        <select
          id="distribution-select"
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          {Object.entries(groupedDistributions).map(([category, dists]) => (
            <optgroup key={category} label={category}>
              {dists.map((dist) => (
                <option key={dist.name} value={dist.name}>
                  {dist.displayName || dist.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
      
      {selectedDist && (
        <div className="mt-6 p-6 bg-white rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-900 mb-3">
            {selectedDist.displayName}
          </p>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">
            {selectedDist.description}
          </p>
          {selectedDist.commonUse && (
            <div className="flex items-start">
              <span className="text-gray-400 mr-2 text-xs">•</span>
              <p className="text-xs text-gray-500">
                <strong className="text-gray-700">Common uses:</strong> {selectedDist.commonUse}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}