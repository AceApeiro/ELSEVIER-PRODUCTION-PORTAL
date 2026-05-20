import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useESPCPData } from './hooks/useESPCPData';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { Menu, X, Activity, BarChart2 } from 'lucide-react';
import { ApeiroLogo } from './components/ApeiroLogo';
import { ESPCPDailyProduction } from './components/ESPCPDailyProduction';
import { ESPCPMonthlyPerformers } from './components/ESPCPMonthlyPerformers';

const MatrixDigitalRain = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let columns = Math.floor(width / 14);
    const drops = Array(columns).fill(1).map(() => ({
      y: Math.random() * -height,
      speed: 1.5 + Math.random() * 4,
      len: 5 + Math.floor(Math.random() * 15)
    }));

    let animationFrameId: number;

    const draw = () => {
      ctx.fillStyle = 'rgba(5, 10, 16, 0.2)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < drops.length; i++) {
        const p = drops[i];
        ctx.fillStyle = i % 8 === 0 ? '#ffffff' : '#00d4ff';
        ctx.fillRect(i * 14, p.y, 12, 12);

        p.y += p.speed;

        if (p.y > height) {
          p.y = -14 * p.len;
          p.speed = 1.5 + Math.random() * 4;
        }
      }
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      columns = Math.floor(width / 14);
      drops.length = 0;
      for (let i = 0; i < columns; i++) {
        drops[i] = {
          y: Math.random() * -height,
          speed: 1.5 + Math.random() * 4,
          len: 5 + Math.floor(Math.random() * 15)
        };
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 opacity-30 pointer-events-none" />;
};

