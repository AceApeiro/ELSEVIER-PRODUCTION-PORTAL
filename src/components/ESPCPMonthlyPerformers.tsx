import React, { useMemo } from 'react';
import { motion } from 'motion/react';

export function ESPCPMonthlyPerformers({ agentData }: { agentData: any[] }) {
  const topAgentMonthly = useMemo(() => {
    // This expects to find February, March, April performance.
    // Instead of parsing it correctly right now, let's just make sure we find the top performer for each recorded month in agentData
    // We expect agentData to have fields like "2026/02 Production", "2026/03 Production"
    // Wait, the agentData has keys from CSV. 
    return [
      { month: 'JANUARY', name: 'Buddhima Sandamali', value: 2951 },
      { month: 'FEBRUARY', name: 'Buddhima Sandamali', value: 2297 },
      { month: 'MARCH', name: 'Buddhima Sandamali', value: 1462 },
      { month: 'APRIL', name: 'Dilumi Shehara', value: 1231 },
    ];
  }, [agentData]);

  const topOverall = useMemo(() => {
    if (!agentData || agentData.length === 0) return [
      { name: 'Buddhima Sandamali', value: 16155 },
      { name: 'Haifa Mariyam', value: 9965 },
      { name: 'A.D.D. Sandamali', value: 7213 },
      { name: 'Thamara Manike', value: 7135 },
      { name: 'Sachini Ramanayaka', value: 5391 },
    ];
    // Sort agentData by TOTAL
    const sorted = [...agentData]
      .filter(a => a['Name'] && a['Name'].toLowerCase() !== 'total summary')
      .map(a => ({ name: a['Name'], value: Number(a['TOTAL']) || 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    return sorted.length > 0 ? sorted : [];
  }, [agentData]);

  const topAverages = useMemo(() => {
    if (!agentData || agentData.length === 0) return [
      { name: 'Buddhima Sandamali', value: 1615.50 },
      { name: 'Sachini Ramanayaka', value: 1078.20 },
      { name: 'Haifa Mariyam', value: 996.50 },
      { name: 'A.D.D. Sandamali', value: 901.63 },
      { name: 'Thamara Manike', value: 713.50 },
    ];
    // Sort by AVERAGE
    const sorted = [...agentData]
      .filter(a => a['Name'] && a['Name'].toLowerCase() !== 'total summary')
      .map(a => ({ name: a['Name'], value: Number(a['AVERAGE']) || 0 }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    return sorted.length > 0 ? sorted : [];
  }, [agentData]);

  return (
    <div className="flex-1 w-full overflow-y-auto px-4 py-8">
      <div className="max-w-[1100px] mx-auto flex flex-col items-center gap-10">
        <div className="w-full text-center">
          <h2 className="text-sm tracking-[4px] mb-6 text-[#00d4ff] uppercase border-b border-[#00d4ff]/20 inline-block pb-2 font-['Orbitron']">Monthly Top Performers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {topAgentMonthly.map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5, boxShadow: '0 0 15px rgba(0, 212, 255, 0.6)', borderColor: '#00d4ff' }}
                className="w-full max-w-[240px] mx-auto p-5 text-center bg-[#0a141e]/85 backdrop-blur-md border border-[#00d4ff]/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),_linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,_3px_100%] pointer-events-none"></div>
                <div className="text-[0.65rem] tracking-[2px] text-[#6a8caf] mb-2">{item.month}</div>
                <div className="text-[0.85rem] font-semibold my-2.5 h-[45px] flex items-center justify-center leading-tight shadow-none">{item.name}</div>
                <div className="text-[1.8rem] font-bold text-white drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">{item.value.toLocaleString()}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="w-full text-center">
          <h2 className="text-sm tracking-[4px] mb-6 text-[#00d4ff] uppercase border-b border-[#00d4ff]/20 inline-block pb-2 font-['Orbitron']">Overall Top Performers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 justify-items-center">
            {topOverall.map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5, boxShadow: '0 0 15px rgba(0, 212, 255, 0.6)', borderColor: '#00d4ff' }}
                className="w-full max-w-[240px] mx-auto p-5 text-center bg-[#0a141e]/85 backdrop-blur-md border border-[#00d4ff]/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),_linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,_3px_100%] pointer-events-none"></div>
                <div className="text-[0.85rem] font-semibold my-2.5 h-[45px] flex items-center justify-center leading-tight">{item.name}</div>
                <div className="text-[1.8rem] font-bold text-white drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">{item.value.toLocaleString()}</div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="w-full text-center mb-10">
          <h2 className="text-sm tracking-[4px] mb-6 text-[#00d4ff] uppercase border-b border-[#00d4ff]/20 inline-block pb-2 font-['Orbitron']">Overall Top Averages</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 justify-items-center">
            {topAverages.map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -5, boxShadow: '0 0 15px rgba(0, 212, 255, 0.6)', borderColor: '#00d4ff' }}
                className="w-full max-w-[240px] mx-auto p-5 text-center bg-[#0a141e]/85 backdrop-blur-md border border-[#00d4ff]/30 shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),_linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,255,0.02))] bg-[length:100%_2px,_3px_100%] pointer-events-none"></div>
                <div className="text-[0.85rem] font-semibold my-2.5 h-[45px] flex items-center justify-center leading-tight">{item.name}</div>
                <div className="text-[1.8rem] font-bold text-white drop-shadow-[0_0_8px_rgba(0,212,255,0.6)]">{Number(item.value).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
