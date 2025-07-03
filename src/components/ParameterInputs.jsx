import React, { useEffect } from 'react';
import { DistributionCatalog } from '../lib/distributionCatalog.js';
import ParameterControl from './ui/ParameterControl.jsx';

const catalog = new DistributionCatalog();

export default function ParameterInputs({ distribution, values, onChange }) {
  const handleParameterChange = (paramName, value) => {
    onChange({
      ...values,
      [paramName]: value
    });
  };

  const parameters = catalog.getParameterInfo(distribution);
  
  // Initialize parameters with defaults when distribution changes
  useEffect(() => {
    const defaults = catalog.getParameterDefaults(distribution);
    const hasValues = Object.keys(values).length > 0;
    
    if (!hasValues && defaults) {
      onChange(defaults);
    }
  }, [distribution, onChange]);

  if (!parameters || parameters.length === 0) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700">Parameters</h3>
        <p className="text-xs text-gray-500">No parameters to configure for this distribution.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Parameters</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {parameters.length} parameter{parameters.length !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="space-y-3">
        {parameters.map((param) => (
          <ParameterControl
            key={param.name}
            parameter={param}
            value={values[param.name]}
            onChange={(value) => handleParameterChange(param.name, value)}
            distributionName={distribution}
          />
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="border-t border-gray-200 pt-3 space-y-2">
        <h4 className="text-sm font-medium text-gray-700">Quick Actions</h4>
        <button
          onClick={() => {
            const defaults = catalog.getParameterDefaults(distribution);
            onChange(defaults);
          }}
          className="text-xs w-full px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors font-medium"
        >
          Reset
        </button>
      </div>
    </div>
  );
}