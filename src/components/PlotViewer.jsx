import { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

export default function PlotViewer({ data }) {
  const plotRef = useRef(null);

  useEffect(() => {
    if (plotRef.current && data && data.x && data.y) {
      try {
        const isDiscrete = data.type === 'discrete';
        const functionName = isDiscrete ? 'Probability Mass Function' : 'Probability Density Function';
        const yAxisLabel = isDiscrete ? 'PMF(x)' : 'PDF(x)';
        
        // Create base plot configuration
        const baseConfig = {
          x: data.x,
          y: data.y,
          name: data.distributionName || 'Distribution'
        };
        
        // Add type-specific configuration
        const plotData = isDiscrete ? {
          ...baseConfig,
          type: 'bar',
          marker: { 
            color: '#4f46e5',
            line: { color: '#3730a3', width: 1 }
          },
          width: 0.8
        } : {
          ...baseConfig,
          type: 'scatter',
          mode: 'lines',
          line: { color: '#4f46e5', width: 3 },
          fill: 'tozeroy',
          fillcolor: 'rgba(79, 70, 229, 0.1)'
        };

        // Responsive title - shorter on mobile
        const isMobile = window.innerWidth < 768;
        const titleText = isMobile 
          ? `${data.distributionName || 'Distribution'}`  // Just distribution name on mobile
          : `${data.distributionName || 'Distribution'} - ${functionName}`;
        
        const layout = {
          title: {
            text: titleText,
            font: { size: isMobile ? 16 : 18, color: '#1f2937' },
            x: 0.5,
            xanchor: 'center'
          },
          xaxis: { 
            title: { text: 'x', font: { size: isMobile ? 12 : 14 } },
            gridcolor: '#e5e7eb',
            zeroline: true,
            zerolinecolor: '#9ca3af'
          },
          yaxis: { 
            title: { text: yAxisLabel, font: { size: isMobile ? 12 : 14 } },
            gridcolor: '#e5e7eb',
            zeroline: true,
            zerolinecolor: '#9ca3af'
          },
          margin: { 
            l: isMobile ? 50 : 70, 
            r: isMobile ? 20 : 30, 
            t: isMobile ? 60 : 80, 
            b: isMobile ? 50 : 60 
          },
          plot_bgcolor: '#ffffff',
          paper_bgcolor: '#ffffff',
          font: { family: 'Inter, system-ui, sans-serif' },
          showlegend: false
        };

        // Add discrete-specific layout options
        if (isDiscrete) {
          const range = Math.max(...data.x) - Math.min(...data.x);
          
          // Adaptive tick spacing based on range size
          let dtick = 1;
          if (range > 100) {
            dtick = Math.ceil(range / 20); // Show ~20 ticks max
          } else if (range > 50) {
            dtick = Math.ceil(range / 25); // Show ~25 ticks max
          } else if (range > 20) {
            dtick = Math.ceil(range / 20); // Show ~20 ticks max
          }
          
          layout.xaxis.tick0 = Math.min(...data.x);
          layout.xaxis.dtick = dtick;
          layout.xaxis.showgrid = true;
          layout.bargap = 0.1;
          layout.bargroupgap = 0.1;
        }

        const config = {
          responsive: true,
          displayModeBar: true,
          modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d', 'autoScale2d'],
          displaylogo: false,
          toImageButtonOptions: {
            format: 'png',
            filename: `${(data.distributionName || 'distribution').toLowerCase()}_distribution`,
            height: 500,
            width: 800,
            scale: 1
          }
        };

        // Ensure plotData is an array for Plotly
        const plotDataArray = Array.isArray(plotData) ? plotData : [plotData];
        
        Plotly.newPlot(plotRef.current, plotDataArray, layout, config);
      } catch (error) {
        console.error('Error rendering plot:', error);
        // Clear the plot on error
        if (plotRef.current) {
          plotRef.current.innerHTML = `
            <div class="flex items-center justify-center h-full">
              <div class="text-center text-red-500">
                <div class="text-3xl mb-2">⚠️</div>
                <div class="text-lg font-medium">Error rendering plot</div>
                <div class="text-sm">Please check your parameters</div>
              </div>
            </div>
          `;
        }
      }
    }
  }, [data]);

  if (!data) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center text-gray-400">
          <div className="text-5xl mb-4">📊</div>
          <div className="text-xl font-medium text-gray-600">Select a distribution to begin</div>
          <div className="text-sm text-gray-500 mt-1">Choose from the controls to view its PDF</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Plot - Takes most of the space */}
      <div className="flex-1 bg-white rounded-lg overflow-hidden min-h-0">
        <div ref={plotRef} className="w-full h-full"></div>
      </div>
      
      {/* Distribution Info - Compact on mobile */}
      {data && (
        <div className="bg-gray-50 rounded-lg p-2 lg:p-4 mt-2 lg:mt-4 flex-shrink-0">
          <div className="lg:block">
            <div className="flex items-center mb-1 lg:mb-3">
              <h4 className="text-sm font-semibold text-gray-900">Distribution Info</h4>
            </div>
            
            {/* Mobile: Horizontal layout for compact info */}
            <div className="lg:hidden">
              <p className="text-xs text-gray-600 mb-2">{data.description}</p>
              <div className="flex items-center space-x-4 text-xs">
                <span className="text-gray-500">
                  <strong>Type:</strong> <span className="text-gray-800 capitalize">{data.type || 'Continuous'}</span>
                </span>
                <span className="text-gray-500">
                  <strong>Support:</strong> 
                  <span className="text-gray-800 ml-1">
                    {data.type === 'discrete' ? 
                      (data.distributionName.includes('Binomial') ? '{0,1,...,n}' :
                       data.distributionName.includes('Poisson') ? '{0,1,2,...}' :
                       data.distributionName.includes('Geometric') ? '{1,2,3,...}' :
                       data.distributionName.includes('Negative') ? '{r,r+1,...}' :
                       '{0,1,2,...}') :
                      (data.distributionName.includes('Beta') ? '[0,1]' : 
                       data.distributionName.includes('Gamma') || data.distributionName.includes('Exponential') || data.distributionName.includes('Chi') || data.distributionName.includes('Log') ? '[0,∞)' :
                       data.distributionName.includes('Uniform') ? '[a,b]' : '(-∞,∞)')
                    }
                  </span>
                </span>
              </div>
            </div>
            
            {/* Desktop: Original grid layout */}
            <div className="hidden lg:block">
              <p className="text-xs text-gray-600 mb-3">{data.description}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-md p-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Type</span>
                  <p className="text-xs font-semibold text-gray-800 mt-1 capitalize">{data.type || 'Continuous'}</p>
                </div>
                <div className="bg-white rounded-md p-2">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Support</span>
                  <p className="text-xs font-semibold text-gray-800 mt-1 break-words">
                    {data.type === 'discrete' ? 
                      (data.distributionName.includes('Binomial') ? '{0, 1, ..., n}' :
                       data.distributionName.includes('Poisson') ? '{0, 1, 2, ...}' :
                       data.distributionName.includes('Geometric') ? '{1, 2, 3, ...}' :
                       data.distributionName.includes('Negative') ? '{r, r+1, r+2, ...}' :
                       '{0, 1, 2, ...}') :
                      (data.distributionName.includes('Beta') ? '[0, 1]' : 
                       data.distributionName.includes('Gamma') || data.distributionName.includes('Exponential') || data.distributionName.includes('Chi') || data.distributionName.includes('Log') ? '[0, ∞)' :
                       data.distributionName.includes('Uniform') ? '[a, b]' : '(-∞, ∞)')
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}