export const getSimulationData = () => {
  return {
    candles: [],
    currentPrice: 22500.00,
    ema200: 22450.00,
    support: 22400.00,
    resistance: 22600.00,
    activePattern: null,
  };
};

export const startSimulation = () => {
  console.log('Simulation started (placeholder)');
};

export const stopSimulation = () => {
  console.log('Simulation stopped (placeholder)');
};

export const resetSimulation = () => {
  console.log('Simulation reset (placeholder)');
  return getSimulationData();
};
