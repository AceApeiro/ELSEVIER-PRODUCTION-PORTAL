import React, { useMemo, useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import html2canvas from 'html2canvas';

function parseNum(v: any) {
  if (v === null || v === undefined) return 0;
  const s = String(v).replace(/[^0-9.\-]/g, '').trim();
  if (!s) return 0;
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

function fmt(n: number) {
  return (Math.round((Number(n) || 0) * 100) / 100).toLocaleString();
}

function getColorForValue(val: number) {
  if (val === 0) return '#9aa6b2';
  if (val >= 25) return '#2dd36f';
  return '#ff3860';
}

function getColorClass(val: number) {
  if (val === 0) return 'text-[#9aa6b2]';
  if (val >= 25) return 'text-[#2dd36f]';
  return 'text-[#ff3860]';
}

export function ESPCPDailyProduction({ mayData }: { mayData: any[] }) {
  const [chartType, setChartType] = useState<"bar" | "line">("bar");
  const [showInactive, setShowInactive] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>("__all__");
  const [sortDatesDesc, setSortDatesDesc] = useState(true);

  const downloadSnip = async (daysCount: number) => {
    let headersToUse = [...tableHeaders];
    if (sortDatesDesc) {
       headersToUse = headersToUse.slice(0, daysCount);
    } else {
       headersToUse = headersToUse.slice(-daysCount);
    }

    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-10000px';
    container.style.top = '0px';
    container.style.width = '1200px';
    container.style.backgroundColor = '#03040a';
    container.style.color = '#fff';
    container.style.padding = '20px';
    container.style.fontFamily = 'monospace';
    
    const tableHtml = `
      <h2 style="color:#00aaff; font-size: 24px; text-align: center; margin-bottom: 20px;">Agents Production (${daysCount}-Day Snip)</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left; white-space: nowrap;">
        <thead style="background: rgba(0,0,0,0.5);">
          <tr>
            <th style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); color: #e0f7ff;">UID</th>
            <th style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); color: #e0f7ff;">Name</th>
            <th style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); color: #e0f7ff;">Total</th>
            ${headersToUse.map(d => `<th style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); color: #e0f7ff;">${d}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${filteredAgents.map((a: any) => `
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.05);">${a.uid}</td>
              <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.05);">${a.name}</td>
              <td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); font-weight: bold; color: white;">${fmt(a.total)}</td>
              ${headersToUse.map(d => {
                const val = a.days[d] || 0;
                const color = val === 0 ? '#9aa6b2' : val >= 25 ? '#2dd36f' : '#ff3860';
                return `<td style="padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.05); color: ${color};">${fmt(val)}</td>`;
              }).join('')}
            </tr>
          `).join('')}
        </tbody>
        <tfoot style="background: linear-gradient(90deg, rgba(255,165,0,0.25), rgba(255,215,0,0.15));">
          <tr>
            <td style="padding: 8px; border-top: 2px solid #ffa500; color: #ffd700; font-weight: bold;">⚡</td>
            <td style="padding: 8px; border-top: 2px solid #ffa500; color: #ffd700; font-weight: bold;">DAILY TOTALS</td>
            <td style="padding: 8px; border-top: 2px solid #ffa500; font-weight: bold; color: #ffd700;">${fmt(Object.values(calculatedDailyTotals).reduce((s: any, v: any) => s + v, 0))}</td>
            ${headersToUse.map(d => `<td style="padding: 8px; border-top: 2px solid #ffa500; font-weight: bold; color: white;">${fmt(calculatedDailyTotals[d] || 0)}</td>`).join('')}
          </tr>
        </tfoot>
      </table>
    `;

    container.innerHTML = tableHtml;
    document.body.appendChild(container);

    try {
      const canvas = await html2canvas(container, { backgroundColor: '#03040a', scale: 2 });
      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `production_snip_${daysCount}days.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
    } finally {
      document.body.removeChild(container);
    }
  };

  const { agentObjects, inactiveObjects, calculatedDailyTotals, dayNumbers, summaryData } = useMemo(() => {
    if (!mayData || mayData.length < 2) {
      return { agentObjects: [], inactiveObjects: [], calculatedDailyTotals: {}, dayNumbers: [], summaryData: {} };
    }

    const headersRow = mayData[0].map((h: any) => String(h || '').trim());
    const dColIdxs: number[] = [];
    const dNumbers: number[] = [];
    headersRow.forEach((h: string, idx: number) => {
      if (/^\d{1,2}$/.test(h.trim())) {
        dColIdxs.push(idx);
        dNumbers.push(parseInt(h.trim(), 10));
      }
    });

    const activeRows = mayData.slice(1, 48).map((r: any) => r || []);
    const inactiveRows = mayData.slice(48, 65).map((r: any) => r || []);

    const buildAgents = (rows: any[]) => {
      return rows.map((arr: any) => {
        const uid = (arr[0] || '').toString().trim();
        const name = (arr[1] || '').toString().trim();
        if (String(name).toLowerCase().includes('total')) return null;
        if (!uid && !name) return null;

        const days: Record<string, number> = {};
        dColIdxs.forEach((colIdx, i) => {
          const dayNum = dNumbers[i];
          days[dayNum] = parseNum(arr[colIdx]);
        });
        const total = Object.values(days).reduce((s, v) => s + v, 0);
        return { uid, name, days, total };
      }).filter(a => a !== null).sort((a: any, b: any) => b.total - a.total);
    };

    const agents = buildAgents(activeRows);
    const inactives = buildAgents(inactiveRows);

    const calcDaily: Record<string, number> = {};
    dNumbers.forEach(dayNum => {
      let daySum = 0;
      agents.forEach((agent: any) => {
        daySum += (agent.days[dayNum] || 0);
      });
      calcDaily[dayNum] = daySum;
    });

    const vals = Object.values(calcDaily);
    const sum = vals.reduce((s, v) => s + v, 0);
    const nonZero = vals.filter(v => v > 0);
    const avg = nonZero.length ? sum / nonZero.length : 0;

    return {
      agentObjects: agents,
      inactiveObjects: inactives,
      calculatedDailyTotals: calcDaily,
      dayNumbers: dNumbers,
      summaryData: {
        totalMonthly: sum,
        highestDay: vals.length ? Math.max(...vals) : 0,
        avgDay: avg,
        activeAgentsCount: agents.length
      }
    };
  }, [mayData]);

  // Determine last 5 days
  const last5Days = useMemo(() => {
    const today = new Date();
    // Use the max header as bound
    const maxHeader = dayNumbers.length ? Math.max(...dayNumbers) : 30;
    // Assume yesterday or max header
    let lastDayToShow = Math.min(today.getDate() - 1, maxHeader);
    if (lastDayToShow < 1) lastDayToShow = 1;

    const daysToShow = [];
    for (let i = 0; i < 5; i++) {
        const day = lastDayToShow - i;
        if (day < 1) break;
        const val = calculatedDailyTotals[day] || 0;
        daysToShow.push({ day, val });
    }
    return daysToShow;
  }, [calculatedDailyTotals, dayNumbers]);

  const filteredAgents = useMemo(() => {
    if (selectedAgent === '__all__') return agentObjects;
    return agentObjects.filter((a: any) => a.uid === selectedAgent || a.name === selectedAgent);
  }, [agentObjects, selectedAgent]);


  const chartData = useMemo(() => {
    const labels = [...dayNumbers].sort((a,b) => a - b);
    return labels.map(day => {
      const point: any = { name: day.toString() };
      if (selectedAgent === '__all__') {
        point.total = calculatedDailyTotals[day] || 0;
      } else {
        const agent = agentObjects.find((a: any) => a.uid === selectedAgent || a.name === selectedAgent);
        point.total = agent ? (agent.days[day] || 0) : 0;
        point.teamTotal = calculatedDailyTotals[day] || 0; // Reference 
      }
      return point;
    });
  }, [dayNumbers, calculatedDailyTotals, selectedAgent, agentObjects]);

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const maxHeader = dayNumbers.length ? Math.max(...dayNumbers) : 30;
  let lastDayToShow = Math.min(yesterday.getDate(), maxHeader);
  if (lastDayToShow < 1) lastDayToShow = 1;
  const tableHeaders = [];
  if (sortDatesDesc) {
    for (let d = lastDayToShow; d >= 1; d--) tableHeaders.push(d);
  } else {
    for (let d = 1; d <= lastDayToShow; d++) tableHeaders.push(d);
  }

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 py-8 bg-[#03040a]">
      <div className="max-w-[1200px] mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-[#00aaff] text-center mb-6">Agents Production — May</h2>

        <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] border border-white/5 rounded-xl p-4 flex flex-wrap gap-3 items-center z-10 relative">
          <select 
            className="bg-[#0f172a] text-white border border-[#1e293b] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#00aaff]"
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
          >
            <option value="__all__">All Agents</option>
            {agentObjects.map((a: any, i: number) => (
              <option key={i} value={a.uid || a.name}>{a.uid ? `${a.uid} - ` : ''}{a.name}</option>
            ))}
          </select>
          <button 
            onClick={() => setShowInactive(!showInactive)}
            className="bg-transparent border border-white/10 text-[#00aaff] rounded-lg px-4 py-2 text-sm tracking-wider hover:bg-white/5"
          >
            {showInactive ? 'Hide Inactive' : 'Inactive Agents'}
          </button>
          <button 
            onClick={() => setChartType(prev => prev === 'bar' ? 'line' : 'bar')}
            className="bg-transparent border border-white/10 text-white rounded-lg px-4 py-2 text-sm tracking-wider hover:bg-white/5 ml-auto cursor-pointer"
          >
            Switch to {chartType === 'bar' ? 'Line' : 'Bar'} Chart
          </button>
          <div className="flex gap-2">
            <button onClick={() => downloadSnip(30)} className="bg-[#00aaff] text-black font-bold rounded-lg px-4 py-2 text-sm hover:brightness-110 shadow-[0_0_10px_rgba(0,170,255,0.4)] cursor-pointer">
              30-DAY SNIP
            </button>
             <button onClick={() => downloadSnip(7)} className="bg-[#00aaff] text-black font-bold rounded-lg px-4 py-2 text-sm hover:brightness-110 shadow-[0_0_10px_rgba(0,170,255,0.4)] cursor-pointer">
              7-DAY SNIP
            </button>
          </div>
        </div>

        {/* Chart Card */}
        <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] border border-white/5 rounded-xl p-4 flex flex-col items-center">
          <div className="w-full h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#00aaff" tick={{ fill: '#e0f7ff', fontSize: 11 }} />
                  <YAxis stroke="#00aaff" tick={{ fill: '#e0f7ff', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(7,18,41,0.95)', borderColor: 'rgba(0,170,255,0.3)' }}
                    itemStyle={{ color: '#00aaff' }}
                    formatter={(value: any) => [fmt(value), 'Production']}
                  />
                  <Line type="monotone" dataKey="total" stroke="#ffa500" strokeWidth={3} dot={{ r: 4, fill: '#ffa500' }} activeDot={{ r: 6 }} />
                  {selectedAgent !== '__all__' && (
                    <Line type="monotone" dataKey="teamTotal" stroke="rgba(255,255,255,0.2)" strokeWidth={2} dot={false} strokeDasharray="5 5" />
                  )}
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#00aaff" tick={{ fill: '#e0f7ff', fontSize: 11 }} />
                  <YAxis stroke="#00aaff" tick={{ fill: '#e0f7ff', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(7,18,41,0.95)', borderColor: 'rgba(0,170,255,0.3)' }}
                    itemStyle={{ color: '#00aaff' }}
                    cursor={{ fill: 'rgba(255,255,255,0.1)' }}
                  />
                  <Bar dataKey="total" fill="#00aaff" radius={[4, 4, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] border border-white/5 rounded-xl p-4 text-center">
            <div className="text-xs text-[#9aa6b2]">Total Monthly Production</div>
            <div className="text-xl font-bold text-[#ffa500] mt-1">{fmt(summaryData.totalMonthly || 0)}</div>
          </div>
          <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] border border-white/5 rounded-xl p-4 text-center">
            <div className="text-xs text-[#9aa6b2]">Highest Production Day</div>
            <div className="text-xl font-bold text-[#2dd36f] mt-1">{fmt(summaryData.highestDay || 0)}</div>
          </div>
          <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] border border-white/5 rounded-xl p-4 text-center">
            <div className="text-xs text-[#9aa6b2]">Average Daily Production</div>
            <div className="text-xl font-bold text-[#00aaff] mt-1">{fmt(summaryData.avgDay || 0)}</div>
          </div>
          <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] border border-white/5 rounded-xl p-4 text-center">
            <div className="text-xs text-[#9aa6b2]">Active Agents</div>
            <div className="text-xl font-bold text-[#9aa6b2] mt-1">{summaryData.activeAgentsCount || 0}</div>
          </div>
        </div>

        {/* Last 5 Days */}
        <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] border border-white/5 rounded-xl p-4">
          <div className="text-[#00aaff] font-bold mb-4">📊 Daily Totals — Last 5 Days (Sum of All Agents)</div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {last5Days.map((d: any, idx: number) => {
              const color = getColorClass(d.val);
              const icon = d.val === 0 ? '⚪' : (d.val >= 25 ? '🟢' : '🔴');
              return (
                <div key={idx} className="bg-white/5 border-l-4 border-[#00aaff] p-3 rounded-r-lg flex flex-col justify-center items-center">
                   <div className="font-semibold text-sm mb-1">{icon} May {d.day}</div>
                   <div className={`text-xl font-bold ${color}`}>{fmt(d.val)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] border border-white/5 rounded-xl p-4 overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs text-[#9aa6b2]">Active Agents - Sorted by Total</div>
            <button 
              onClick={() => setSortDatesDesc(!sortDatesDesc)}
              className="text-[#00aaff] text-xs font-mono border border-[#00aaff]/30 px-3 py-1 rounded bg-[#00aaff]/10 hover:bg-[#00aaff]/20 cursor-pointer"
            >
              [ REVERSE DATES: {sortDatesDesc ? '31 → 1' : '1 → 31'} ]
            </button>
          </div>
          <div className="overflow-x-auto max-h-[500px]">
            <table className="w-full border-collapse text-sm whitespace-nowrap">
              <thead className="bg-black/50 sticky top-0 z-20">
                <tr>
                  <th className="p-2 text-left border-b border-white/5 text-[#e0f7ff]">UID</th>
                  <th className="p-2 text-left border-b border-white/5 text-[#e0f7ff]">Name</th>
                  <th className="p-2 text-left border-b border-white/5 text-[#e0f7ff]">Total</th>
                  {tableHeaders.map(d => (
                    <th key={d} className="p-2 text-left border-b border-white/5 text-[#e0f7ff]">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredAgents.map((a: any, i: number) => (
                  <tr key={i} className="hover:bg-white/5">
                    <td className="p-2 border-b border-white/5">{a.uid}</td>
                    <td className="p-2 border-b border-white/5">{a.name}</td>
                    <td className="p-2 border-b border-white/5 font-bold text-white">{fmt(a.total)}</td>
                    {tableHeaders.map(d => {
                      const val = a.days[d] || 0;
                      return <td key={d} className={`p-2 border-b border-white/5 ${getColorClass(val)}`}>{fmt(val)}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot className="sticky bottom-0 z-20 bg-[linear-gradient(90deg,rgba(255,165,0,0.25),rgba(255,215,0,0.15))]">
                <tr>
                  <td className="p-2 border-t-2 border-[#ffa500] text-[#ffd700] font-bold">⚡</td>
                  <td className="p-2 border-t-2 border-[#ffa500] text-[#ffd700] font-bold">DAILY TOTALS</td>
                  <td className="p-2 border-t-2 border-[#ffa500] text-[#ffd700] font-bold">
                    {fmt(Object.values(calculatedDailyTotals).reduce((s: any, v: any) => s + v, 0))}
                  </td>
                  {tableHeaders.map(d => {
                    const val = calculatedDailyTotals[d] || 0;
                    return <td key={d} className={`p-2 border-t-2 border-[#ffa500] font-bold text-white`}>{fmt(val)}</td>;
                  })}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {showInactive && (
          <div className="bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(255,255,255,0.01))] border border-white/5 rounded-xl p-4 overflow-hidden mt-6">
            <div className="text-sm text-[#00aaff] font-bold mb-3">Inactive Agents</div>
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full border-collapse text-sm whitespace-nowrap">
                <thead className="bg-black/50 sticky top-0 z-20">
                  <tr>
                    <th className="p-2 text-left border-b border-white/5 text-[#e0f7ff]">UID</th>
                    <th className="p-2 text-left border-b border-white/5 text-[#e0f7ff]">Name</th>
                    <th className="p-2 text-left border-b border-white/5 text-[#e0f7ff]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {inactiveObjects.map((a: any, i: number) => (
                    <tr key={i} className="hover:bg-white/5">
                      <td className="p-2 border-b border-white/5">{a.uid}</td>
                      <td className="p-2 border-b border-white/5">{a.name}</td>
                      <td className="p-2 border-b border-white/5 font-bold text-white">{fmt(a.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
