import React, { useState, useEffect } from 'react';
import { ApeiroLogo } from './components/ApeiroLogo';
import { Database, LogOut } from 'lucide-react';
import { auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import Papa from 'papaparse';

export default function ESPCPRework({ setCurrentProject }: { setCurrentProject: (project: string | null) => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reworkData, setReworkData] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ESPCP' | 'ESPBK' | 'BIORXIV'>('ESPCP');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      setDataLoading(true);
      let url = '';
      if (activeTab === 'ESPCP') {
        url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRS-TPp-hkTBWJUds4OzF-N2glCpDhLgY52bYEx9DTmJZz5VqCFbPeRCrnVT0bF4AUHZgMIgOPKeqkh/pub?gid=8119884&single=true&output=csv';
      }
      
      if (url) {
        fetch(url)
          .then(res => res.text())
          .then(csv => {
            const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
            setReworkData(parsed.data as any[]);
            setDataLoading(false);
          })
          .catch(err => {
            console.error(err);
            setDataLoading(false);
          });
      } else {
        setReworkData([]);
        setDataLoading(false);
      }
    }
  }, [user, activeTab]);

  const handleLogin = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error(err);
      let errMsg = err.message || 'Login failed.';
      if (err.code === 'auth/popup-blocked') {
         errMsg = 'Popup blocked by browser. Please allow popups or open the app in a new tab.';
      } else if (err.code === 'auth/unauthorized-domain') {
         errMsg = 'This domain is not authorized for OAuth operations for your Firebase project. Consider opening in a new tab if in an iframe, or update configured domains in Firebase console.';
      }
      setError(errMsg);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="relative w-full min-h-screen bg-black">
        <div className="absolute inset-0 bg-[#0a0f1c] flex items-center justify-center p-4">
          <div className="bg-[#050a10] border border-[#00f2ff]/50 p-8 rounded-lg max-w-lg w-full text-center shadow-[0_0_30px_rgba(0,242,255,0.3)]">
            <ApeiroLogo />
            <div className="animate-pulse flex gap-2 justify-center items-center text-sm text-[#00f2ff] font-mono mt-8">
              <Database className="w-4 h-4" /> VERIFYING AUTHENTICATION STATUS...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full min-h-screen bg-black flex flex-col items-center">
      <div className="w-full flex justify-between items-center px-8 py-4 bg-[#050a10] border-b-2 border-[#00f2ff]/50 shadow-[0_0_30px_rgba(0,242,255,0.3)] z-50">
        <ApeiroLogo />
        <div className="flex gap-4 items-center">
          {user && (
            <div className="text-[#00f2ff] font-mono text-sm hidden md:block">
              LOGGED IN AS: {user.email}
            </div>
          )}
          {user && (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-[#00f2ff]/10 text-[#00f2ff] border border-[#00f2ff] rounded-md px-4 py-2 hover:bg-[#00f2ff]/20 transition-all font-mono text-sm"
            >
              <LogOut className="w-4 h-4" /> LOGOUT
            </button>
          )}
          <button 
            onClick={() => setCurrentProject(null)}
            className="flex items-center gap-2 bg-black/80 text-white border border-[#333] rounded-md px-4 py-2 hover:bg-white/10 transition-all font-mono text-sm"
          >
            ⏏ HUB
          </button>
        </div>
      </div>

      <div className="flex-1 w-full relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,242,255,0.1),black)] pointer-events-none z-0"></div>
        
        {!user ? (
          <div className="z-10 absolute inset-0 flex items-center justify-center p-4">
            <div className="bg-[#050a10] border border-[#00f2ff]/50 p-8 rounded-lg max-w-lg w-full flex flex-col items-center shadow-[0_0_30px_rgba(0,242,255,0.3)]">
              <h2 className="text-[#00f2ff] font-['Orbitron'] text-2xl tracking-widest mt-2 mb-6">SECURE LOGIN REQUIRED</h2>
              <p className="text-slate-400 font-mono text-sm mb-8 text-center leading-relaxed">
                You must authenticate with a Google Account to access the ESPCP Rework module and synchronize with the master data sheets.
              </p>
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-md mb-6 font-mono text-sm w-full text-center">
                  {error}
                </div>
              )}
              <button 
                onClick={handleLogin}
                className="bg-[#00f2ff] text-black font-bold font-['Orbitron'] tracking-widest px-8 py-4 rounded-lg w-full max-w-[280px] hover:bg-white hover:text-[#00f2ff] transition-all hover:shadow-[0_0_20px_#00f2ff] uppercase"
              >
                Sign In With Google
              </button>
            </div>
          </div>
        ) : (
          <div className="z-10 relative flex flex-col items-center p-8 w-full max-w-6xl mx-auto mt-10">
            <div className="bg-[#050a10] border border-[#00f2ff]/50 p-6 rounded-lg w-full mb-8 shadow-[0_0_20px_rgba(0,242,255,0.2)] flex justify-between items-center flex-wrap gap-4">
               <div>
                 <h2 className="text-2xl font-bold font-['Rajdhani'] text-[#00f2ff] tracking-widest">ESPCP REWORK DASHBOARD</h2>
                 <p className="text-slate-400 font-mono text-xs mt-1">SHEET SYNC ACTIVE / ACCESS GRANTED</p>
               </div>
               {user.email === 'info@acestool.com' && (
                 <div className="px-3 py-1 bg-[#00f2ff]/20 border border-[#00f2ff] text-[#00f2ff] font-mono text-xs font-bold rounded">
                   ADMIN PRIVILEGES
                 </div>
               )}
            </div>

            <div className="flex w-full gap-4 mb-6">
              {[
                { id: 'ESPCP', label: 'ESPCP' },
                { id: 'ESPBK', label: 'ESPBK' },
                { id: 'BIORXIV', label: 'BIORXIV' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-3 px-4 font-mono font-bold tracking-widest transition-all rounded border ${
                    activeTab === tab.id 
                      ? 'bg-[#00f2ff] text-black border-[#00f2ff] shadow-[0_0_15px_rgba(0,242,255,0.4)]'
                      : 'bg-transparent text-[#00f2ff] border-[#00f2ff]/30 hover:border-[#00f2ff] hover:bg-[#00f2ff]/10'
                  }`}
                >
                  [{tab.label}] DATA
                </button>
              ))}
            </div>

            <div className="w-full bg-[#050a10]/80 border border-[#222] rounded-lg p-6 min-h-[400px]">
                {dataLoading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-pulse text-[#00f2ff] font-mono"><Database className="inline h-4 w-4 mr-2" /> DATA SYNC IN PROGRESS...</div>
                  </div>
                ) : reworkData && reworkData.length > 0 ? (
                  <div className="overflow-x-auto w-full custom-scrollbar">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead className="bg-[#0a0f1c] border-b border-[#00f2ff]/30">
                        <tr>
                          {Object.keys(reworkData[0]).map(k => (
                            <th key={k} className="p-3 text-[#00f2ff] font-mono tracking-widest whitespace-nowrap">{k}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {reworkData.map((row, i) => (
                          <tr key={i} className="border-b border-[#00f2ff]/10 hover:bg-[#00f2ff]/10 transition-colors">
                            {Object.values(row).map((val: any, j) => (
                              <td key={j} className="p-3 text-slate-300 font-mono whitespace-nowrap">{val}</td>
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
        )}
      </div>
    </div>
  );
}
