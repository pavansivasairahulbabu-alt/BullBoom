import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaChartPie, FaTrophy, FaFire, FaWallet,
  FaArrowUp, FaArrowDown, FaSync, FaChartBar,
  FaCheckCircle, FaTimesCircle, FaBolt
} from 'react-icons/fa';
import { positionApi, orderApi, userApi } from '../services/api.js';

// ─── helpers ──────────────────────────────────────────────────────────────────
const fmt = (n) =>
  new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n || 0);

const fmtInt = (n) =>
  new Intl.NumberFormat('en-IN').format(n || 0);

const pctColor = (v) => (v >= 0 ? 'text-emerald-400' : 'text-red-400');
const pctBg   = (v) => (v >= 0 ? 'bg-emerald-400/10 border-emerald-400/20' : 'bg-red-400/10 border-red-400/20');
const prefix  = (v) => (v >= 0 ? '+' : '');

// ─── computeMetrics ────────────────────────────────────────────────────────────
function computeMetrics(positions, profile) {
  const open   = positions.filter(p => p.status === 'OPEN');
  const closed = positions.filter(p => p.status === 'CLOSED');
  const total  = positions.length;

  // P&L
  const profits = closed.filter(p => (p.pnl || 0) > 0);
  const losses  = closed.filter(p => (p.pnl || 0) < 0);

  const totalProfit = profits.reduce((s, p) => s + (p.pnl || 0), 0);
  const totalLoss   = losses.reduce((s, p)  => s + (p.pnl || 0), 0);
  const netPnl      = closed.reduce((s, p)  => s + (p.pnl || 0), 0);

  // Today's PnL — positions closed today
  const todayStr = new Date().toDateString();
  const todayPnl = closed
    .filter(p => new Date(p.updatedAt || p.closedAt || '').toDateString() === todayStr)
    .reduce((s, p) => s + (p.pnl || 0), 0);

  // Win / loss rates
  const winCount  = profits.length;
  const lossCount = losses.length;
  const closedCount = closed.length;
  const winRate   = closedCount > 0 ? (winCount / closedCount) * 100 : 0;
  const lossRate  = closedCount > 0 ? (lossCount / closedCount) * 100 : 0;

  // Average trade
  const avgProfit = winCount  > 0 ? totalProfit / winCount  : 0;
  const avgLoss   = lossCount > 0 ? totalLoss   / lossCount : 0;

  // Best / worst
  const bestTrade  = closed.length > 0 ? Math.max(...closed.map(p => p.pnl || 0)) : 0;
  const worstTrade = closed.length > 0 ? Math.min(...closed.map(p => p.pnl || 0)) : 0;

  // Capital
  const investedCapital  = open.reduce((s, p) => s + (p.investedAmount || 0), 0);
  const availableCapital = profile?.balance ?? 0;
  const totalCapital     = availableCapital + investedCapital;

  return {
    totalPositions: total,
    openPositions:  open.length,
    closedPositions: closedCount,
    totalTrades: total,
    totalProfit, totalLoss, netPnl, todayPnl,
    winRate, lossRate, winCount, lossCount,
    investedCapital, availableCapital, totalCapital,
    avgProfit, avgLoss, bestTrade, worstTrade,
  };
}

