import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';

const RangeSlider = forwardRef(({ 
  value, 
  onChange, 
  min: initialMin, 
  max: initialMax, 
  step = 0.01, 
  label,
  disabled = false,
  domainMin = -Infinity,
  domainMax = Infinity
}, ref) => {
  const [sliderMin, setSliderMin] = useState(initialMin);
  const [sliderMax, setSliderMax] = useState(initialMax);
  const [exactValue, setExactValue] = useState(value);

  // Update exact value when external value changes
  useEffect(() => {
    setExactValue(value);
  }, [value]);

  // Reset function to restore original min/max values
  const resetRange = () => {
    setSliderMin(initialMin);
    setSliderMax(initialMax);
  };

  // Expose reset function through ref
  useImperativeHandle(ref, () => ({
    resetRange
  }));

  const handleSliderChange = (e) => {
    const newValue = parseFloat(e.target.value);
    setExactValue(newValue);
    onChange(newValue);
  };

  const handleExactValueChange = (e) => {
    const newValue = parseFloat(e.target.value);
    if (isNaN(newValue)) return;
    
    setExactValue(newValue);
    
    // Always pass the value through (only constrained by domain)
    const constrainedValue = Math.max(domainMin, Math.min(domainMax, newValue));
    onChange(constrainedValue);
    
    // Auto-adjust slider range if value is outside current range (after onChange)
    if (constrainedValue < sliderMin) {
      const adjustedMin = Math.max(constrainedValue - Math.abs(constrainedValue * 0.1), domainMin);
      setSliderMin(adjustedMin);
    }
    if (constrainedValue > sliderMax) {
      const adjustedMax = Math.min(constrainedValue + Math.abs(constrainedValue * 0.1), domainMax);
      setSliderMax(adjustedMax);
    }
  };

  const handleMinChange = (e) => {
    const newMin = parseFloat(e.target.value);
    if (isNaN(newMin)) return;
    
    // Only constrain by domain, not by current max value
    const constrainedMin = Math.max(domainMin, newMin);
    setSliderMin(constrainedMin);
  };

  const handleMaxChange = (e) => {
    const newMax = parseFloat(e.target.value);
    if (isNaN(newMax)) return;
    
    // Only constrain by domain, not by current min value
    const constrainedMax = Math.min(domainMax, newMax);
    setSliderMax(constrainedMax);
  };

  const handleExactValueBlur = () => {
    // Ensure exact value is within domain
    const constrainedValue = Math.max(domainMin, Math.min(domainMax, exactValue));
    if (constrainedValue !== exactValue) {
      setExactValue(constrainedValue);
      onChange(constrainedValue);
    }
  };

  // Handle case where min > max by swapping them for slider logic
  const effectiveMin = Math.min(sliderMin, sliderMax);
  const effectiveMax = Math.max(sliderMin, sliderMax);
  
  // Determine if the current value is within slider range
  const isInRange = value >= effectiveMin && value <= effectiveMax;
  const sliderValue = isInRange ? value : (value < effectiveMin ? effectiveMin : effectiveMax);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        {effectiveMin >= effectiveMax && (
          <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
            Invalid range (min ≥ max)
          </span>
        )}
        {effectiveMin < effectiveMax && !isInRange && (
          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
            Outside slider range
          </span>
        )}
      </div>
      
      {/* Min/Max Range Controls */}
      <div className="flex items-center space-x-2">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Min</label>
          <input
            type="number"
            value={sliderMin}
            onChange={handleMinChange}
            step={step}
            className="w-full text-xs px-2 py-1 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            disabled={disabled}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Max</label>
          <input
            type="number"
            value={sliderMax}
            onChange={handleMaxChange}
            step={step}
            className="w-full text-xs px-2 py-1 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            disabled={disabled}
          />
        </div>
      </div>
      
      {/* Slider */}
      <div className="relative">
        <input
          type="range"
          min={effectiveMin}
          max={effectiveMax}
          step={step}
          value={sliderValue}
          onChange={handleSliderChange}
          disabled={disabled || effectiveMin >= effectiveMax}
          className={`
            w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-slider
            disabled:opacity-50 disabled:cursor-not-allowed
            ${!isInRange ? 'opacity-60' : ''}
          `}
          style={{
            background: !isInRange 
              ? `linear-gradient(to right, #fbbf24 0%, #f59e0b ${((sliderValue - effectiveMin) / (effectiveMax - effectiveMin)) * 100}%, #e5e7eb ${((sliderValue - effectiveMin) / (effectiveMax - effectiveMin)) * 100}%, #e5e7eb 100%)`
              : `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${((value - effectiveMin) / (effectiveMax - effectiveMin)) * 100}%, #e5e7eb ${((value - effectiveMin) / (effectiveMax - effectiveMin)) * 100}%, #e5e7eb 100%)`
          }}
        />
        
        {/* Range labels */}
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{effectiveMin}</span>
          <span>{effectiveMax}</span>
        </div>
      </div>

      {/* Exact Value Input */}
      <div>
        <label className="block text-xs text-gray-500 mb-1">Exact Value</label>
        <input
          type="number"
          value={exactValue}
          onChange={handleExactValueChange}
          onBlur={handleExactValueBlur}
          step={step}
          className="w-full text-sm px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          disabled={disabled}
        />
      </div>

      {/* Domain constraints indicator */}
      {(domainMin > -Infinity || domainMax < Infinity) && (
        <div className="text-xs text-gray-500">
          Domain: {domainMin === -Infinity ? '-∞' : domainMin} to {domainMax === Infinity ? '∞' : domainMax}
        </div>
      )}
    </div>
  );
});

RangeSlider.displayName = 'RangeSlider';

export default RangeSlider;