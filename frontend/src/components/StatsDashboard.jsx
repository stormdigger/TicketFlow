import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import api from '../api';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        whileHover={{ scale: 1.05, y: -5 }}
        className={`glass-panel p-6 rounded-2xl relative overflow-hidden group`}
    >
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity ${color} blur-xl`}></div>
        
        <div className="flex justify-between items-start relative z-10">
            <div>
                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">{title}</p>
                <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
            </div>
            <div className={`p-3 rounded-lg bg-white/5 ${color.replace('bg-', 'text-')}`}>
                <Icon size={24} />
            </div>
        </div>
    </motion.div>
);

const StatsDashboard = ({ refreshTrigger }) => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get('/tickets/stats/')
            .then(res => setStats(res.data))
            .catch(err => console.error(err));
    }, [refreshTrigger]);

    if (!stats) return <div className="text-center p-10 animate-pulse text-indigo-400">Loading neural network data...</div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <StatCard title="Total Tickets" value={stats.total_tickets} icon={Activity} color="bg-blue-500" delay={0.1} />
            <StatCard title="Open Issues" value={stats.open_tickets} icon={Clock} color="bg-yellow-500" delay={0.2} />
            <StatCard title="Avg Per Day" value={stats.avg_tickets_per_day} icon={CheckCircle} color="bg-emerald-500" delay={0.3} />
            <StatCard title="Critical" value={stats.priority_breakdown?.critical || 0} icon={AlertTriangle} color="bg-red-500" delay={0.4} />
        </div>
    );
};

export default StatsDashboard;