// ─── StatCard ─────────────────────────────────────────────────────────────────
function StatCard({ title, value, sub, icon: Icon, color = 'text-white', accent = '#32CD32', delay = 0, badge }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className="relative bg-[#0B1220]/80 backdrop-blur-xl border border-white/8 rounded-2xl p-5 overflow-hidden
                 hover:border-white/20 hover:shadow-[0_0_24px_rgba(50,205,50,0.06)] transition-all duration-300"
    >
      {/* Glow top-right */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-10"
           style={{ background: accent }} />

      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
             style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
          <Icon className="w-5 h-5" style={{ color: accent }} />
        </div>
        {badge && (
          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${badge.cls}`}>
            {badge.text}
          </span>
        )}
      </div>
      <p className="text-[#B8C0D4] text-xs mb-1 font-medium">{title}</p>
      <p className={`text-2xl font-bold tracking-tight ${color}`}>{value}</p>
      {sub && <p className="text-[#B8C0D4] text-xs mt-1">{sub}</p>}
    </motion.div>
  );
}

// ─── SectionHeader ────────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, color = '#32CD32' }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center"
           style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <h2 className="text-white font-bold text-lg">{title}</h2>
    </div>
  );
}

// ─── WinRateRing ──────────────────────────────────────────────────────────────
function WinRateRing({ winRate, winCount, lossCount }) {
  const r = 48;
  const circ = 2 * Math.PI * r;
  const dash = (winRate / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 120 120" className="w-32 h-32 -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="#1A2236" strokeWidth="12" />
          <circle cx="60" cy="60" r={r} fill="none" stroke="#32CD32" strokeWidth="12"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{winRate.toFixed(0)}%</span>
          <span className="text-[10px] text-[#B8C0D4]">Win Rate</span>
        </div>
      </div>
      <div className="flex gap-4 text-xs">
        <span className="flex items-center gap-1 text-emerald-400">
          <FaCheckCircle /> {winCount} Wins
        </span>
        <span className="flex items-center gap-1 text-red-400">
          <FaTimesCircle /> {lossCount} Losses
        </span>
      </div>
    </div>
  );
}

// ─── CapitalBar ───────────────────────────────────────────────────────────────
function CapitalBar({ invested, available, total }) {
  const investedPct = total > 0 ? (invested / total) * 100 : 0;
  const freePct     = 100 - investedPct;
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-[#B8C0D4]">
        <span>Capital Utilization</span>
        <span>{investedPct.toFixed(1)}% deployed</span>
      </div>
      <div className="h-3 rounded-full bg-[#1A2236] overflow-hidden flex">
        <div className="bg-gradient-to-r from-[#32CD32] to-[#39FF14] transition-all duration-700 rounded-full"
             style={{ width: `${investedPct}%` }} />
        <div className="bg-[#1A2236] transition-all duration-700"
             style={{ width: `${freePct}%` }} />
      </div>
      <div className="flex justify-between text-xs">
        <span className="flex items-center gap-1 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
          Deployed ₹{fmt(invested)}
        </span>
        <span className="flex items-center gap-1 text-[#B8C0D4]">
          <span className="w-2 h-2 rounded-full bg-[#1A2236] border border-white/20 inline-block" />
          Free ₹{fmt(available)}
        </span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Portfolio() {
  const [positions, setPositions] = useState([]);
  const [profile, setProfile]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  const fetchData = async () => {
    try {
      const [posRes, profileRes] = await Promise.allSettled([
        positionApi.getPositions(),
        userApi.getProfile(),
      ]);
      if (posRes.status === 'fulfilled' && posRes.value?.success) {
        setPositions(posRes.value.positions || []);
      }
      if (profileRes.status === 'fulfilled' && profileRes.value?.user) {
        setProfile(profileRes.value.user);
      }
    } catch (err) {
      console.error('Portfolio fetch error:', err);
    } finally {
      setLoading(false);
      setLastRefreshed(new Date());
    }
  };

  useEffect(() => {
    fetchData();
    const iv = setInterval(fetchData, 5000);
    return () => clearInterval(iv);
  }, []);

  const m = useMemo(() => computeMetrics(positions, profile), [positions, profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050816] flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <FaSync className="w-8 h-8 text-[#32CD32]" />
        </motion.div>
      </div>
    );
  }

  const hasData = positions.length > 0;

  return (
    <div className="min-h-screen bg-[#050816] p-4 md:p-8">
      {/* Ambient bg */}
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        {[...Array(16)].map((_, i) => (
          <motion.div key={i} className="absolute w-1 h-1 bg-[#32CD32] rounded-full"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3 + Math.random() * 4, repeat: Infinity, delay: Math.random() * 3 }} />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-[#32CD32] bg-clip-text text-transparent">
              Portfolio Summary
            </h1>
            <p className="text-[#B8C0D4] text-sm mt-1">
              Real-time overview of your trading performance &amp; capital
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#B8C0D4] text-xs">
              Updated {lastRefreshed.toLocaleTimeString()}
            </span>
            <button onClick={fetchData}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0B1220] border border-white/10
                         text-[#B8C0D4] hover:text-white hover:border-[#32CD32]/30 transition-all text-sm">
              <FaSync className="w-3 h-3" /> Refresh
            </button>
          </div>
        </div>

        {/* ── Empty state ── */}
        {!hasData && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-20 bg-[#0B1220]/50 border border-white/10 rounded-2xl">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">No Trades Yet</h3>
            <p className="text-[#B8C0D4]">Start trading from the Chart simulator to see your portfolio metrics here.</p>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════
            SECTION 1 — Position Statistics
        ═══════════════════════════════════════ */}
        <section>
          <SectionHeader icon={FaChartPie} title="Position Statistics" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
            <StatCard title="Total Trades" value={fmtInt(m.totalTrades)} icon={FaChartBar} delay={0}
              badge={{ text: 'Total', cls: 'bg-blue-500/10 border-blue-500/20 text-blue-400' }} />
            <StatCard title="Open Positions" value={fmtInt(m.openPositions)} icon={FaBolt}
              color="text-blue-400" accent="#3B82F6" delay={0.05}
              badge={{ text: 'Live', cls: 'bg-blue-500/10 border-blue-500/20 text-blue-400' }} />
            <StatCard title="Closed Positions" value={fmtInt(m.closedPositions)} icon={FaCheckCircle}
              color="text-gray-400" accent="#6B7280" delay={0.1} />
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 2 — P&L Statistics
        ═══════════════════════════════════════ */}
        <section>
          <SectionHeader icon={FaFire} title="Profit & Loss" color="#FF6B35" />
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Profit" icon={FaArrowUp}
              value={`₹${fmt(m.totalProfit)}`}
              color="text-emerald-400" accent="#10B981" delay={0}
              badge={{ text: '▲', cls: 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' }} />
            <StatCard title="Total Loss" icon={FaArrowDown}
              value={`₹${fmt(Math.abs(m.totalLoss))}`}
              color="text-red-400" accent="#EF4444" delay={0.05}
              badge={{ text: '▼', cls: 'bg-red-400/10 border-red-400/20 text-red-400' }} />
            <StatCard title="Net P&L" icon={FaChartPie}
              value={`${prefix(m.netPnl)}₹${fmt(m.netPnl)}`}
              color={pctColor(m.netPnl)} accent={m.netPnl >= 0 ? '#32CD32' : '#EF4444'} delay={0.1}
              badge={m.netPnl >= 0
                ? { text: 'Profit', cls: 'bg-emerald-400/10 border-emerald-400/20 text-emerald-400' }
                : { text: 'Loss', cls: 'bg-red-400/10 border-red-400/20 text-red-400' }}
            />
            <StatCard title="Today's P&L" icon={FaBolt}
              value={`${prefix(m.todayPnl)}₹${fmt(m.todayPnl)}`}
              color={pctColor(m.todayPnl)} accent={m.todayPnl >= 0 ? '#32CD32' : '#EF4444'} delay={0.15}
              sub="Based on today's closed trades" />
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 3 — Performance Metrics + Ring
        ═══════════════════════════════════════ */}
        <section>
          <SectionHeader icon={FaTrophy} title="Performance Metrics" color="#FFD700" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Win Rate Ring */}
            <div className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/8 rounded-2xl p-6
                            flex flex-col items-center justify-center gap-4
                            hover:border-white/20 transition-all">
              <WinRateRing winRate={m.winRate} winCount={m.winCount} lossCount={m.lossCount} />
            </div>

            {/* Performance stat cards 2-col */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-4">
              <StatCard title="Win Rate" value={`${m.winRate.toFixed(1)}%`}
                color={pctColor(m.winRate - 50)} icon={FaCheckCircle}
                accent="#10B981" delay={0}
                sub={`${m.winCount} winning trades`} />
              <StatCard title="Loss Rate" value={`${m.lossRate.toFixed(1)}%`}
                color="text-red-400" icon={FaTimesCircle}
                accent="#EF4444" delay={0.05}
                sub={`${m.lossCount} losing trades`} />
              <StatCard title="Winning Trades" value={fmtInt(m.winCount)}
                color="text-emerald-400" icon={FaTrophy} accent="#10B981" delay={0.1} />
              <StatCard title="Losing Trades" value={fmtInt(m.lossCount)}
                color="text-red-400" icon={FaTimesCircle} accent="#EF4444" delay={0.15} />
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 4 — Capital Metrics
        ═══════════════════════════════════════ */}
        <section>
          <SectionHeader icon={FaWallet} title="Capital Metrics" color="#7C3AED" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Capital Bar */}
            <div className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/8 rounded-2xl p-6
                            hover:border-white/20 transition-all">
              <CapitalBar invested={m.investedCapital} available={m.availableCapital} total={m.totalCapital} />
              <div className="grid grid-cols-3 gap-3 mt-6">
                {[
                  { label: 'Total Capital',    value: `₹${fmt(m.totalCapital)}`,     cls: 'text-white' },
                  { label: 'Invested',         value: `₹${fmt(m.investedCapital)}`,  cls: 'text-emerald-400' },
                  { label: 'Available',        value: `₹${fmt(m.availableCapital)}`, cls: 'text-[#B8C0D4]' },
                ].map(c => (
                  <div key={c.label} className="bg-[#050816]/60 rounded-xl p-3 border border-white/5 text-center">
                    <p className="text-[#B8C0D4] text-xs mb-1">{c.label}</p>
                    <p className={`font-bold text-sm ${c.cls}`}>{c.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Capital stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard title="Available Capital" value={`₹${fmt(m.availableCapital)}`}
                icon={FaWallet} color="text-white" accent="#7C3AED" delay={0} />
              <StatCard title="Invested Capital" value={`₹${fmt(m.investedCapital)}`}
                icon={FaArrowUp} color="text-emerald-400" accent="#10B981" delay={0.05} />
              <div className="sm:col-span-2">
                <StatCard title="Remaining Balance" value={`₹${fmt(m.availableCapital)}`}
                  icon={FaChartBar} color="text-[#B8C0D4]" accent="#7C3AED" delay={0.1}
                  sub="Available for new trades" />
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 5 — Trade Metrics
        ═══════════════════════════════════════ */}
        <section>
          <SectionHeader icon={FaBolt} title="Trade Metrics" color="#F59E0B" />
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Avg Profit / Trade" value={`₹${fmt(m.avgProfit)}`}
              icon={FaArrowUp} color="text-emerald-400" accent="#10B981" delay={0}
              sub="Per winning trade" />
            <StatCard title="Avg Loss / Trade" value={`₹${fmt(Math.abs(m.avgLoss))}`}
              icon={FaArrowDown} color="text-red-400" accent="#EF4444" delay={0.05}
              sub="Per losing trade" />
            <StatCard title="Best Trade" value={`${prefix(m.bestTrade)}₹${fmt(m.bestTrade)}`}
              icon={FaTrophy} color="text-emerald-400" accent="#10B981" delay={0.1}
              badge={{ text: '🏆', cls: 'bg-yellow-400/10 border-yellow-400/20 text-yellow-400' }} />
            <StatCard title="Worst Trade" value={`${prefix(m.worstTrade)}₹${fmt(m.worstTrade)}`}
              icon={FaTimesCircle} color="text-red-400" accent="#EF4444" delay={0.15}
              badge={{ text: '💔', cls: 'bg-red-400/10 border-red-400/20 text-red-400' }} />
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SECTION 6 — Recent Positions Preview
        ═══════════════════════════════════════ */}
        {positions.length > 0 && (
          <section>
            <SectionHeader icon={FaChartBar} title="Recent Positions" color="#06B6D4" />
            <div className="bg-[#0B1220]/80 backdrop-blur-xl border border-white/8 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[#B8C0D4] text-xs border-b border-white/10">
                      {['Symbol', 'Type', 'Qty', 'Entry ₹', 'P&L ₹', 'P&L %', 'Status'].map(h => (
                        <th key={h} className="px-5 py-4 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {positions.slice(0, 8).map((pos, i) => (
                      <motion.tr key={pos._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors">
                        <td className="px-5 py-4 font-semibold">{pos.symbol}</td>
                        <td className="px-5 py-4">
                          <span className={`font-semibold ${pos.orderType === 'BUY' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {pos.orderType}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-[#B8C0D4]">{pos.quantity}</td>
                        <td className="px-5 py-4">₹{fmt(pos.entryPrice)}</td>
                        <td className={`px-5 py-4 font-semibold ${pctColor(pos.pnl)}`}>
                          {prefix(pos.pnl || 0)}₹{fmt(pos.pnl)}
                        </td>
                        <td className={`px-5 py-4 font-semibold ${pctColor(pos.pnlPercentage)}`}>
                          {prefix(pos.pnlPercentage || 0)}{fmt(pos.pnlPercentage)}%
                        </td>
                        <td className="px-5 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                            pos.status === 'OPEN'
                              ? 'bg-blue-500/10 border-blue-400/20 text-blue-400'
                              : pctBg(pos.pnl)
                          } ${pos.status !== 'OPEN' ? pctColor(pos.pnl) : ''}`}>
                            {pos.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
