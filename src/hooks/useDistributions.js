import { useState, useEffect } from 'react';
import { DistributionCatalog } from '../lib/distributionCatalog.js';

export function useDistributions() {
  const [distributions, setDistributions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const catalog = new DistributionCatalog();
    setDistributions(catalog.getDistributionList());
    setLoading(false);
  }, []);

  return { distributions, loading };
}