export default function ESPCPDashboard({ setCurrentProject }: { setCurrentProject?: (project: string | null) => void }) {
  const { monthlyData, agentData, mayData, loading, error } = useESPCPData();
  const [activeView, setActiveView] = useState<'PRODUCTION' | 'ACE_GRID' | 'SUMMARY_TABLE' | 'MONTHLY_PERFORMANCES' | 'DAILY_PRODUCTION'>('PRODUCTION');
  
  // Production View State
  const [currentYear, setCurrentYear] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');

  // Nexus View State
  const [selectedAgentIdx, setSelectedAgentIdx] = useState<number>(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const groupedMonths = useMemo(() => {
    const group: Record<string, string[]> = {};
    monthlyData.forEach((row) => {
      if (!row || row.length < 2) return;
      const y = row[0];
      const m = row[1]?.trim();
      if (!y || !m) return;
      if (!group[y]) group[y] = [];
      if (!group[y].includes(m)) {
        group[y].push(m);
      }
    });

    if (Object.keys(group).length > 0 && !currentYear) {
      const y = Object.keys(group)[0];
      setCurrentYear(y);
      setCurrentMonth(group[y][0]);
    }

    return group;
  }, [monthlyData, currentYear]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#05070d] text-[#00aaff] font-mono text-xl tracking-[0.2em] relative overflow-hidden">
        <MatrixDigitalRain />
        <div className="z-10 animate-pulse">INIT_PROTOCOL // CONNECTING...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#05070d] text-red-500 font-mono text-xl tracking-[0.2em]">
        SYSTEM_FAILURE: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070d] text-[#00f2ff] font-['Exo_2'] overflow-hidden selection:bg-[#00f2ff] selection:text-black">
      <MatrixDigitalRain />
      
      {/* Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none z-20 overflow-hidden mix-blend-overlay">
        <div className="w-full h-[2px] bg-[#00f2ff]/20 absolute top-0 shadow-[0_0_20px_#00f2ff] animate-[scan_4s_linear_infinite]" />
      </div>
      <style>{`
        @keyframes scan { from { top: 0%; } to { top: 100%; } }
        /* Add cool scrollbar */
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-thumb { background: #00f2ff; border-radius: 4px; }
        ::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.4); }
      `}</style>

      {/* Global Tab Navigation */}
      <div className="relative z-30 flex flex-wrap items-center justify-between px-6 py-4 bg-black/60 backdrop-blur-md border-b-2 border-[#00f2ff]/30 shadow-[0_0_20px_rgba(0,170,255,0.2)]">
        <div className="flex items-center gap-4 mb-2 md:mb-0">
          <div className="text-2xl font-bold font-['Rajdhani'] tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#00f2ff] to-[#0066ff]">
            ESPCP
          </div>
          <div className="h-4 w-[2px] bg-[#00f2ff]/30 mx-2 hidden md:block" />
          <div className="flex gap-4 flex-wrap">
            {[
              { id: 'PRODUCTION', label: 'PRODUCTION' },
              { id: 'ACE_GRID', label: 'AGENT_GRID' },
              { id: 'SUMMARY_TABLE', label: 'DATA_TABLES' },
              { id: 'MONTHLY_PERFORMANCES', label: 'MONTHLY_PERFORMANCES' },
              { id: 'DAILY_PRODUCTION', label: 'DAILY_PRODUCTION' },
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={(e) => {
                  const btn = e.currentTarget;
                  btn.classList.add('opacity-0', 'translate-x-[20px]', 'blur-sm');
                  setTimeout(() => {
                    setActiveView(tab.id as any);
                    btn.classList.remove('opacity-0', 'translate-x-[20px]', 'blur-sm');
                  }, 400);
                }}
                className={`relative overflow-hidden group font-mono text-xs md:text-sm tracking-widest transition-all duration-400 font-bold px-3 py-1 rounded border
                  ${activeView === tab.id ? 'text-black bg-[#00f2ff] border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.6)]' : 'text-[#00f2ff]/70 hover:text-white border-[#00f2ff]/20 hover:border-[#00f2ff]/80 hover:bg-[#00f2ff]/10 hover:shadow-[0_0_10px_rgba(0,242,255,0.3)]'}`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#00f2ff]/40 to-transparent -translate-x-[150%] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out"></div>
                <span className="relative z-10 block transition-transform duration-300 group-hover:scale-105">[ {tab.label} ]</span>
              </button>
            ))}
            <button
              onClick={(e) => {
                const btn = e.currentTarget;
                btn.classList.add('opacity-0', 'scale-50');
                if (setCurrentProject) {
                  setTimeout(() => setCurrentProject('espcp_rework'), 400);
                }
              }}
              className={`relative overflow-hidden group font-mono text-xs md:text-sm tracking-widest transition-all duration-500 font-bold border-b-2 border-transparent hover:border-[#ff0066] text-[#ff0066] px-2`}
            >
              <span className="relative z-10">[ REWORK_MODULE ]</span>
              <div className="absolute inset-0 bg-[#ff0066] translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300 ease-in-out opacity-20"></div>
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-20 w-full h-[calc(100vh-68px)] flex pt-4 md:pt-16">
        {activeView === 'PRODUCTION' && (
          <ProductionView 
            monthlyData={monthlyData} 
            groupedMonths={groupedMonths}
            currentYear={currentYear}
            setCurrentYear={setCurrentYear}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
            chartType={chartType}
            setChartType={setChartType}
          />
        )}
        {activeView === 'ACE_GRID' && (
          <NexusGridView 
            agentData={agentData} 
            mayData={mayData}
            selectedAgentIdx={selectedAgentIdx}
            setSelectedAgentIdx={setSelectedAgentIdx}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        )}
        {activeView === 'SUMMARY_TABLE' && (
          <SummaryTableView monthlyData={monthlyData} groupedMonths={groupedMonths} />
        )}
        {activeView === 'MONTHLY_PERFORMANCES' && (
          <ESPCPMonthlyPerformers agentData={agentData} />
        )}
        {activeView === 'DAILY_PRODUCTION' && (
          <ESPCPDailyProduction mayData={mayData} />
        )}
      </div>
    </div>
  );
}

function parseCSVNum(v: any) {
  if (v === null || v === undefined) return 0;
  const s = String(v).replace(/[^0-9.\-]/g, '').trim();
  if (!s) return 0;
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function SummaryTableView({ monthlyData, groupedMonths }: any) {
  const yearlyTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    monthlyData.forEach((r: any) => {
      const y = r[0];
      if (!y) return;
      const t = r.slice(2, 33).reduce((a: number, b: string) => a + parseCSVNum(b), 0);
      totals[y] = (totals[y] || 0) + t;
    });
    return Object.entries(totals).sort((a, b) => b[0].localeCompare(a[0]));
  }, [monthlyData]);

  const monthTotals = useMemo(() => {
    const totals = monthlyData.map((r: any) => {
      const y = r[0];
      const m = r[1]?.trim();
      if (!y || !m) return null;
      const t = r.slice(2, 33).reduce((a: number, b: string) => a + parseCSVNum(b), 0);
      return { y, m, t };
    }).filter(Boolean);
    return totals;
  }, [monthlyData]);

  return (
    <div className="flex-1 p-4 md:p-10 overflow-y-auto mb-10 w-full space-y-8">
      <div className="max-w-7xl mx-auto w-full mb-8">
        <ApeiroLogo />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto h-[400px]">
        
        {/* Yearly Summary */}
        <div className="bg-[#000a14]/80 border border-[#00f2ff]/30 p-6 flex flex-col shadow-[0_0_30px_rgba(0,170,255,0.1)]">
          <h2 className="text-2xl font-bold font-['Rajdhani'] text-white mb-6 border-b border-[#00f2ff]/30 pb-2">YEARLY_SUMMARY</h2>
          <div className="overflow-y-auto flex-1 pr-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#00f2ff]/10">
                  <th className="p-4 text-[#00f2ff] font-['Rajdhani'] font-bold tracking-widest uppercase text-sm border-b border-[#00f2ff]/30">YEAR</th>
                  <th className="p-4 text-[#00f2ff] font-['Rajdhani'] font-bold tracking-widest uppercase text-sm border-b border-[#00f2ff]/30 text-right">TOTAL_VOLUME</th>
                </tr>
              </thead>
              <tbody>
                {yearlyTotals.map(([year, total]) => (
                  <tr key={year} className="border-b border-[#00f2ff]/10 hover:bg-[#00f2ff]/5 transition-colors">
                    <td className="p-4 text-white font-mono text-lg">{year}</td>
                    <td className="p-4 text-[#00f2ff] font-bold text-xl text-right">{total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Summary */}
        <div className="bg-[#000a14]/80 border border-[#00f2ff]/30 p-6 flex flex-col shadow-[0_0_30px_rgba(0,170,255,0.1)]">
          <h2 className="text-2xl font-bold font-['Rajdhani'] text-white mb-6 border-b border-[#00f2ff]/30 pb-2">MONTHLY_BREAKDOWN</h2>
          <div className="overflow-y-auto flex-1 pr-2">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#00f2ff]/10">
                  <th className="p-4 text-[#00f2ff] font-['Rajdhani'] font-bold tracking-widest uppercase text-sm border-b border-[#00f2ff]/30">PERIOD</th>
                  <th className="p-4 text-[#00f2ff] font-['Rajdhani'] font-bold tracking-widest uppercase text-sm border-b border-[#00f2ff]/30 text-right">VOLUME</th>
                </tr>
              </thead>
              <tbody>
                {monthTotals.map((record: any, i: number) => (
                  <tr key={i} className="border-b border-[#00f2ff]/10 hover:bg-[#00f2ff]/5 transition-colors">
                    <td className="p-4">
                      <div className="text-white font-['Rajdhani'] text-lg font-bold">{record.m}</div>
                      <div className="text-[#00f2ff]/60 font-mono text-xs">{record.y}</div>
                    </td>
                    <td className="p-4 text-[#00f2ff] font-bold text-xl text-right">{record.t.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
      </div>
    </div>
  );
}

function ProductionView({ monthlyData, groupedMonths, currentYear, setCurrentYear, currentMonth, setCurrentMonth, chartType, setChartType }: any) {
  const row = monthlyData.find((r: any) => r[0] === currentYear && r[1]?.trim() === currentMonth);
  const days = row ? row.slice(2, 33).map((v: string) => parseCSVNum(v)) : [];
  
  const allMonths = useMemo(() => {
    return monthlyData.map((r: any) => ({
      label: r[0] + " " + r[1],
      value: r.slice(2, 33).reduce((a: number, b: string) => a + parseCSVNum(b), 0)
    })).filter((m: any) => m.label.trim() !== "undefined");
  }, [monthlyData]);

  const dailyChartData = days.map((val: number, i: number) => ({ day: i + 1, value: val }));

  return (
    <div className="flex w-full h-full pb-16 px-4 md:px-0">
      {/* Sidebar for Months */}
      <div className="w-64 bg-[#0a0f19]/60 backdrop-blur-xl border-r border-[#00aaff]/30 p-4 overflow-y-auto hidden md:block mt-[-64px] pt-20">
        <button 
          onClick={() => setChartType(chartType === 'line' ? 'bar' : 'line')}
          className="w-full py-2 mb-6 bg-[#00aaff]/10 border border-[#00aaff] text-[#00aaff] font-mono tracking-wider hover:bg-[#00aaff]/30 transition-all shadow-[0_0_10px_rgba(0,170,255,0.2)]"
        >
          SWITCH_CHART
        </button>
        {Object.keys(groupedMonths).map(y => (
          <div key={y} className="mb-4">
            <h3 className="text-[#00aaff] font-bold font-mono tracking-widest text-lg mb-2">{y}</h3>
            <div className="space-y-2">
              {groupedMonths[y].map((m: string) => (
                <div 
                  key={m} 
                  onClick={() => { setCurrentYear(y); setCurrentMonth(m); }}
                  className={`p-2 border border-[#00aaff]/30 rounded cursor-pointer transition-all duration-300 font-['Rajdhani'] uppercase tracking-wider
                    ${currentYear === y && currentMonth === m 
                      ? 'bg-[#00aaff]/30 border-[#00aaff] shadow-[0_0_15px_rgba(0,170,255,0.4)] translate-x-2' 
                      : 'bg-white/5 hover:bg-white/10 hover:translate-x-1 hover:shadow-[0_0_10px_rgba(0,170,255,0.2)]'}`}
                >
                  {m}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex-1 p-2 md:p-6 overflow-y-auto mt-[-64px] pt-20">
        <div className="max-w-7xl mx-auto w-full mb-8">
          <ApeiroLogo />
        </div>
        <div className="grid gap-6">

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-[#0a1a2a]/80 backdrop-blur-lg border border-[#00aaff]/30 rounded-lg shadow-xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[#00aaff]/30 bg-[#050a10] flex justify-between items-center">
                <h3 className="text-[#00aaff] font-mono flex items-center gap-2"><Activity className="w-4 h-4" /> DAILY_TELEMETRY_GRID: {currentYear} {currentMonth}</h3>
                <div className="bg-[#00aaff] text-black font-bold px-3 py-1 rounded text-sm tracking-wider font-mono shadow-[0_0_10px_rgba(0,170,255,0.8)]">
                  TOTAL: {days.reduce((a, b) => a + b, 0).toLocaleString()}
                </div>
              </div>
              <div className="overflow-x-auto flex-1 bg-[#050a10]/50 p-2">
                <table className="w-full text-sm text-center">
                  <thead>
                    <tr className="border-b border-[#00aaff]/30">
                      {days.map((_: any, i: number) => (
                        <th key={i} className="p-2 text-[#00aaff] font-mono whitespace-nowrap min-w-[36px]">{i+1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {days.map((v: number, i: number) => (
                        <td key={i} className="p-2 font-semibold text-white border-r border-[#00aaff]/10 last:border-0">{v}</td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-[#00aaff]/30 rounded-lg shadow-xl overflow-hidden flex flex-col">
              <div className="p-4 border-b border-[#00aaff]/30 bg-[#050a10]">
                <h3 className="text-[#00aaff] font-mono flex items-center gap-2"><BarChart2 className="w-4 h-4" /> MONTHLY_TOTALS_SUMMARY</h3>
              </div>
              <div className="overflow-x-auto flex-1 max-h-[160px] custom-scrollbar bg-[#050a10]/50">
                <table className="w-full text-left border-collapse">
                  <thead className="sticky top-0 bg-[#050a10] border-b border-[#00aaff]/30 shadow-md">
                    <tr>
                      <th className="p-3 text-[#00aaff] font-['Rajdhani'] font-bold tracking-widest text-xs">CYCLE</th>
                      <th className="p-3 text-[#00aaff] font-['Rajdhani'] font-bold tracking-widest text-xs text-right">TOTAL OUTPUT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allMonths.map((m: any, i: number) => (
                      <tr key={i} className="border-b border-[#00aaff]/10 hover:bg-[#00aaff]/10 transition-colors">
                        <td className="p-2 px-3 text-slate-300 font-mono text-sm">{m.label.toUpperCase()}</td>
                        <td className="p-2 px-3 text-right"><b className="text-white">{m.value.toLocaleString()}</b></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-[#00aaff]/30 rounded-lg p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <h3 className="text-[#00aaff] font-mono mb-4 flex items-center gap-2"><Activity className="w-4 h-4" /> DAILY_TELEMETRY_CHART: {currentYear} {currentMonth}</h3>
            <div className="h-[250px] md:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'line' ? (
                  <LineChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#00aaff" strokeOpacity={0.1} />
                    <XAxis dataKey="day" stroke="#fff" tick={{fill: '#fff'}} />
                    <YAxis stroke="#fff" tick={{fill: '#fff'}} />
                    <RechartsTooltip contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #00aaff', color: '#fff'}} />
                    <Line type="monotone" dataKey="value" stroke="#00aaff" strokeWidth={3} dot={{ fill: '#00aaff', r: 4 }} activeDot={{ r: 8, fill: '#fff' }} />
                  </LineChart>
                ) : (
                  <BarChart data={dailyChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#00aaff" strokeOpacity={0.1} />
                    <XAxis dataKey="day" stroke="#fff" />
                    <YAxis stroke="#fff" />
                    <RechartsTooltip contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #00aaff', color: '#fff'}} />
                    <Bar dataKey="value" fill="rgba(0,170,255,0.5)" stroke="#00aaff" strokeWidth={1} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-lg border border-[#00aaff]/30 rounded-lg p-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
            <h3 className="text-[#00aaff] font-mono mb-4 flex items-center gap-2"><BarChart2 className="w-4 h-4" /> MONTHLY_AGGREGATES_CHART</h3>
            <div className="h-[250px] md:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={allMonths}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#00aaff" strokeOpacity={0.1} />
                  <XAxis dataKey="label" stroke="#fff" />
                  <YAxis stroke="#fff" />
                  <RechartsTooltip contentStyle={{backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid #00aaff', color: '#fff'}} />
                  <Bar dataKey="value" fill="rgba(0,170,255,0.5)" stroke="#00aaff" strokeWidth={1} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function NexusGridView({ agentData, mayData, selectedAgentIdx, setSelectedAgentIdx, sidebarOpen, setSidebarOpen }: any) {
  const agent = agentData[selectedAgentIdx];
  const [sortMonthsDescending, setSortMonthsDescending] = useState(false);
  if (!agent) return null;

  let keys = Object.keys(agent).filter(k => k.match(/2025|2026/)).slice(0, 13);
  if (sortMonthsDescending) {
    keys = [...keys].reverse();
  }
  const labels: string[] = [];
  const values: number[] = [];
  let peak = {v: -1, n: ''};
  let low = {v: 999, n: ''};

  keys.forEach(k => {
    const v = parseCSVNum(agent[k]);
    const cleanLabel = k.split(' - ')[0].toUpperCase();
    labels.push(cleanLabel);
    values.push(v);
    if (v > peak.v) peak = {v, n: cleanLabel};
    if (v < low.v && v > 0) low = {v, n: cleanLabel};
  });

  const chartData = labels.map((l, i) => ({ label: l, value: values[i] }));

  return (
    <div className="flex w-full h-[calc(100vh-68px)] overflow-hidden mt-[-64px] absolute inset-0 pt-[68px]">
      <aside className={`absolute md:relative z-40 h-full w-[360px] bg-[#000a14]/80 backdrop-blur-xl border-r-2 border-[#00f2ff] p-8 shadow-[10px_0_50px_rgba(0,0,0,0.9)] transition-transform duration-500 flex flex-col ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-10 top-4 w-10 h-14 bg-[#00f2ff] text-black font-['Rajdhani'] font-bold flex items-center justify-center md:hidden"
          style={{clipPath: 'polygon(0 0, 100% 20%, 100% 80%, 0 100%)'}}
        >
          {sidebarOpen ? <X/> : <Menu/>}
        </button>
        <h1 className="text-3xl tracking-widest font-['Rajdhani'] font-bold text-white drop-shadow-[0_0_8px_rgba(0,242,255,0.7)] m-0">ESPCP_OS</h1>
        <p className="text-[#0066ff] text-xs font-bold mb-10 tracking-widest">PERFORMANCE_GRID_V5</p>

        <div className="mb-10">
          <label className="text-xs text-[#0066ff] block mb-3 font-['Rajdhani'] uppercase font-bold tracking-widest">IDENT_SELECTOR</label>
          <div className="relative">
            <select 
              className="w-full bg-black border border-[#00f2ff]/30 text-white p-3 font-mono outline-none font-bold text-sm appearance-none focus:border-[#00f2ff]"
              value={selectedAgentIdx}
              onChange={(e) => setSelectedAgentIdx(Number(e.target.value))}
            >
              {agentData.map((row: any, i: number) => row['ID'] && (
                <option key={i} value={i}>{row['ID']} | {row['Agent Name']}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#00f2ff]">▼</div>
          </div>
        </div>

        <div className="mt-auto border-2 border-[#00f2ff] bg-[#00f2ff]/5 p-5 text-center transition-all hover:bg-[#00f2ff]/10 group">
          <span className="text-[10px] tracking-widest text-[#0066ff] block mb-2 font-bold font-['Rajdhani'] group-hover:text-[#00f2ff]">SESSION_GRAND_TOTAL</span>
          <b className="text-4xl text-white drop-shadow-[0_0_8px_rgba(0,242,255,0.7)] font-['Rajdhani']">{agent['TOTAL'] || 0}</b>
        </div>
        
        <div className="text-[10px] text-[#0066ff] mt-4 font-mono font-bold tracking-widest">NODE_STABLE: 127.0.0.1</div>
      </aside>

      <main className="flex-1 p-4 md:p-10 overflow-y-auto bg-black/40">
        <div className="max-w-7xl mx-auto w-full mb-8">
          <ApeiroLogo />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 mb-8">
          <div className="bg-[#00f2ff]/5 border border-[#00f2ff]/30 p-5 text-center font-['Rajdhani'] transition-all hover:border-[#00f2ff] hover:bg-[#00f2ff]/10">
            <span className="text-xs tracking-widest text-[#0066ff] block mb-2 font-bold uppercase">PEAK_PRODUCTION</span>
            <b className="text-2xl text-white">{peak.v === -1 ? '0' : `${peak.v} (${peak.n})`}</b>
          </div>
          <div className="bg-[#00f2ff]/5 border border-[#00f2ff]/30 p-5 text-center font-['Rajdhani'] transition-all hover:border-[#00f2ff] hover:bg-[#00f2ff]/10">
            <span className="text-xs tracking-widest text-[#0066ff] block mb-2 font-bold uppercase">MIN_PRODUCTION</span>
            <b className="text-2xl text-white">{low.v === 999 ? '0' : `${low.v} (${low.n})`}</b>
          </div>
          <div className="bg-[#00f2ff]/5 border border-[#00f2ff]/30 p-5 text-center font-['Rajdhani'] transition-all hover:border-[#00f2ff] hover:bg-[#00f2ff]/10">
            <span className="text-xs tracking-widest text-[#0066ff] block mb-2 font-bold uppercase">TOTAL_UNITS (P)</span>
            <b className="text-2xl text-white">{agent['TOTAL'] || 0}</b>
          </div>
          <div className="bg-[#00f2ff]/5 border border-[#00f2ff]/30 p-5 text-center font-['Rajdhani'] transition-all hover:border-[#00f2ff] hover:bg-[#00f2ff]/10">
            <span className="text-xs tracking-widest text-[#0066ff] block mb-2 font-bold uppercase">AVG_EFFICIENCY (Q)</span>
            <b className="text-2xl text-white">{agent['AVERAGE'] || 0}</b>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-8 mb-8">
          <div className="bg-[#000a14]/80 border border-[#00f2ff]/30 p-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 242, 255, 0.05)" />
                <XAxis dataKey="label" stroke="#00f2ff" tick={{fill: '#00f2ff', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#0066ff" tick={{fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{fill: 'rgba(0,242,255,0.05)'}} contentStyle={{backgroundColor: '#000', borderColor: '#00f2ff'}} />
                <Bar dataKey="value" fill="#0066ff" stroke="#00f2ff" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-[#000a14]/80 border border-[#00f2ff]/30 p-6 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0, 242, 255, 0.05)" />
                <XAxis dataKey="label" stroke="#00f2ff" tick={{fill: '#00f2ff', fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#0066ff" tick={{fontWeight: 'bold'}} axisLine={false} tickLine={false} />
                <RechartsTooltip contentStyle={{backgroundColor: '#000', borderColor: '#00f2ff'}} />
                <Line type="monotone" dataKey="value" stroke="#00f2ff" strokeWidth={3} dot={{r: 6, fill: '#fff'}} fill="rgba(0, 242, 255, 0.1)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#000a14]/80 border border-[#00f2ff]/30 rounded-sm shadow-[0_0_20px_rgba(0,0,0,0.5)]">
          <div className="p-4 border-b border-[#00f2ff]/20 flex justify-between items-center bg-[#00f2ff]/5 flex-wrap gap-2">
            <h3 className="text-[#00f2ff] font-['Rajdhani'] font-bold tracking-widest text-lg m-0 flex items-center gap-2">
              MONTHLY_DATA_CYCLES
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => setSortMonthsDescending(!sortMonthsDescending)}
                className="text-[#00f2ff] font-mono text-xs border border-[#00f2ff]/30 px-3 py-1 hover:bg-[#00f2ff]/10"
              >
                [ SORT: {sortMonthsDescending ? 'DESCENDING' : 'ASCENDING'} ]
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#00f2ff]/5 border-b border-[#00f2ff]/20">
                  <th className="p-5 text-[#00f2ff] font-['Rajdhani'] font-bold tracking-widest uppercase text-sm">DATA_CYCLE</th>
                  <th className="p-5 text-[#00f2ff] font-['Rajdhani'] font-bold tracking-widest uppercase text-sm">UNIT_METRIC</th>
                  <th className="p-5 text-[#00f2ff] font-['Rajdhani'] font-bold tracking-widest uppercase text-sm">INTEGRITY_STATUS</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k, i) => {
                  const v = parseCSVNum(agent[k]);
                  const isStable = v >= 10;
                  return (
                    <tr key={i} className="border-b border-[#00f2ff]/10 hover:bg-[#00f2ff]/5 transition-colors">
                      <td className="p-4 px-5 text-slate-300 font-mono text-sm">{k.toUpperCase()}</td>
                      <td className="p-4 px-5"><b className="text-white text-lg">{v}</b></td>
                      <td className="p-4 px-5">
                        <span className={`font-bold font-mono text-sm tracking-wider ${isStable ? 'text-[#00f2ff]' : 'text-[#ff0055]'}`}>
                          {isStable ? '[ STABLE ]' : '[ CRITICAL ]'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
