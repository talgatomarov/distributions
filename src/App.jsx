import { useState, useEffect } from 'react';
import DistributionSelector from './components/DistributionSelector';
import ParameterInputs from './components/ParameterInputs';
import PlotViewer from './components/PlotViewer';
import ErrorBoundary from './components/ErrorBoundary';
import { useDistributions } from './hooks/useDistributions';
import { usePlotData } from './hooks/usePlotData';
import { DistributionCatalog } from './lib/distributionCatalog.js';

const catalog = new DistributionCatalog();

function App() {
  const [selectedDistribution, setSelectedDistribution] = useState('normal');
  const [parameters, setParameters] = useState({});
  const { distributions, loading } = useDistributions();
  const plotData = usePlotData(selectedDistribution, parameters);

  // Initialize parameters with defaults when the app starts
  useEffect(() => {
    if (!loading && selectedDistribution && Object.keys(parameters).length === 0) {
      const defaults = catalog.getParameterDefaults(selectedDistribution);
      if (defaults && Object.keys(defaults).length > 0) {
        setParameters(defaults);
      }
    }
  }, [loading, selectedDistribution, parameters]);

  // Handle distribution change
  const handleDistributionChange = (newDistribution) => {
    setSelectedDistribution(newDistribution);
    const defaults = catalog.getParameterDefaults(newDistribution);
    setParameters(defaults || {}); // Set defaults immediately when distribution changes
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Loading distributions...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 md:py-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Distribution Visualizer
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Explore probability distributions and their parameters</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">
        {/* Desktop Layout: Side by side */}
        <div className="hidden lg:flex gap-4 h-[900px] bg-white rounded-2xl overflow-hidden shadow-sm">
          {/* Left Third - Control Panel */}
          <div className="w-1/3 bg-gray-100 p-6 space-y-4 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <h2 className="text-lg font-medium text-gray-900">Controls</h2>
              </div>
              
              {/* Distribution Selection */}
              <div className="space-y-6">
                <DistributionSelector
                  distributions={distributions}
                  selected={selectedDistribution}
                  onSelect={handleDistributionChange}
                />
              </div>

              {/* Parameter Controls */}
              {selectedDistribution && (
                <div className="space-y-6">
                  <ParameterInputs
                    distribution={selectedDistribution}
                    values={parameters}
                    onChange={setParameters}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Two-Thirds - Plot Area */}
          <div className="w-2/3 bg-white p-12 flex items-center justify-center">
            <div className="w-full h-full">
              <ErrorBoundary>
                <PlotViewer data={plotData} />
              </ErrorBoundary>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout: Stacked */}
        <div className="lg:hidden space-y-4">
          {/* Controls at top on mobile */}
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                <h2 className="text-lg font-medium text-gray-900">Controls</h2>
              </div>
              
              {/* Distribution Selection */}
              <div className="space-y-4">
                <DistributionSelector
                  distributions={distributions}
                  selected={selectedDistribution}
                  onSelect={handleDistributionChange}
                />
              </div>

              {/* Parameter Controls */}
              {selectedDistribution && (
                <div className="space-y-4">
                  <ParameterInputs
                    distribution={selectedDistribution}
                    values={parameters}
                    onChange={setParameters}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Plot below controls on mobile */}
          <div className="bg-white rounded-xl shadow-sm p-2 md:p-4">
            <div className="h-[500px] md:h-[600px]">
              <ErrorBoundary>
                <PlotViewer data={plotData} />
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-500">
            Talgat Omarov • <a href="https://github.com/talgatomarov" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">github.com/talgatomarov</a> • {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;