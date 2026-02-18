import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, MessageSquare, ChevronDown } from 'lucide-react';
import api from '../api';

const TicketList = ({ refreshTrigger }) => {
    const [tickets, setTickets] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [solution, setSolution] = useState(null);
    const [loadingSolution, setLoadingSolution] = useState(false);

    const fetchTickets = () => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (statusFilter) params.append('status', statusFilter);
        if (priorityFilter) params.append('priority', priorityFilter);
        if (categoryFilter) params.append('category', categoryFilter);

        api.get(`/tickets/?${params.toString()}`)
            .then(res => setTickets(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchTickets();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [refreshTrigger, search, statusFilter, priorityFilter, categoryFilter]);

    const getSolution = async (description) => {
        setLoadingSolution(true);
        setSolution(null);
        try {
            const res = await api.post('/tickets/suggest_solution/', { description });
            setSolution(res.data.solution);
        } catch (error) {
            setSolution("AI could not generate a solution.");
        } finally {
            setLoadingSolution(false);
        }
    };

    const updateStatus = async (id, newStatus) => {
        await api.patch(`/tickets/${id}/`, { status: newStatus });
        fetchTickets();
    };

    const getPriorityColor = (p) => {
        switch(p) {
            case 'critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
            case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
            case 'medium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
        >
            {/* Filter Bar */}
            <div className="glass-panel p-4 rounded-2xl flex flex-wrap gap-4 items-center">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search tickets..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
                    {[
                        { val: statusFilter, set: setStatusFilter, opts: ['open', 'in_progress', 'resolved'], ph: 'Status' },
                        { val: priorityFilter, set: setPriorityFilter, opts: ['low', 'medium', 'high', 'critical'], ph: 'Priority' },
                        { val: categoryFilter, set: setCategoryFilter, opts: ['technical', 'billing', 'account'], ph: 'Category' }
                    ].map((f, i) => (
                        <select 
                            key={i}
                            value={f.val}
                            onChange={(e) => f.set(e.target.value)}
                            className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-2 text-sm text-gray-300 focus:border-indigo-500 outline-none cursor-pointer hover:bg-slate-800 transition-colors"
                        >
                            <option value="">All {f.ph}</option>
                            {f.opts.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
                        </select>
                    ))}
                </div>
            </div>

            {/* AI Solution Modal / Popup */}
            <AnimatePresence>
                {solution && (
                    <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-2xl p-6 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-x"></div>
                        <div className="flex justify-between items-start">
                            <div className="flex gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-lg h-fit">
                                    <MessageSquare className="text-indigo-400" size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white mb-1">AI Suggestion</h4>
                                    <p className="text-indigo-100/80 leading-relaxed">{solution}</p>
                                </div>
                            </div>
                            <button onClick={() => setSolution(null)} className="text-indigo-300 hover:text-white transition-colors">Close</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ticket Cards */}
            <div className="space-y-4">
                <AnimatePresence>
                    {tickets.map((ticket, index) => (
                        <motion.div 
                            key={ticket.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            layout
                            className="glass-panel p-6 rounded-2xl group hover:bg-white/5 transition-colors border-l-4 border-l-transparent hover:border-l-indigo-500"
                        >
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h4 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">{ticket.title}</h4>
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getPriorityColor(ticket.priority)}`}>
                                            {ticket.priority.toUpperCase()}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-sm line-clamp-2 mb-4">{ticket.description}</p>
                                    
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                                            📂 {ticket.category}
                                        </span>
                                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-3">
                                    <div className="relative">
                                        <select 
                                            value={ticket.status} 
                                            onChange={(e) => updateStatus(ticket.id, e.target.value)}
                                            className={`appearance-none pl-3 pr-8 py-1.5 rounded-lg text-xs font-bold uppercase cursor-pointer transition-all
                                                ${ticket.status === 'open' ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30' : 
                                                  ticket.status === 'resolved' ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 
                                                  'bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30'}`}
                                        >
                                            <option value="open">Open</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" size={12} />
                                    </div>

                                    <button 
                                        onClick={() => getSolution(ticket.description)}
                                        className="text-xs font-medium text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                                        disabled={loadingSolution}
                                    >
                                        <MessageSquare size={14} />
                                        {loadingSolution ? 'Thinking...' : 'Ask AI'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

export default TicketList;