/**
 * Admin Settings
 * System settings for bank transfer, crypto, and other configurations
 */

import React, { useState, useEffect } from 'react';
import {
    Settings, CreditCard, Wallet, Zap, Save, Info, ChevronDown,
    Star, MessageSquare, Activity, CheckCircle, Loader, AlertTriangle,
    Trash2, X,
    Image as ImageIcon
} from 'lucide-react';
import { Bitcoin } from 'lucide-react';
import { Button } from '../../../components/common';
import { API_ENDPOINTS, API_BASE_URL } from '../../../config/api';

export const AdminSettings = () => {
    const [settings, setSettings] = useState({
        bank: {
            bankId: '',
            accountNo: '',
            accountName: '',
            username: '',
            password: '',
            deviceId: ''
        },
        binance: {
            apiKey: '',
            secretKey: ''
        },
        crypto: {
            enabled: false,
            networks: [] as any[]
        },
        exchangeRate: 25000,
        reviewEnabled: true
    });
    const [banks, setBanks] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
    const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [testMessage, setTestMessage] = useState('');
    const [testBinanceStatus, setTestBinanceStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [testBinanceMessage, setTestBinanceMessage] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Settings from API
                const settingsRes = await fetch(API_ENDPOINTS.SETTINGS);
                if (settingsRes.ok) {
                    const data = await settingsRes.json();
                    setSettings(prev => ({ ...prev, ...data }));
                }

                // Fetch review_enabled from Supabase
                const { AppSettingsAPI } = await import('../../../config/supabaseApi');
                const appSettings = await AppSettingsAPI.get();
                if (appSettings) {
                    setSettings(prev => ({ ...prev, reviewEnabled: appSettings.review_enabled ?? true }));
                }

                // Fetch Banks
                const banksRes = await fetch('https://api.vietqr.io/v2/banks');
                if (banksRes.ok) {
                    const data = await banksRes.json();
                    setBanks(data.data);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };
        fetchData();
    }, []);

    const handleTestConnection = async () => {
        setTestStatus('loading');
        setTestMessage('');
        try {
            const { username, password, deviceId } = settings.bank;
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.SETTINGS_TEST_TPBANK, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ username, password, deviceId })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setTestStatus('success');
                setTestMessage(data.message);
            } else {
                setTestStatus('error');
                setTestMessage(data.message || 'Connection failed');
            }
        } catch (error) {
            console.error(error);
            setTestStatus('error');
            setTestMessage('Network error or server unreachable');
        }
    };

    const handleSave = async () => {
        setSaveStatus('saving');
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.SETTINGS, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(settings)
            });

            // Save review_enabled to Supabase
            const { AppSettingsAPI } = await import('../../../config/supabaseApi');
            await AppSettingsAPI.setReviewEnabled(settings.reviewEnabled);

            if (res.ok) {
                setSaveStatus('saved');
                setTimeout(() => setSaveStatus('idle'), 2000);
            } else {
                setSaveStatus('error');
            }
        } catch (error) {
            setSaveStatus('error');
        }
    };

    const handleChange = (field: string, value: any) => {
        if (field.includes('.')) {
            const [parent, child] = field.split('.');
            setSettings(prev => ({
                ...prev,
                [parent]: {
                    ...(prev as any)[parent],
                    [child]: value
                }
            }));
        } else {
            setSettings(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleTestBinance = async () => {
        setTestBinanceStatus('loading');
        setTestBinanceMessage('');
        try {
            const { apiKey, secretKey } = settings.binance;
            const token = localStorage.getItem('token');
            const res = await fetch(API_ENDPOINTS.SETTINGS_TEST_BINANCE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ apiKey, secretKey })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setTestBinanceStatus('success');
                setTestBinanceMessage(data.message || 'Connection successful!');
            } else {
                setTestBinanceStatus('error');
                setTestBinanceMessage(data.message || 'Connection failed');
            }
        } catch (error) {
            console.error(error);
            setTestBinanceStatus('error');
            setTestBinanceMessage('Network error or server unreachable');
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">System Settings</h2>
                <Button
                    onClick={handleSave}
                    className="bg-brand-cyan text-black font-bold flex items-center gap-2 hover:bg-[#5ff5ff] min-w-[120px] justify-center"
                    disabled={saveStatus === 'saving'}
                >
                    {saveStatus === 'saving' ? <Activity className="animate-spin" size={18} /> :
                        saveStatus === 'saved' ? <CheckCircle size={18} /> : <Save size={18} />}
                    {saveStatus === 'saving' ? 'Saving...' :
                        saveStatus === 'saved' ? 'Saved!' : 'Save Changes'}
                </Button>
            </div>

            {/* General Config */}
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl space-y-6">
                <h3 className="font-bold text-lg text-white border-b border-white/5 pb-2 flex items-center gap-2">
                    <Settings size={20} className="text-slate-400" /> General Configuration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Exchange Rate (USD to VND)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₫</span>
                            <input
                                type="number"
                                value={settings.exchangeRate}
                                onChange={(e) => handleChange('exchangeRate', parseInt(e.target.value))}
                                className="w-full bg-[#020617] border border-white/10 focus:border-brand-cyan/50 rounded-xl pl-8 pr-4 py-3 text-sm text-white font-mono font-bold focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-all"
                            />
                        </div>
                        <p className="text-[10px] text-slate-500">Used for calculating VietQR amounts.</p>
                    </div>
                </div>
            </div>

            {/* Feature Toggles */}
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl space-y-6">
                <h3 className="font-bold text-lg text-white border-b border-white/5 pb-2 flex items-center gap-2">
                    <Star size={20} className="text-amber-400" /> Feature Toggles
                </h3>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${settings.reviewEnabled ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                <MessageSquare size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-white text-sm">Enable Product Reviews</p>
                                <p className="text-xs text-slate-400">Allow users to rate and review purchased products</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleChange('reviewEnabled', !settings.reviewEnabled)}
                            className={`relative w-11 h-6 rounded-full transition-colors ${settings.reviewEnabled ? 'bg-amber-500' : 'bg-slate-600'}`}
                        >
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.reviewEnabled ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bank Transfer Config */}
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl space-y-6">
                <h3 className="font-bold text-lg text-white border-b border-white/5 pb-2 flex items-center gap-2">
                    <CreditCard size={20} className="text-blue-400" /> Bank Transfer Configuration
                </h3>

                <div className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                        <Info className="text-blue-400 shrink-0 mt-0.5" size={18} />
                        <p className="text-sm text-blue-200">
                            Configure the receiving bank account for automatic QR code generation.
                            The <strong>Bank Short Name</strong> (e.g., MBBank, VCB) is used by VietQR.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bank</label>
                            <div className="relative">
                                <select
                                    value={settings.bank.bankId}
                                    onChange={(e) => handleChange('bank.bankId', e.target.value)}
                                    className="w-full appearance-none bg-[#020617] border border-white/10 focus:border-brand-cyan/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-all cursor-pointer"
                                >
                                    <option value="">Select Bank</option>
                                    {banks.map((bank: any) => (
                                        <option key={bank.id} value={bank.shortName}>
                                            {bank.shortName} - {bank.name}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Number</label>
                            <input
                                type="text"
                                value={settings.bank.accountNo}
                                onChange={(e) => handleChange('bank.accountNo', e.target.value)}
                                className="w-full bg-[#020617] border border-white/10 focus:border-brand-cyan/50 rounded-xl px-4 py-3 text-sm text-white font-mono font-medium focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-all"
                                placeholder="e.g. 19034482991011"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Account Name</label>
                            <input
                                type="text"
                                value={settings.bank.accountName}
                                onChange={(e) => handleChange('bank.accountName', e.target.value.toUpperCase())}
                                className="w-full bg-[#020617] border border-white/10 focus:border-brand-cyan/50 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-all uppercase"
                                placeholder="e.g. NGUYEN VAN A"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">TPBank Username</label>
                            <input
                                type="text"
                                value={settings.bank.username || ''}
                                onChange={(e) => handleChange('bank.username', e.target.value)}
                                className="w-full bg-[#020617] border border-white/10 focus:border-brand-cyan/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-all"
                                placeholder="Login Username"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">TPBank Password</label>
                            <input
                                type="password"
                                value={settings.bank.password || ''}
                                onChange={(e) => handleChange('bank.password', e.target.value)}
                                className="w-full bg-[#020617] border border-white/10 focus:border-brand-cyan/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-all"
                                placeholder="Login Password"
                            />
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">TPBank Device ID (Required for API)</label>
                            <input
                                type="text"
                                value={settings.bank.deviceId || ''}
                                onChange={(e) => handleChange('bank.deviceId', e.target.value)}
                                className="w-full bg-[#020617] border border-white/10 focus:border-brand-cyan/50 rounded-xl px-4 py-3 text-sm text-white font-mono focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-all"
                                placeholder="localStorage.deviceId from ebank.tpb.vn"
                            />
                            <p className="text-[10px] text-slate-500">
                                Login to <a href="https://ebank.tpb.vn/retail/vX/" target="_blank" className="text-brand-cyan underline">TPBank eBank</a>, open Console (F12), type <code>localStorage.deviceId</code> to get this value.
                            </p>
                        </div>

                        <div className="md:col-span-2 pt-2 border-t border-white/5 flex items-center justify-between">
                            <div className="flex-1">
                                {testStatus !== 'idle' && (
                                    <div className={`text-xs px-3 py-2 rounded-lg border flex items-center gap-2 ${testStatus === 'success'
                                        ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                        : testStatus === 'error'
                                            ? 'bg-red-500/10 border-red-500/20 text-red-400'
                                            : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                        }`}>
                                        {testStatus === 'loading' && <Loader size={12} className="animate-spin" />}
                                        {testStatus === 'success' && <CheckCircle size={12} />}
                                        {testStatus === 'error' && <AlertTriangle size={12} />}
                                        {testMessage || (testStatus === 'loading' ? 'Testing connection to TPBank...' : '')}
                                    </div>
                                )}
                            </div>
                            <Button
                                onClick={handleTestConnection}
                                disabled={testStatus === 'loading'}
                                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 ml-4"
                            >
                                Test Connection
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Crypto Transfer Configuration (Manual) */}
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl space-y-6">
                <h3 className="font-bold text-lg text-white border-b border-white/5 pb-2 flex items-center gap-2">
                    <Bitcoin size={20} className="text-emerald-400" /> Crypto Transfer Configuration
                </h3>

                <div className="space-y-4">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-start gap-3">
                        <Info className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                        <p className="text-sm text-emerald-200">
                            Configure the receiving wallet for manual crypto payments.
                            These details will be displayed to users during checkout.
                        </p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${settings.crypto?.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                <Zap size={18} />
                            </div>
                            <div>
                                <p className="font-bold text-white text-sm">Enable Crypto Payment</p>
                                <p className="text-xs text-slate-400">Show this payment option at checkout</p>
                            </div>
                        </div>
                        <button
                            onClick={() => handleChange('crypto.enabled', !settings.crypto?.enabled)}
                            className={`relative w-11 h-6 rounded-full transition-colors ${settings.crypto?.enabled ? 'bg-emerald-500' : 'bg-slate-600'}`}
                        >
                            <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.crypto?.enabled ? 'translate-x-5' : ''}`} />
                        </button>
                    </div>

                    {settings.crypto?.enabled && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Configured Networks</label>
                                <Button
                                    onClick={() => {
                                        const newNet = {
                                            network: 'TRC20',
                                            currency: 'USDT',
                                            walletAddress: '',
                                            qrCodeUrl: '',
                                            enabled: true
                                        };
                                        const currentNetworks = settings.crypto?.networks || [];
                                        handleChange('crypto.networks', [...currentNetworks, newNet]);
                                    }}
                                    className="bg-brand-cyan/10 hover:bg-brand-cyan/20 text-brand-cyan text-xs font-bold py-1 px-3 h-auto"
                                >
                                    + Add Network
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {(settings.crypto?.networks || []).map((net: any, index: number) => (
                                    <div key={index} className="bg-[#0b1121] border border-white/5 rounded-xl p-4 space-y-4 relative group">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-white/10 text-white text-xs font-bold px-2 py-1 rounded">#{index + 1}</span>
                                                <input
                                                    type="text"
                                                    value={net.network}
                                                    onChange={(e) => {
                                                        const updated = [...(settings.crypto?.networks || [])];
                                                        updated[index].network = e.target.value;
                                                        handleChange('crypto.networks', updated);
                                                    }}
                                                    className="bg-transparent border-b border-white/10 focus:border-brand-cyan text-sm font-bold text-white w-24 focus:outline-none"
                                                    placeholder="Network"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        const updated = [...(settings.crypto?.networks || [])];
                                                        updated[index].enabled = !updated[index].enabled;
                                                        handleChange('crypto.networks', updated);
                                                    }}
                                                    className={`text-xs font-bold px-2 py-1 rounded transition-colors ${net.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}
                                                >
                                                    {net.enabled ? 'Active' : 'Disabled'}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const updated = [...(settings.crypto?.networks || [])];
                                                        updated.splice(index, 1);
                                                        handleChange('crypto.networks', updated);
                                                    }}
                                                    className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-slate-500">Currency</label>
                                                <input
                                                    type="text"
                                                    value={net.currency}
                                                    onChange={(e) => {
                                                        const updated = [...(settings.crypto?.networks || [])];
                                                        updated[index].currency = e.target.value;
                                                        handleChange('crypto.networks', updated);
                                                    }}
                                                    className="w-full bg-[#020617] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan/50"
                                                    placeholder="e.g. USDT"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] uppercase font-bold text-slate-500">Wallet Address</label>
                                                <input
                                                    type="text"
                                                    value={net.walletAddress}
                                                    onChange={(e) => {
                                                        const updated = [...(settings.crypto?.networks || [])];
                                                        updated[index].walletAddress = e.target.value;
                                                        handleChange('crypto.networks', updated);
                                                    }}
                                                    className="w-full bg-[#020617] border border-white/10 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-brand-cyan/50"
                                                    placeholder="0x..."
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] uppercase font-bold text-slate-500">QR Code Image</label>
                                            <div className="flex items-center gap-4">
                                                {net.qrCodeUrl ? (
                                                    <div className="w-16 h-16 bg-white rounded-lg p-1 relative group/img">
                                                        <img src={`${API_BASE_URL}${net.qrCodeUrl}`} alt="QR" className="w-full h-full object-contain" />
                                                        <button
                                                            onClick={() => {
                                                                const updated = [...(settings.crypto?.networks || [])];
                                                                updated[index].qrCodeUrl = '';
                                                                handleChange('crypto.networks', updated);
                                                            }}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/img:opacity-100 transition-opacity"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-16 bg-white/5 border border-white/10 border-dashed rounded-lg flex items-center justify-center text-slate-500">
                                                        <ImageIcon size={20} />
                                                    </div>
                                                )}

                                                <div className="flex-1">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={async (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (!file) return;

                                                            const formData = new FormData();
                                                            formData.append('image', file);

                                                            try {
                                                                const token = localStorage.getItem('token');
                                                                const res = await fetch(API_ENDPOINTS.UPLOAD, {
                                                                    method: 'POST',
                                                                    headers: {
                                                                        'Authorization': `Bearer ${token || ''}`
                                                                    },
                                                                    body: formData
                                                                });
                                                                const data = await res.json();
                                                                if (res.ok) {
                                                                    const updated = [...(settings.crypto?.networks || [])];
                                                                    updated[index].qrCodeUrl = data.filePath;
                                                                    handleChange('crypto.networks', updated);
                                                                } else {
                                                                    alert('Upload failed: ' + (data.msg || 'Unknown error'));
                                                                }
                                                            } catch (err) {
                                                                console.error(err);
                                                                alert('Upload failed');
                                                            }
                                                        }}
                                                        className="block w-full text-xs text-slate-400
                                  file:mr-4 file:py-2 file:px-4
                                  file:rounded-full file:border-0
                                  file:text-xs file:font-semibold
                                  file:bg-brand-cyan/10 file:text-brand-cyan
                                  hover:file:bg-brand-cyan/20
                                "
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {(!settings.crypto?.networks || settings.crypto?.networks.length === 0) && (
                                    <div className="text-center py-8 text-slate-500 text-sm italic">
                                        No networks configured. Click "Add Network" to start.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Payment Gateways Toggles */}
            <div className="bg-white/5 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-xl space-y-6">
                <h3 className="font-bold text-lg text-white border-b border-white/5 pb-2">Active Gateways</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-white/10 rounded-xl bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg"><Wallet size={18} /></div>
                            <span className="font-medium text-white">Crypto (USDT)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-emerald-500">Active</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-white/10 rounded-xl bg-white/5">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><CreditCard size={18} /></div>
                            <span className="font-medium text-white">Bank Transfer (VietQR)</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-xs font-bold text-emerald-500">Active</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
