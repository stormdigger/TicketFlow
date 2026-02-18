import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Bot, Loader2, X, CheckCircle2, Edit3, ArrowLeft } from 'lucide-react';
import api from '../api';

const TicketForm = ({ onTicketCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('');
    
    const [step, setStep] = useState('edit'); 
    const [isClassifying, setIsClassifying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const startAnalysis = async () => {
        if (!title || !description) return alert("Please fill in Title and Description first.");
        setIsClassifying(true);
        try {
            const response = await api.post('/tickets/classify/', { description });
            setCategory(response.data.suggested_category || 'general');
            setPriority(response.data.suggested_priority || 'medium');
            setStep('review'); 
        } catch (error) {
            console.error("AI Error:", error);
            setCategory('general');
            setPriority('medium');
            setStep('review'); 
        } finally {
            setIsClassifying(false);
        }
    };

    const finalSubmit = async () => {
        setIsSubmitting(true);
        try {
            await api.post('/tickets/', { title, description, category, priority });
            setTitle(''); setDescription(''); setCategory(''); setPriority('');
            setStep('edit');
            onTicketCreated();
        } catch (error) {
            alert("Submission failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative w-full">
            <AnimatePresence mode="wait">
                {step === 'edit' ? (
                    <motion.div 
                        key="edit-form"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl bg-slate-900/40"
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-indigo-500/20 rounded-lg">
                                <Edit3 className="text-indigo-400" size={20} />
                            </div>
                            <h3 className="text-xl font-bold text-white tracking-tight">Draft New Ticket</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="group">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1 group-focus-within:text-indigo-400 transition-colors">Subject</label>
                                <input 
                                    type="text" 
                                    value={title} 
                                    onChange={(e) => setTitle(e.target.value)} 
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all placeholder:text-slate-700 shadow-inner"
                                    placeholder="What needs fixing?"
                                />
                            </div>

                            <div className="group">
                                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 ml-1 group-focus-within:text-indigo-400 transition-colors">Issue Description</label>
                                <textarea 
                                    value={description} 
                                    onChange={(e) => setDescription(e.target.value)} 
                                    rows="5"
                                    className="w-full bg-slate-950/50 border border-white/5 rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all resize-none placeholder:text-slate-700 shadow-inner"
                                    placeholder="Tell the AI what's wrong..."
                                />
                            </div>

                            <motion.button 
                                whileHover={{ scale: 1.01, translateY: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={startAnalysis}
                                disabled={isClassifying}
                                className="w-full py-4 bg-white text-slate-950 font-black rounded-2xl flex items-center justify-center gap-3 transition-all hover:bg-indigo-50 shadow-[0_0_20px_rgba(255,255,255,0.1)] disabled:opacity-50"
                            >
                                {isClassifying ? (
                                    <><Loader2 className="animate-spin" size={20} /> <span className="uppercase tracking-widest text-sm">Processing...</span></>
                                ) : (
                                    <><Sparkles size={20} /> <span className="uppercase tracking-widest text-sm">Analyze with AI</span></>
                                )}
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="review-card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="glass-panel p-8 rounded-3xl border border-indigo-500/20 bg-indigo-950/10 shadow-[0_0_50px_rgba(79,70,229,0.1)]"
                    >
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-500/20 rounded-lg">
                                    <Bot className="text-indigo-400" size={20} />
                                </div>
                                <h3 className="text-xl font-bold text-white tracking-tight">AI Insights</h3>
                            </div>
                            <button onClick={() => setStep('edit')} className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-8">
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] ml-1">Classification</label>
                                    <select 
                                        value={category} 
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer appearance-none shadow-xl"
                                    >
                                        <option value="general">📂 General</option>
                                        <option value="technical">🛠️ Technical</option>
                                        <option value="billing">💳 Billing</option>
                                        <option value="account">👤 Account</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] ml-1">Urgency Level</label>
                                    <select 
                                        value={priority} 
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer appearance-none shadow-xl"
                                    >
                                        <option value="low">🟢 Low Priority</option>
                                        <option value="medium">🟡 Medium Priority</option>
                                        <option value="high">🟠 High Priority</option>
                                        <option value="critical">🔴 Critical Priority</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <button 
                                    onClick={() => setStep('edit')}
                                    className="flex-[1] py-4 px-6 border border-white/10 hover:bg-white/5 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
                                >
                                    <ArrowLeft size={18} /> Back
                                </button>
                                <motion.button 
                                    whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(99, 102, 241, 0.4)' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={finalSubmit}
                                    disabled={isSubmitting}
                                    className="flex-[2] py-4 px-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-indigo-900/20 border border-indigo-400/30 transition-all"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <span className="text-sm uppercase tracking-[0.1em]">Confirm & Submit</span>
                                            <CheckCircle2 size={20} />
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TicketForm;