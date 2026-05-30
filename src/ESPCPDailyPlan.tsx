import { Database, Search } from "lucide-react";
import { motion } from "motion/react";
import Papa from "papaparse";
import React, { useEffect, useState } from "react";

export default function ESPCPDailyPlan({
	setCurrentProject,
}: {
	setCurrentProject: (project: string | null) => void;
}) {
	const [data, setData] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		const url =
			"https://docs.google.com/spreadsheets/d/e/2PACX-1vQcNbrZH9p6sdT0G8Wia6UJIqtZOKymZ36LRwGwoMJfovj6MAjUVT9RioALsddd9GMIH2Zr0xywXhg4/pub?gid=1197318292&single=true&output=csv";
		fetch(url)
			.then((res) => res.text())
			.then((csv) => {
				const parsed = Papa.parse(csv, { header: true, skipEmptyLines: true });
				setData(parsed.data as any[]);
				setLoading(false);
			})
			.catch((err) => {
				console.error(err);
				setError("Failed to fetch data");
				setLoading(false);
			});
	}, []);

	const filteredData = data.filter((row) => {
		return Object.values(row).some((val: any) =>
			String(val).toLowerCase().includes(searchTerm.toLowerCase()),
		);
	});

	return (
		<div className="relative w-full min-h-screen flex flex-col items-center">
			{/* Background theme comes from document wide data-theme */}
			<div className="absolute inset-0 bg-[#0a0f1c] pointer-events-none -z-10"></div>

			<div className="w-full max-w-7xl mx-auto p-8 pt-24 z-10 flex flex-col h-screen">
				<div className="bg-[#0f172a] border border-[#1e293b] p-6 rounded-lg w-full mb-8 flex justify-between items-center shadow-lg">
					<div>
						<h2 className="text-2xl font-bold font-['Rajdhani'] text-[#00f2ff] tracking-widest uppercase">
							ESPCP - DAILY PLAN
						</h2>
						<p className="text-slate-400 font-mono text-xs mt-1">
							PRODUCTION SCHEDULING INTERFACE
						</p>
					</div>

					<div className="relative">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
						<input
							type="text"
							placeholder="SEARCH ENTRIES..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="bg-[#050a10] border border-[#1e293b] text-slate-300 font-mono text-sm rounded px-4 py-2 pl-9 focus:outline-none focus:border-[#00f2ff] w-64 transition-colors"
						/>
					</div>
				</div>

				<div className="flex-1 w-full bg-[#0a0f1c]/80 border border-[#1e293b] rounded-lg p-6 overflow-hidden flex flex-col backdrop-blur-md">
					{loading ? (
						<div className="flex-1 flex justify-center items-center">
							<div className="animate-pulse text-[#00f2ff] font-mono flex items-center">
								<Database className="w-6 h-6 mr-3" /> LOADING SCHEDULING DATA...
							</div>
						</div>
					) : error ? (
						<div className="flex-1 flex justify-center items-center text-red-500 font-mono">
							[ ERROR: {error} ]
						</div>
					) : filteredData.length > 0 ? (
						<div className="overflow-x-auto w-full custom-scrollbar flex-1">
							<table className="w-full text-left border-collapse text-sm">
								<thead className="bg-[#050a10] border-b border-[#00f2ff]/30 sticky top-0 z-20">
									<tr>
										{Object.keys(filteredData[0]).map((k) => (
											<th
												key={k}
												className="p-3 text-[#00f2ff] font-mono tracking-widest whitespace-nowrap"
											>
												{k}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{filteredData.map((row, i) => (
										<motion.tr
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: i * 0.02 }}
											key={i}
											className="border-b border-[#1e293b] hover:bg-[#00f2ff]/5 transition-colors"
										>
											{Object.values(row).map((val: any, j) => (
												<td
													key={j}
													className="p-3 text-slate-300 font-mono whitespace-nowrap"
												>
													{val}
												</td>
											))}
										</motion.tr>
									))}
								</tbody>
							</table>
						</div>
					) : (
						<div className="flex-1 flex justify-center items-center text-slate-500 font-mono">
							[ NO SCHEDULING RECORDS FOUND ]
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
