import { useState, useEffect } from 'react';
import Papa from 'papaparse';

const CSV_MONTHLY = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRS-TPp-hkTBWJUds4OzF-N2glCpDhLgY52bYEx9DTmJZz5VqCFbPeRCrnVT0bF4AUHZgMIgOPKeqkh/pub?gid=1519807812&single=true&output=csv';
const CSV_AGENTS = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRS-TPp-hkTBWJUds4OzF-N2glCpDhLgY52bYEx9DTmJZz5VqCFbPeRCrnVT0bF4AUHZgMIgOPKeqkh/pub?gid=190722182&single=true&output=csv';
const CSV_MAY = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRS-TPp-hkTBWJUds4OzF-N2glCpDhLgY52bYEx9DTmJZz5VqCFbPeRCrnVT0bF4AUHZgMIgOPKeqkh/pub?gid=1698387077&single=true&output=csv';

export function useESPCPData() {
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [agentData, setAgentData] = useState<any[]>([]);
  const [mayData, setMayData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [monthlyRes, agentRes, mayRes] = await Promise.all([
          fetch(CSV_MONTHLY),
          fetch(CSV_AGENTS),
          fetch(CSV_MAY)
        ]);
        
        const monthlyText = await monthlyRes.text();
        const agentText = await agentRes.text();
        const mayText = await mayRes.text();

        // Monthly data doesn't have headers in the original HTML, it relies on indexes (0: Year, 1: Month, 2-33: days)
        const monthlyParsed = Papa.parse(monthlyText, { header: false, skipEmptyLines: true });
        const filteredMonthlyData = (monthlyParsed.data as any[]).filter(r => String(r[0]).trim().toLowerCase() !== 'year');
        // Agent data has headers
        const agentParsed = Papa.parse(agentText, { header: true, skipEmptyLines: true });
        // May data without headers to easily process array style
        const mayParsed = Papa.parse(mayText, { header: false, skipEmptyLines: true });

        setMonthlyData(filteredMonthlyData);
        setAgentData(agentParsed.data as any[]);
        setMayData(mayParsed.data as any[]);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch ESPCP data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { monthlyData, agentData, mayData, loading, error };
}
