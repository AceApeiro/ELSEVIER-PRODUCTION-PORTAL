import React, { useState, useEffect } from 'react';
import { ApeiroLogo } from './components/ApeiroLogo';
import { Database } from 'lucide-react';
import Papa from 'papaparse';

export default function ESPCPRework({ setCurrentProject }: { setCurrentProject: (project: string | null) => void }) {

  const [reworkData, setReworkData] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    fetch('https://docs.google.com/spreadsheets/d/e/2PACX-1vRS-TPp-hkTBWJUds4OzF-N2glCpDhLgY52bYEx9DTmJZz5VqCFbPeRCrnVT0bF4AUHZgMIgOPKeqkh/pub?gid=8119884&single=true&output=csv')
      .then(res => res.text())
      .then(csv => {
        const parsed = Papa.parse(csv, {
          header: true,
          skipEmptyLines: true
        });

        setReworkData(parsed.data as any[]);
        setDataLoading(false);
      })
      .catch(err => {
        console.error(err);
        setDataLoading(false);
      });

  }, []);

  return (
    <div className="relative w-full min-h-screen bg-black flex flex-col items-center">

      <div className="w-full flex justify-between items-center px-8 py-4 bg-[#050a10] border-b-2 border-[#00f2ff]/50 shadow-[0_0_30px_rgba(0,242,255,0.3)] z-50">

        <ApeiroLogo />

        <button
          onClick={() => setCurrentProject(null)}
          className="flex items-center gap-2 bg-black/80 text-white border border-[#333] rounded-md px-4 py-2 hover:bg-white/10 transition-all font-mono text-sm"
        >
          ⏏ HUB
        </button>

      </div>

      <div className="flex-1 w-full relative">

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.1),black)] pointer-events-none z-0"></div>

        <div className="z-10 relative flex flex-col items-center p-8 w-full max-w-6xl mx-auto mt-10">

          <div className="bg-[#050a10] border border-[#00f2ff]/50 p-6 rounded-lg w-full mb-8 shadow-[0_0_20px_rgba(0,242,255,0.2)]">

            <h2 className="text-2xl font-bold font-['Rajdhani'] text-[#00f2ff] tracking-widest">
              ACE REWORK DASHBOARD
            </h2>

            <p className="text-slate-400 font-mono text-xs mt-1">
              SHEET SYNC ACTIVE
            </p>

          </div>

          <div className="w-full bg-[#050a10]/80 border border-[#222] rounded-lg p-6 min-h-[400px]">

            {dataLoading ? (

              <div className="flex justify-center items-center h-full">
                <div className="animate-pulse text-[#00f2ff] font-mono">
                  <Database className="inline h-4 w-4 mr-2" />
                  DATA SYNC IN PROGRESS...
                </div>
              </div>

            ) : reworkData && reworkData.length > 0 ? (

              <div className="overflow-x-auto w-full custom-scrollbar">

                <table className="w-full text-left border-collapse text-sm">

                  <thead className="bg-[#0a0f1c] border-b border-[#00f2ff]/30">
                    <tr>
                      {Object.keys(reworkData[0]).map(k => (
                        <th key={k} className="p-3 text-[#00f2ff] font-mono tracking-widest whitespace-nowrap">
                          {k}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {reworkData.map((row, i) => (
                      <tr
                        key={i}
                        className="border-b border-[#00f2ff]/10 hover:bg-[#00f2ff]/10 transition-colors"
                      >
                        {Object.values(row).map((val: any, j) => (
                          <td
                            key={j}
                            className="p-3 text-slate-300 font-mono whitespace-nowrap"
                          >
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>

                </table>

              </div>

            ) : (

              <div className="flex justify-center items-center h-full flex-col text-slate-500 font-mono">

                <Database className="w-8 h-8 mb-4 opacity-50" />

                <p>NO DATA FOUND IN SHEET</p>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>
  );
}
