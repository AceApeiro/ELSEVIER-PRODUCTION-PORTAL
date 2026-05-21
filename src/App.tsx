import React, { useState, useMemo, useEffect } from 'react';
import { useData } from './hooks/useData';
import { ApeiroLogo } from './components/ApeiroLogo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './components/ui/table';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ScatterChart, Scatter, ZAxis, Brush } from 'recharts';
import { Activity, Users, Calendar, TrendingUp, ArrowUpDown, ArrowUp, ArrowDown, Search, LayoutDashboard, BarChart3, ChevronDown, ChevronUp, Palette } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

type SortKey = 'name' | 'febTotal' | 'marTotal' | 'aprTotal' | 'total';
type SortDirection = 'asc' | 'desc';

// Custom Tooltip for Line Chart
const CustomLineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-app-card/95 backdrop-blur-md p-3 rounded-lg shadow-[0_0_15px_rgba(0,240,255,0.3)] border border-app-accent/50">
        <p className="text-app-accent font-semibold mb-1">
          {format(parseISO(label.replace(/\//g, '-')), 'MMM d, yyyy')}
        </p>
        <p className="text-app-text-main font-medium">
          Total: <span className="font-bold text-app-text-main drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Scatter Chart
const CustomScatterTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-app-card/95 backdrop-blur-md p-3 rounded-lg shadow-[0_0_15px_rgba(0,240,255,0.3)] border border-app-accent/50">
        <p className="text-app-text-main font-bold mb-2 border-b border-app-accent/30 pb-1 drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">{data.name}</p>
        <div className="space-y-1 text-sm">
          <p className="text-app-text-muted">Feb Total: <span className="font-semibold text-app-accent">{data.febTotal}</span></p>
          <p className="text-app-text-muted">Mar Total: <span className="font-semibold text-app-accent">{data.marTotal}</span></p>
          <p className="text-app-text-muted">Apr Total: <span className="font-semibold text-app-accent">{data.aprTotal}</span></p>
          <p className="text-app-text-muted pt-1 border-t border-app-accent/30">Overall: <span className="font-bold text-app-text-main drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]">{data.total}</span></p>
        </div>
      </div>
    );
  }
  return null;
};

export default function App({ onClose }: { onClose?: () => void }) {
  const { data, loading, error } = useData();
  const [activeTab, setActiveTab] = useState<'home' | 'analytics'>('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [chartMonth, setChartMonth] = useState<'all' | '02' | '03' | '04'>('all');
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection }>({
    key: 'total',
    direction: 'desc'
  });

  const handleSort = (key: SortKey) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortConfig.key !== columnKey) return <ArrowUpDown className="h-3 w-3 opacity-50" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 text-app-accent" /> : <ArrowDown className="h-3 w-3 text-app-accent" />;
  };

  const filteredChartData = useMemo(() => {
    if (!data?.dailyTotals) return [];
    if (chartMonth === 'all') return data.dailyTotals;
    return data.dailyTotals.filter(d => d.date.startsWith(`2026/${chartMonth}`));
  }, [data?.dailyTotals, chartMonth]);

  const monthlyStats = useMemo(() => {
    if (!data) return [];
    return [
      {
        id: '02',
        name: 'February 2026',
        total: data.totalFeb,
        days: data.dailyTotals.filter(d => d.date.startsWith('2026/02'))
      },
      {
        id: '03',
        name: 'March 2026',
        total: data.totalMar,
        days: data.dailyTotals.filter(d => d.date.startsWith('2026/03'))
      },
      {
        id: '04',
        name: 'April 2026',
        total: data.totalApr,
        days: data.dailyTotals.filter(d => d.date.startsWith('2026/04'))
      }
    ];
  }, [data]);

  const processedData = useMemo(() => {
    if (!data) return null;

    // Filter
    let filteredUsers = data.users.filter(user => 
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sort
    filteredUsers.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    // Summary Stats for filtered users
    const activeUsers = filteredUsers.filter(u => u.total > 0);
    const totalFiltered = filteredUsers.reduce((sum, u) => sum + u.total, 0);
    const avgTotal = activeUsers.length > 0 ? Math.round(totalFiltered / activeUsers.length) : 0;
    const maxTotal = activeUsers.length > 0 ? Math.max(...activeUsers.map(u => u.total)) : 0;
    const minTotal = activeUsers.length > 0 ? Math.min(...activeUsers.map(u => u.total)) : 0;

    return {
      filteredUsers,
      activeUsers,
      totalFiltered,
      avgTotal,
      maxTotal,
      minTotal,
      topPerformers: filteredUsers.slice(0, 5)
    };
  }, [data, searchTerm, sortConfig]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-app-bg text-app-accent">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-app-accent/20 border-t-app-accent"></div>
          <p className="text-sm font-medium">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error || !data || !processedData) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0a0f1c]">
        <div className="rounded-xl border border-red-900/50 bg-red-950/50 p-6 text-red-400">
          <h2 className="mb-2 font-semibold">Error Loading Data</h2>
          <p className="text-sm">{error || 'Unknown error occurred'}</p>
        </div>
      </div>
    );
  }

  const cardHoverEffect = "transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-900/20 border-slate-800 bg-[#0f172a]";

  const last10Days = data?.dailyTotals?.slice(-10) || [];
  const latestDay = last10Days.length > 0 ? last10Days[last10Days.length - 1] : null;

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-200">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#0a0f1c]/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold font-['Orbitron']">A</div>
              <span className="text-xl font-bold text-white font-['Orbitron']">APEIRO</span>
            </div>
            <div className="flex space-x-4 items-center">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'home'
                    ? 'bg-app-accent/20 text-app-accent'
                    : 'text-app-text-muted hover:bg-slate-800/50 hover:text-app-text-main'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Home
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-app-accent/20 text-app-accent'
                    : 'text-app-text-muted hover:bg-slate-800/50 hover:text-app-text-main'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                Data Analytics
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Ticker Marquee */}
      <div className="overflow-hidden whitespace-nowrap bg-blue-900/20 border-b border-blue-800/50 py-2 flex items-center relative">
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0a0f1c] to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0a0f1c] to-transparent z-10 pointer-events-none"></div>
        
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            animation: marquee 20s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
          @keyframes scan {
            0% { top: 0; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
          }
          .scanner-line {
            position: absolute;
            left: 0;
            right: 0;
            height: 2px;
            background: #00f0ff;
            box-shadow: 0 0 10px #00f0ff, 0 0 20px #00f0ff;
            animation: scan 3s linear infinite;
            z-index: 10;
            pointer-events: none;
          }
        `}</style>
        
        <div className="inline-block animate-marquee">
          {last10Days.map(d => (
            <span key={d.date} className="mx-6 text-sm text-blue-300 font-mono">
              {format(parseISO(d.date.replace(/\//g, '-')), 'MMM d')}: <span className="text-white font-bold">{d.value}</span>
            </span>
          ))}
          {/* Duplicate for seamless looping */}
          {last10Days.map(d => (
            <span key={d.date + '-dup'} className="mx-6 text-sm text-blue-300 font-mono">
              {format(parseISO(d.date.replace(/\//g, '-')), 'MMM d')}: <span className="text-white font-bold">{d.value}</span>
            </span>
          ))}
          {/* Duplicate again to ensure no gaps on wide screens */}
          {last10Days.map(d => (
            <span key={d.date + '-dup2'} className="mx-6 text-sm text-blue-300 font-mono">
              {format(parseISO(d.date.replace(/\//g, '-')), 'MMM d')}: <span className="text-white font-bold">{d.value}</span>
            </span>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-7xl p-4 md:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Animated Logo Header */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ApeiroLogo />
              </motion.div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Performance Overview</h1>
                <p className="text-blue-400/80">High-level team metrics for Feb & Mar 2026</p>
              </div>

              {/* Monthly & Daily Stats Row */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card className={cardHoverEffect}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">February Total</CardTitle>
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{data.totalFeb}</div>
                    <p className="text-xs text-slate-500">Total volume for Feb 2026</p>
                  </CardContent>
                </Card>
                
                <Card className={cardHoverEffect}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">March Total</CardTitle>
                    <Calendar className="h-4 w-4 text-indigo-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{data.totalMar}</div>
                    <p className="text-xs text-slate-500">Total volume for Mar 2026</p>
                  </CardContent>
                </Card>

                <Card className={cardHoverEffect}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">April Total</CardTitle>
                    <Calendar className="h-4 w-4 text-emerald-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{data.totalApr}</div>
                    <p className="text-xs text-slate-500">Total volume for Apr 2026</p>
                  </CardContent>
                </Card>

                <Card className={cardHoverEffect}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Latest Daily Total</CardTitle>
                    <Activity className="h-4 w-4 text-amber-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{latestDay?.value || 0}</div>
                    <p className="text-xs text-slate-500">
                      {latestDay ? format(parseISO(latestDay.date.replace(/\//g, '-')), 'MMMM d, yyyy') : 'No recent data'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Summary Stats Row */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className={cardHoverEffect}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Filtered Total</CardTitle>
                    <Activity className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{processedData.totalFiltered}</div>
                    <p className="text-xs text-slate-500">Based on current filters</p>
                  </CardContent>
                </Card>
                
                <Card className={cardHoverEffect}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Average Performance</CardTitle>
                    <TrendingUp className="h-4 w-4 text-emerald-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{processedData.avgTotal}</div>
                    <p className="text-xs text-slate-500">Per active user</p>
                  </CardContent>
                </Card>

                <Card className={cardHoverEffect}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Max / Min</CardTitle>
                    <Activity className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{processedData.maxTotal} <span className="text-lg text-slate-500 font-normal">/ {processedData.minTotal}</span></div>
                    <p className="text-xs text-slate-500">Highest & lowest totals</p>
                  </CardContent>
                </Card>

                <Card className={cardHoverEffect}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-slate-400">Active Members</CardTitle>
                    <Users className="h-4 w-4 text-indigo-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">
                      {processedData.activeUsers.length}
                    </div>
                    <p className="text-xs text-slate-500">Out of {processedData.filteredUsers.length} filtered</p>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Animated Logo Header - Added to Analytics Tab as well */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <ApeiroLogo />
              </motion.div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Data Analytics</h1>
                <p className="text-blue-400/80">Deep dive into team performance and individual records</p>
              </div>

              {/* Charts Row */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
                <Card className={cardHoverEffect}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-white">Daily Trend (Overall)</CardTitle>
                      <CardDescription className="text-slate-400">Team performance over time</CardDescription>
                    </div>
                    <select 
                      className="bg-[#1e293b] border border-slate-700 text-sm rounded-md px-2 py-1 text-white focus:outline-none focus:border-blue-500"
                      value={chartMonth}
                      onChange={(e) => setChartMonth(e.target.value as any)}
                    >
                      <option value="all">All Time</option>
                      <option value="02">February</option>
                      <option value="03">March</option>
                      <option value="04">April</option>
                    </select>
                  </CardHeader>
                  <CardContent className="h-[300px] relative overflow-hidden">
                    {/* Scanner overlay */}
                    <div className="absolute inset-0 pointer-events-none z-10">
                      <div className="scanner-line"></div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={filteredChartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                          </linearGradient>
                          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#00f0ff" strokeOpacity={0.1} />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(val) => format(parseISO(val.replace(/\//g, '-')), 'MMM d')}
                          stroke="#00f0ff"
                          strokeOpacity={0.5}
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          minTickGap={30}
                        />
                        <YAxis 
                          stroke="#00f0ff" 
                          strokeOpacity={0.5}
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip content={<CustomLineTooltip />} cursor={{ stroke: '#00f0ff', strokeWidth: 1, strokeDasharray: '5 5' }} />
                        <Area 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#00f0ff" 
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorValue)"
                          filter="url(#glow)"
                          activeDot={{ r: 6, fill: '#00f0ff', stroke: '#fff', strokeWidth: 2 }}
                        />
                        <Brush 
                          dataKey="date" 
                          height={30} 
                          stroke="#00f0ff" 
                          fill="#0f172a"
                          tickFormatter={(val) => format(parseISO(val.replace(/\//g, '-')), 'MMM d')}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className={cardHoverEffect}>
                  <CardHeader>
                    <CardTitle className="text-white">Feb vs Mar Performance</CardTitle>
                    <CardDescription className="text-slate-400">Comparing individual totals across months</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px] relative overflow-hidden">
                    {/* Scanner overlay */}
                    <div className="absolute inset-0 pointer-events-none z-10">
                      <div className="scanner-line" style={{ animationDelay: '1.5s' }}></div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -20 }}>
                        <defs>
                          <filter id="glow-scatter" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="3" result="blur" />
                            <feMerge>
                              <feMergeNode in="blur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#00f0ff" strokeOpacity={0.1} />
                        <XAxis type="number" dataKey="febTotal" name="Feb Total" stroke="#00f0ff" strokeOpacity={0.5} fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis type="number" dataKey="marTotal" name="Mar Total" stroke="#00f0ff" strokeOpacity={0.5} fontSize={12} tickLine={false} axisLine={false} />
                        <ZAxis type="category" dataKey="name" name="Name" />
                        <Tooltip cursor={{ strokeDasharray: '3 3', stroke: '#00f0ff' }} content={<CustomScatterTooltip />} />
                        <Scatter name="Users" data={processedData.activeUsers} fill="#00f0ff" filter="url(#glow-scatter)" />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              {/* Monthly Daily Breakdown Table */}
              <Card className={cardHoverEffect}>
                <CardHeader>
                  <CardTitle className="text-white">Monthly Breakdown</CardTitle>
                  <CardDescription className="text-slate-400">Click a month to view daily totals</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800">
                        <TableHead>Month</TableHead>
                        <TableHead className="text-right">Total Volume</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {monthlyStats.map(month => (
                        <React.Fragment key={month.id}>
                          <TableRow 
                            className="border-slate-800 hover:bg-slate-800/50 cursor-pointer"
                            onClick={() => setExpandedMonth(expandedMonth === month.id ? null : month.id)}
                          >
                            <TableCell className="font-medium text-slate-200 flex items-center gap-2">
                              {expandedMonth === month.id ? <ChevronUp className="h-4 w-4 text-blue-400" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                              {month.name}
                            </TableCell>
                            <TableCell className="text-right font-bold text-blue-400">{month.total}</TableCell>
                          </TableRow>
                          {expandedMonth === month.id && (
                            <TableRow className="border-slate-800 bg-slate-900/50">
                              <TableCell colSpan={2} className="p-0">
                                <div className="p-4">
                                  <Table className="bg-[#0f172a] rounded-md border border-slate-800">
                                    <TableHeader>
                                      <TableRow className="border-slate-800">
                                        <TableHead className="text-slate-400">Date</TableHead>
                                        <TableHead className="text-right text-slate-400">Daily Total</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {month.days.map(day => (
                                        <TableRow key={day.date} className="border-slate-800 hover:bg-slate-800/50">
                                          <TableCell className="text-slate-300">
                                            {format(parseISO(day.date.replace(/\//g, '-')), 'MMMM d, yyyy')}
                                          </TableCell>
                                          <TableCell className="text-right font-medium text-white">{day.value}</TableCell>
                                        </TableRow>
                                      ))}
                                      {month.days.length === 0 && (
                                        <TableRow className="border-slate-800">
                                          <TableCell colSpan={2} className="text-center text-slate-500 py-4">No data available</TableCell>
                                        </TableRow>
                                      )}
                                    </TableBody>
                                  </Table>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Table & Filters */}
              <Card className={cardHoverEffect}>
                <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-white">Detailed Records</CardTitle>
                    <CardDescription className="text-slate-400">Individual performance breakdown with sorting and filtering</CardDescription>
                  </div>
                  <div className="relative w-full md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name..."
                      className="w-full rounded-md border border-slate-700 bg-[#1e293b] pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800 hover:bg-slate-800/50">
                        <TableHead 
                          className="cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('name')}
                        >
                          <div className="flex items-center gap-1">
                            Name
                            <SortIcon columnKey="name" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-right cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('febTotal')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Feb Total
                            <SortIcon columnKey="febTotal" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-right cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('marTotal')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Mar Total
                            <SortIcon columnKey="marTotal" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-right cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('aprTotal')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Apr Total
                            <SortIcon columnKey="aprTotal" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="text-right font-bold cursor-pointer hover:text-white transition-colors"
                          onClick={() => handleSort('total')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Overall
                            <SortIcon columnKey="total" />
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedData.filteredUsers.map((user) => (
                        <TableRow key={user.id} className="border-slate-800 hover:bg-slate-800/50">
                          <TableCell className="font-medium text-slate-200">{user.name}</TableCell>
                          <TableCell className="text-right text-slate-400">{user.febTotal}</TableCell>
                          <TableCell className="text-right text-slate-400">{user.marTotal}</TableCell>
                          <TableCell className="text-right text-slate-400">{user.aprTotal}</TableCell>
                          <TableCell className="text-right font-bold text-blue-400">{user.total}</TableCell>
                        </TableRow>
                      ))}
                      {processedData.filteredUsers.length === 0 && (
                        <TableRow className="border-slate-800">
                          <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                            No results found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
