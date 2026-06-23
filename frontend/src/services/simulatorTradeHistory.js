import { orderApi } from "./api";

const STORAGE_KEY = "bullboom_simulator_trade_history";

export const getLocalSimulatorTrades = () => {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
};

export const recordSimulatorTrade = async (trade) => {
  const existing = getLocalSimulatorTrades();
  if (!existing.some((item) => item.executionId === trade.executionId)) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([trade, ...existing]));
      window.dispatchEvent(new Event("bullboom:simulator-trade-history"));
    } catch (error) {
      console.warn("Local simulator trade history is unavailable.", error);
    }
  }

  try {
    return await orderApi.createSimulatorHistory(trade);
  } catch (error) {
    console.warn("Simulator trade saved locally; server sync unavailable.", error);
    return { success: true, trade, localOnly: true };
  }
};
