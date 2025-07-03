import { useState, useEffect } from 'react';
import { DistributionCatalog } from '../lib/distributionCatalog.js';

const catalog = new DistributionCatalog();

export function usePlotData(distributionName, parameters) {
  const [plotData, setPlotData] = useState(null);

  useEffect(() => {
    if (!distributionName) return;
    
    // If parameters is empty, try to get defaults
    const distributionInfo = catalog.getDistributionInfo(distributionName);
    if (!distributionInfo) return;
    
    let effectiveParameters = parameters;
    if (!parameters || Object.keys(parameters).length === 0) {
      effectiveParameters = catalog.getParameterDefaults(distributionName);
      if (!effectiveParameters || Object.keys(effectiveParameters).length === 0) return;
    }

    const generatePDFData = () => {
      if (!distributionInfo || !distributionInfo.pdf) {
        console.warn(`PDF function not found for distribution: ${distributionName}`);
        return null;
      }

      // Use the distribution's range calculator with effective parameters
      const range = distributionInfo.rangeCalculator 
        ? distributionInfo.rangeCalculator(effectiveParameters)
        : { min: -5, max: 5 };
      
      const x = [];
      const y = [];
      const isDiscrete = distributionInfo.type === 'discrete';

      try {
        if (isDiscrete) {
          // For discrete distributions, generate points at integer values
          const minX = Math.max(0, Math.ceil(range.min));
          const maxX = Math.floor(range.max);
          
          for (let xi = minX; xi <= maxX; xi++) {
            x.push(xi);
            
            // Call the PDF function with the current x value and effective parameters
            const pdfValue = distributionInfo.pdf(xi, ...Object.values(effectiveParameters));
            y.push(isNaN(pdfValue) || !isFinite(pdfValue) ? 0 : pdfValue);
          }
        } else {
          // For continuous distributions, use the existing logic
          const numPoints = 200;
          const step = (range.max - range.min) / numPoints;
          
          for (let i = 0; i <= numPoints; i++) {
            const xi = range.min + i * step;
            x.push(xi);
            
            // Call the PDF function with the current x value and effective parameters
            const pdfValue = distributionInfo.pdf(xi, ...Object.values(effectiveParameters));
            y.push(isNaN(pdfValue) || !isFinite(pdfValue) ? 0 : pdfValue);
          }
        }

        // Validate the generated data
        if (x.length === 0 || y.length === 0 || x.length !== y.length) {
          console.warn(`Invalid plot data generated for ${distributionName}`);
          return null;
        }

        const result = {
          x,
          y,
          distributionName: distributionInfo.displayName || distributionName,
          description: distributionInfo.description || '',
          type: distributionInfo.type || 'continuous',
          plotType: distributionInfo.plotType || 'line'
        };
        
        
        return result;
      } catch (error) {
        console.error(`Error calculating PDF for ${distributionName}:`, error);
        return null;
      }
    };

    setPlotData(generatePDFData());
  }, [distributionName, parameters]);

  return plotData;
}