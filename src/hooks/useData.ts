import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export interface DailyRecord {
  date: string;
  value: number;
}

export interface UserData {
  id: string;
  name: string;
  febTotal: number;
  marTotal: number;
  aprTotal: number;
  total: number;
  dailyRecords: DailyRecord[];
}

export interface DashboardData {
  users: UserData[];
  totalFeb: number;
  totalMar: number;
  totalApr: number;
  totalOverall: number;
  dailyTotals: DailyRecord[];
}

const CSV_URL_FEB = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFQIIy5ru1S4FU7k2vuLOL7lMFm44Juj0QJzba-BSQ5v8QNVS10aSmXpG3Ye8Ou33MYQsPREoYypju/pub?gid=272065868&single=true&output=csv';
const CSV_URL_MAR = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQFQIIy5ru1S4FU7k2vuLOL7lMFm44Juj0QJzba-BSQ5v8QNVS10aSmXpG3Ye8Ou33MYQsPREoYypju/pub?gid=1384982388&single=true&output=csv';

const APRIL_DATA = [
  { id: 'SD001', name: 'Laksitha Savidu Pathirana', total: 17 },
  { id: 'SD004', name: 'Damith Kavinda', total: 46 },
  { id: 'SD005', name: 'Ameesha Dinali Hettiarachchi', total: 74 },
  { id: 'SD006', name: 'Lakmini Iresha Gunawardhana', total: 197 },
  { id: 'SD009', name: 'H.A.Charitha Madhavi', total: 54 },
  { id: 'SD010', name: 'B.Harsha Sanjeewani Basnayaka', total: 52 },
  { id: 'SD011', name: 'M G D Githma Madushani', total: 10 },
  { id: 'SD013', name: 'W.Nipuni Madhushika Ranasinghe', total: 21 },
  { id: 'SD018', name: 'W. K. B. Thuhini Iranga Fernando', total: 40 },
  { id: 'SD022', name: 'M.K.I.Madushani', total: 50 },
];

export function useData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [febRes, marRes] = await Promise.all([
          fetch(CSV_URL_FEB),
          fetch(CSV_URL_MAR)
        ]);

        const febText = await febRes.text();
        const marText = await marRes.text();

        const febParsed = Papa.parse(febText, { header: true, skipEmptyLines: true });
        const marParsed = Papa.parse(marText, { header: true, skipEmptyLines: true });

        const usersMap = new Map<string, UserData>();
        const dailyTotalsMap = new Map<string, number>();

        let totalFeb = 0;
        let totalMar = 0;
        let totalApr = 0;

        // Process Feb Data
        febParsed.data.forEach((row: any) => {
          const id = row['ID'];
          if (!id || id === '0' || id === '') return; // Skip total row or invalid rows

          const name = row['Your Name with Initials'];
          const userDaily: DailyRecord[] = [];
          let userFebTotal = 0;

          Object.keys(row).forEach(key => {
            if (key.startsWith('2026/')) {
              const val = parseInt(row[key], 10) || 0;
              userDaily.push({ date: key, value: val });
              userFebTotal += val;
              dailyTotalsMap.set(key, (dailyTotalsMap.get(key) || 0) + val);
            }
          });

          totalFeb += userFebTotal;

          usersMap.set(id, {
            id,
            name,
            febTotal: userFebTotal,
            marTotal: 0,
            aprTotal: 0,
            total: userFebTotal,
            dailyRecords: userDaily
          });
        });

        // Process Mar Data
        marParsed.data.forEach((row: any) => {
          const id = row['ID'];
          if (!id || id === '0' || id === '') return;

          const name = row['Your Name with Initials'];
          let userMarTotal = 0;
          const userDaily: DailyRecord[] = [];

          Object.keys(row).forEach(key => {
            if (key.startsWith('2026/')) {
              const val = parseInt(row[key], 10) || 0;
              userDaily.push({ date: key, value: val });
              userMarTotal += val;
              dailyTotalsMap.set(key, (dailyTotalsMap.get(key) || 0) + val);
            }
          });

          totalMar += userMarTotal;

          if (usersMap.has(id)) {
            const user = usersMap.get(id)!;
            user.marTotal = userMarTotal;
            user.total += userMarTotal;
            user.dailyRecords.push(...userDaily);
          } else {
            usersMap.set(id, {
              id,
              name,
              febTotal: 0,
              marTotal: userMarTotal,
              aprTotal: 0,
              total: userMarTotal,
              dailyRecords: userDaily
            });
          }
        });

        // Process April Data
        APRIL_DATA.forEach((row) => {
          const id = row.id;
          const userAprTotal = row.total;
          totalApr += userAprTotal;

          if (usersMap.has(id)) {
            const user = usersMap.get(id)!;
            user.aprTotal = userAprTotal;
            user.total += userAprTotal;
          } else {
            usersMap.set(id, {
              id,
              name: row.name,
              febTotal: 0,
              marTotal: 0,
              aprTotal: userAprTotal,
              total: userAprTotal,
              dailyRecords: []
            });
          }
        });

        const users = Array.from(usersMap.values()).sort((a, b) => b.total - a.total);
        
        const today = new Date();
        const todayStr = `${today.getFullYear()}/${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}`;

        const dailyTotals = Array.from(dailyTotalsMap.entries())
          .map(([date, value]) => ({ date, value }))
          .filter(d => d.date <= todayStr)
          .sort((a, b) => a.date.localeCompare(b.date));

        setData({
          users,
          totalFeb,
          totalMar,
          totalApr,
          totalOverall: totalFeb + totalMar + totalApr,
          dailyTotals
        });
      } catch (err: any) {
        setError(err.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}
