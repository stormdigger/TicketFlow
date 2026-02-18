import React, { useState } from 'react';
import TicketForm from './components/TicketForm';
import TicketList from './components/TicketList';
import StatsDashboard from './components/StatsDashboard';
import { Sparkles, LayoutDashboard } from 'lucide-react';

function App() {
  const [refresh, setRefresh] = useState(0);

  const handleTicketCreated = () => {
    setRefresh(prev => prev + 1);
  };

  return (
    <div className="min-h-screen text-slate-200 selection:bg-indigo-500/30">
      {/* Navbar with blur effect */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 border-b-white/5 bg-slate-900/80">
        <div className="max-w-6xl mx-auto px-6 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/30">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Ticket<span className="text-indigo-400">Box</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1.5 rounded-full border border-indigo-500/20">
            <Sparkles size={14} className="text-indigo-400" />
            <span className="text-xs font-medium text-indigo-200">Gemini 2.5 Flash Active</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 pt-28 pb-20">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h2>
          <p className="text-slate-400">Real-time support metrics and ticket management.</p>
        </div>

        <StatsDashboard refreshTrigger={refresh} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1 sticky top-28">
                <TicketForm onTicketCreated={handleTicketCreated} />
            </div>
            <div className="lg:col-span-2">
                <TicketList refreshTrigger={refresh} />
            </div>
        </div>
      </main>
    </div>
  );
}

export default App;