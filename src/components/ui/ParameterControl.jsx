import React, { useRef } from 'react';
import RangeSlider from './RangeSlider';

export default function ParameterControl({ 
  parameter, 
  value, 
  onChange, 
  distributionName 
}) {
  const sliderRef = useRef();

  const handleSliderChange = (newValue) => {
    onChange(newValue);
  };

  const handleReset = () => {
    onChange(parameter.default);
    if (sliderRef.current) {
      sliderRef.current.resetRange();
    }
  };

  // Get slider range from the parameter specification
  const sliderRange = parameter.sliderRange || { min: 0, max: 10, step: 0.1 };
  const currentValue = value ?? parameter.default;

  return (
    <div className="space-y-4">
      {/* Parameter Label and Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {parameter.displayName}
        </label>
        {parameter.description && (
          <p className="text-xs text-gray-500">{parameter.description}</p>
        )}
      </div>

      {/* Slider */}
      <RangeSlider
        ref={sliderRef}
        value={currentValue}
        onChange={handleSliderChange}
        min={sliderRange.min}
        max={sliderRange.max}
        step={sliderRange.step}
        label=""
        domainMin={parameter.min}
        domainMax={parameter.max}
      />

      {/* Reset Button */}
      <div className="flex justify-end">
        <button
          onClick={handleReset}
          className="text-xs px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          title="Reset value and range to defaults"
        >
          Reset to Default ({parameter.default})
        </button>
      </div>
    </div>
  );
}