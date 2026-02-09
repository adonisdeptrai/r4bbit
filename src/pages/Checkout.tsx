import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle, Copy, CreditCard, ShieldCheck, Wallet, ChevronRight, ChevronDown, Lock, AlertTriangle, ShoppingBag, Loader2, Clock, ScanLine } from 'lucide-react';
import { Button, Badge, cn } from '../components/common';
import { ViewState } from '../types';
import { useCart } from '../contexts/CartContext';
import { AnimatedBackground } from '../components/landing/AnimatedBackground';
import { API_ENDPOINTS, API_BASE_URL } from '../config/api';

// Helper to parse fee string (e.g. "~1.0") to float
const parseFee = (feeStr: string | undefined): number => {
  if (!feeStr) return 0;
  const match = feeStr.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
};

interface CheckoutProps {
  onNavigate: (view: ViewState) => void;
}

type PaymentMethod = 'CRYPTO' | 'BANK' | 'BINANCE_PAY';

export default function Checkout({ onNavigate }: CheckoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { items: cartItems, total: cartTotal, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CRYPTO');

  const [settings, setSettings] = useState<any>({
    bank: { bankId: '', accountNo: '', accountName: '' },
    exchangeRate: 25000,
    crypto: { enabled: false, networks: [] },
    binance: { apiKey: '' } // Just checking existence
  });

  React.useEffect(() => {
    fetch(API_ENDPOINTS.SETTINGS)
      .then(res => res.json())
      .then(data => setSettings(data))
      .catch(err => console.error("Failed to load settings", err));
  }, []);

  // Check for direct buy item from Shop
  const directItem = location.state?.directItem;

  // Determine items and total to show
  const checkoutItems = directItem ? [{ ...directItem, quantity: 1 }] : cartItems;
  const checkoutTotal = directItem ? directItem.price : cartTotal;

  // Generate random alphanumeric payment code on mount
  const [paymentCode] = useState(() => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No I, O, 1, 0 to avoid confusion
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `R4B ${result}`;
  });

  // Binance Pay State
  const [binanceOrder, setBinanceOrder] = useState<any>(null);
  const [binanceLoading, setBinanceLoading] = useState(false);

  // Note: We are using a dedicated OrderSuccess page now, so 'step' state is just for loading/processing
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Polling State for Bank Transfer
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationTime, setVerificationTime] = useState(0); // seconds passed
  const [remainingTime, setRemainingTime] = useState(15 * 60); // Remaining seconds (15 mins)

  // Refs for cleanup - prevents memory leaks
  const pollingCancelledRef = useRef(false);
  const pollingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup effect for polling
  useEffect(() => {
    return () => {
      pollingCancelledRef.current = true;
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  // Real-time countdown timer (updates every 1s)
  React.useEffect(() => {
    if (!isVerifying) {
      setRemainingTime(15 * 60); // Reset when not verifying
      return;
    }

    const interval = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVerifying]);

  // Crypto Logic
  const [availableNetworks, setAvailableNetworks] = useState<any[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<any>(null);

  // Initialize Networks Logic
  React.useEffect(() => {
    if (settings.crypto?.networks && settings.crypto.networks.length > 0) {
      const enabledParams = settings.crypto.networks.filter((n: any) => n.enabled);
      setAvailableNetworks(enabledParams);
      if (enabledParams.length > 0) {
        setSelectedNetwork(enabledParams[0]);
      }
    }
  }, [settings]);

  // ... rest of logic

  if (checkoutItems.length === 0) {
    // ... empty cart UI
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#020617] flex-col gap-4 relative font-sans">
        <AnimatedBackground />
        <div className="z-10 text-center">
          <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
            <ShoppingBag size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
          <p className="text-slate-400 mb-6">Add some products to get started.</p>
          <Button onClick={() => onNavigate('shop')} className="bg-brand-cyan text-black font-bold">Return to Shop</Button>
        </div>
      </div>
    );
  }



  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    // Ideally trigger a fast toast here
  };

  /* --- Payment Verification & Submission Logic --- */

  const completeOrder = async (methodStr: string) => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const userData = storedUser ? JSON.parse(storedUser) : { username: 'Guest' };

    const res = await fetch(API_ENDPOINTS.ORDERS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`
      },
      body: JSON.stringify({
        user: userData.username || 'Anonymous',
        product: checkoutItems.map(i => i.title).join(', '),
        amount: checkoutTotal,
        status: 'completed', // Verified!
        method: methodStr
      })
    });

    if (!res.ok) throw new Error('Order creation failed');

    if (!directItem) clearCart();

    navigate('/order-success', {
      state: {
        orderId: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        totalPaid: `$${checkoutTotal.toFixed(2)}`,
        paymentMethod: methodStr
      }
    });
  };

  const handleBankVerification = async () => {
    setIsVerifying(true);
    setError(null);
    pollingCancelledRef.current = false; // Reset on start

    const startTime = Date.now();
    const MAX_DURATION = 15 * 60 * 1000; // 15 minutes
    const POLL_INTERVAL = 10000; // 10 seconds

    const poll = async () => {
      // Check if cancelled (component unmounted or user cancelled)
      if (pollingCancelledRef.current) {
        return;
      }

      if (Date.now() - startTime > MAX_DURATION) {
        setIsVerifying(false);
        setError("Transaction cancelled: Verification timed out (15m).");
        return;
      }

      setVerificationTime(Math.floor((Date.now() - startTime) / 1000));

      try {
        // Calculate Expected VND Amount
        const expectedVND = Math.round(checkoutTotal * settings.exchangeRate);
        const token = localStorage.getItem('token');

        const res = await fetch(API_ENDPOINTS.AUTH_VERIFY_PAYMENT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token || ''}`
          },
          body: JSON.stringify({
            paymentCode,
            amount: expectedVND
          })
        });

        const data = await res.json();

        if (data.verified) {
          // Success! Stop polling first
          try {
            await completeOrder('Bank Transfer');
            return;
          } catch (orderErr) {
            console.error("Order creation failed after payment:", orderErr);
            setIsVerifying(false);
            setError("Payment received but failed to create order. Please contact support.");
            return;
          }
        } else {
          // Retry with ref tracking
          if (!pollingCancelledRef.current) {
            pollingTimeoutRef.current = setTimeout(poll, POLL_INTERVAL);
          }
        }

      } catch (err) {
        console.error("Verification check failed", err);
        if (!pollingCancelledRef.current) {
          pollingTimeoutRef.current = setTimeout(poll, POLL_INTERVAL);
        }
      }
    };

    poll();
  };

  const handleCreateBinanceOrder = async () => {
    setIsVerifying(true);
    setBinanceLoading(true);
    setError(null);
    pollingCancelledRef.current = false; // Reset on start

    const token = localStorage.getItem('token');

    try {
      // 1. Create Order
      const res = await fetch(API_ENDPOINTS.PAYMENT_BINANCE_CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          amount: checkoutTotal,
          productName: checkoutItems.map(i => i.title).join(', ')
        })
      });

      const data = await res.json();

      if (!data.success) throw new Error(data.message);

      setBinanceOrder(data.data);
      setBinanceLoading(false);

      // 2. Start Polling
      const POLLING_INTERVAL = 5000;
      const startTime = Date.now();

      const pollBinance = async () => {
        // Check if cancelled (component unmounted)
        if (pollingCancelledRef.current) {
          return;
        }

        if (Date.now() - startTime > 15 * 60 * 1000) { // 15 mins timeout
          setIsVerifying(false);
          setError("Payment timed out.");
          return;
        }

        try {
          const statusRes = await fetch(API_ENDPOINTS.PAYMENT_BINANCE_QUERY(data.data.orderId), {
            headers: { 'Authorization': `Bearer ${token || ''}` }
          });
          const statusData = await statusRes.json();

          if (statusData.data.status === 'PAID') {
            await completeOrder('Binance Pay (Auto)');
          } else {
            if (!pollingCancelledRef.current) {
              pollingTimeoutRef.current = setTimeout(pollBinance, POLLING_INTERVAL);
            }
          }
        } catch (e) {
          console.error("Binance Poll Error", e);
          if (!pollingCancelledRef.current) {
            pollingTimeoutRef.current = setTimeout(pollBinance, POLLING_INTERVAL);
          }
        }
      };

      pollBinance();

    } catch (err: any) {
      console.error(err);
      setBinanceLoading(false);
      setIsVerifying(false);
      setError(err.message || 'Failed to initialize Binance Pay');
    }
  };

  const handleConfirmPayment = async () => {
    setIsLoading(true);
    setError(null);

    // Bank Transfer Polling Flow
    if (paymentMethod === 'BANK') {
      handleBankVerification();
      setIsLoading(false);
      return;
    }

    // Standard Crypto Flow (Mock/Direct)
    try {
      await completeOrder('Crypto (USDT)');
    } catch (err) {
      console.error(err);
      setError('Failed to process payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying && paymentMethod === 'BANK') {
    return (
      <div className="min-h-screen bg-[#020617] font-sans relative selection:bg-brand-cyan/30 selection:text-white flex items-center justify-center p-4">
        <AnimatedBackground />

        <div className="max-w-md w-full bg-[#0b1121]/90 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/10 shadow-[0_0_50px_rgba(34,211,238,0.1)] relative overflow-hidden text-center z-10">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-cyan to-transparent"></div>

          <div className="mb-8 relative">
            <div className="w-24 h-24 mx-auto bg-brand-cyan/5 rounded-full flex items-center justify-center mb-6 relative">
              <div className="absolute inset-0 rounded-full border border-brand-cyan/20 animate-[spin_3s_linear_infinite] border-t-brand-cyan opacity-50"></div>
              <div className="absolute inset-2 rounded-full border border-brand-cyan/20 animate-[spin_2s_linear_infinite_reverse] border-t-brand-cyan opacity-50"></div>
              <div className="w-16 h-16 bg-brand-cyan/10 rounded-full flex items-center justify-center relative">
                <div className="bg-brand-cyan/20 absolute inset-0 rounded-full animate-ping"></div>
                <Loader2 size={32} className="text-brand-cyan animate-spin relative z-10" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Waiting for Payment</h2>
            <div className="flex items-center justify-center gap-2 text-brand-cyan font-mono text-xl font-bold bg-brand-cyan/5 border border-brand-cyan/10 py-1 px-4 rounded-full mx-auto w-fit">
              <Clock size={16} />
              <span>{Math.floor(remainingTime / 60).toString().padStart(2, '0')}:{(remainingTime % 60).toString().padStart(2, '0')}</span>
            </div>
            <p className="text-slate-400 text-sm mt-4 leading-relaxed">
              Please scan the QR code below to complete your transfer. <br />
              The system will automatically verify your payment.
            </p>
          </div>

          <div className="bg-[#020617]/50 rounded-2xl p-6 border border-white/5 mb-8">
            <div className="bg-white p-3 rounded-xl inline-block shadow-lg mb-6">
              <img
                src={`https://img.vietqr.io/image/${settings.bank.bankId}-${settings.bank.accountNo}-compact2.png?amount=${Math.round(checkoutTotal * settings.exchangeRate)}&addInfo=${encodeURIComponent(paymentCode)}&accountName=${encodeURIComponent(settings.bank.accountName)}`}
                alt="VietQR"
                className="w-48 h-auto mix-blend-multiply"
              />
            </div>

            <div className="space-y-4 text-left">
              <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Amount</span>
                <span className="text-lg font-bold text-green-400 font-mono">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(checkoutTotal * settings.exchangeRate)}
                </span>
              </div>

              <div
                className="flex justify-between items-center p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl group cursor-pointer hover:bg-blue-500/20 transition-all"
                onClick={() => handleCopy(paymentCode)}
              >
                <div className="flex flex-col">
                  <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1">Transfer Content</span>
                  <code className="font-mono font-bold text-blue-300 text-lg">{paymentCode}</code>
                </div>
                <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 group-hover:text-white transition-colors">
                  <Copy size={16} />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsVerifying(false)}
            className="text-slate-500 hover:text-white text-sm font-bold transition-colors py-2 flex items-center justify-center gap-2 mx-auto group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Cancel & Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] font-sans pb-20 relative selection:bg-brand-cyan/30 selection:text-white">
      <AnimatedBackground />

      {/* Header */}
      <div className="bg-[#020617]/80 backdrop-blur-md border-b border-white/5 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <button onClick={() => onNavigate('shop')} className="flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors group">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-3 group-hover:bg-brand-cyan/20 group-hover:text-brand-cyan transition-all border border-white/5">
              <ArrowLeft size={16} />
            </div>
            Back
          </button>

          <div className="flex items-center gap-3">
            <span className="text-white font-bold text-lg hidden sm:block">Checkout</span>
            <div className="h-4 w-px bg-white/10 hidden sm:block"></div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <Lock size={12} fill="currentColor" /> Encrypted
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

        {/* Left Col: Payment Selection */}
        <div className="lg:col-span-8 space-y-6">

          {/* Steps Indicator (Optional polish) */}
          <div className="flex items-center gap-4 mb-4 text-sm text-slate-500">
            <span className="flex items-center gap-2 text-brand-cyan font-bold"><span className="w-6 h-6 rounded-full bg-brand-cyan text-black flex items-center justify-center text-xs">1</span> Payment</span>
            <span className="w-10 h-px bg-white/10"></span>
            <span className="flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs">2</span> Confirmation</span>
          </div>

          {/* Payment Methods */}
          <div className="bg-[#0b1121]/50 backdrop-blur-xl rounded-[2rem] border border-white/10 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-white/5">
              <h3 className="font-bold text-xl text-white mb-6">Choose Payment Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('CRYPTO')}
                  className={cn(
                    "relative flex items-center p-4 rounded-2xl border transition-all duration-300 text-left bg-[#020617]/50 group",
                    paymentMethod === 'CRYPTO'
                      ? "border-brand-cyan ring-1 ring-brand-cyan/50 shadow-[0_0_20px_rgba(34,211,238,0.1)] bg-brand-cyan/5"
                      : "border-white/5 hover:border-white/20 text-slate-400 hover:bg-white/5"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-xl mr-4 flex items-center justify-center transition-colors shrink-0", paymentMethod === 'CRYPTO' ? "bg-brand-cyan/20 text-brand-cyan" : "bg-black/40 text-slate-500")}>
                    <Wallet size={24} />
                  </div>
                  <div>
                    <span className={cn("block font-bold text-sm md:text-base transition-colors", paymentMethod === 'CRYPTO' ? "text-white" : "text-slate-400 group-hover:text-white")}>Crypto (USDT)</span>
                    <span className="text-xs text-slate-500 font-mono">Automatic</span>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('BANK')}
                  className={cn(
                    "relative flex items-center p-4 rounded-2xl border transition-all duration-300 text-left bg-[#020617]/50 group",
                    paymentMethod === 'BANK'
                      ? "border-brand-cyan ring-1 ring-brand-cyan/50 shadow-[0_0_20px_rgba(34,211,238,0.1)] bg-brand-cyan/5"
                      : "border-white/5 hover:border-white/20 text-slate-400 hover:bg-white/5"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-xl mr-4 flex items-center justify-center transition-colors shrink-0", paymentMethod === 'BANK' ? "bg-brand-cyan/20 text-brand-cyan" : "bg-black/40 text-slate-500")}>
                    <CreditCard size={24} />
                  </div>
                  <div>
                    <span className={cn("block font-bold text-sm md:text-base transition-colors", paymentMethod === 'BANK' ? "text-white" : "text-slate-400 group-hover:text-white")}>Bank Transfer</span>
                    <span className="text-xs text-slate-500 font-mono">Manual Check</span>
                  </div>
                </button>
              </div>

              {/* Binance Pay Option */}
              <button
                onClick={() => setPaymentMethod('BINANCE_PAY')}
                className={cn(
                  "relative flex items-center p-4 rounded-2xl border transition-all duration-300 text-left bg-[#020617]/50 group mt-4",
                  paymentMethod === 'BINANCE_PAY'
                    ? "border-[#F3BA2F] ring-1 ring-[#F3BA2F]/50 shadow-[0_0_20px_rgba(243,186,47,0.1)] bg-[#F3BA2F]/5"
                    : "border-white/5 hover:border-white/20 text-slate-400 hover:bg-white/5"
                )}
              >
                <div className={cn("w-12 h-12 rounded-xl mr-4 flex items-center justify-center transition-colors shrink-0", paymentMethod === 'BINANCE_PAY' ? "bg-[#F3BA2F]/20 text-[#F3BA2F]" : "bg-black/40 text-slate-500")}>
                  <ScanLine size={24} />
                </div>
                <div>
                  <span className={cn("block font-bold text-sm md:text-base transition-colors", paymentMethod === 'BINANCE_PAY' ? "text-white" : "text-slate-400 group-hover:text-white")}>Binance Pay</span>
                  <span className="text-xs text-slate-500 font-mono">Auto Confirmation (Recommended)</span>
                </div>
                {/* Recommended Badge */}
                <div className="absolute top-4 right-4">
                  <Badge className="bg-[#F3BA2F]/20 text-[#F3BA2F] border-[#F3BA2F]/30 text-[10px]">FASTEST</Badge>
                </div>
              </button>
            </div>

            {/* Details Area */}
            <div className="p-6 md:p-8 bg-[#020617]/30">
              <AnimatePresence mode="wait">
                {paymentMethod === 'CRYPTO' ? (
                  <motion.div
                    key="crypto"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col md:flex-row gap-8 items-center md:items-start"
                  >
                    <div className="w-56 h-56 bg-white p-4 rounded-2xl shrink-0 shadow-[0_0_40px_rgba(34,211,238,0.15)] border-4 border-white/10 relative group">
                      <div className="absolute inset-0 bg-brand-cyan/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="w-full h-full bg-white rounded-xl flex items-center justify-center relative overflow-hidden z-10">
                        {/* Priority: Manual Image QR -> Static Wallet QR */}
                        {selectedNetwork?.qrCodeUrl ? (
                          <img
                            src={`${API_BASE_URL}${selectedNetwork.qrCodeUrl}`}
                            className="w-full h-full object-contain"
                            alt="Payment QR"
                          />
                        ) : selectedNetwork?.walletAddress ? (
                          <QRCodeCanvas
                            value={selectedNetwork.walletAddress}
                            size={192}
                            level={"H"}
                            includeMargin={true}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <ScanLine size={48} className="mb-2 opacity-50" />
                            <span className="text-xs">No QR Code</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex-1 space-y-6 w-full">
                      <div className="bg-brand-cyan/5 border border-brand-cyan/10 p-4 rounded-xl flex items-start gap-3 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-cyan"></div>
                        <AlertTriangle size={18} className="text-brand-cyan shrink-0 mt-0.5" />
                        <div className="space-y-1">
                          <p className="text-sm text-brand-cyan/90 leading-relaxed font-medium">
                            Please ensure we receive exactly <strong className="text-white text-lg font-bold">{checkoutTotal.toFixed(2)} {selectedNetwork?.currency || 'USDT'}</strong>
                          </p>
                        </div>
                      </div>

                      {/* Network Selection */}
                      {availableNetworks.length > 1 && (
                        <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Select Network</label>
                          <div className="relative">
                            <select
                              value={selectedNetwork?.network}
                              onChange={(e) => {
                                const net = availableNetworks.find((n: any) => n.network === e.target.value);
                                if (net) setSelectedNetwork(net);
                              }}
                              className="w-full appearance-none bg-[#0b1121] border border-white/10 focus:border-brand-cyan/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-all cursor-pointer"
                            >
                              {availableNetworks.map((net: any) => (
                                <option key={net.network} value={net.network}>{net.network} ({net.currency})</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                          </div>
                        </div>
                      )}

                      {/* Manual Address Fallback */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Wallet Address ({selectedNetwork?.network || '...'})</label>
                        <div className="flex items-center gap-3 bg-[#0b1121] p-1.5 rounded-xl border border-white/10 group hover:border-brand-cyan/50 transition-all shadow-inner">
                          <div className="pl-4 py-2 flex-1 font-mono text-sm text-slate-300 truncate tracking-wide">
                            {selectedNetwork?.walletAddress || 'Loading...'}
                          </div>
                          <Button
                            onClick={() => handleCopy(selectedNetwork?.walletAddress || '')}
                            className="bg-white/5 hover:bg-white/10 text-white rounded-lg h-9 px-4 text-xs font-bold"
                          >
                            <Copy size={14} className="mr-2" /> Copy
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-sm text-slate-400 font-medium">Amount to Pay</span>
                          <span className="text-sm text-white font-bold">${checkoutTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="bank"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {/* Left: QR Code box */}
                    <div className="bg-white p-2 rounded-2xl shadow-xl flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                      {settings.bank.bankId && settings.bank.accountNo ? (
                        <div className="relative w-full h-full flex items-center justify-center">
                          {/* Removed glow effect for cleaner look */}
                          <img
                            src={`https://img.vietqr.io/image/${settings.bank.bankId}-${settings.bank.accountNo}-compact2.png?amount=${(checkoutTotal * settings.exchangeRate).toFixed(0)}&addInfo=${encodeURIComponent(paymentCode)}&accountName=${encodeURIComponent(settings.bank.accountName)}`}
                            alt="VietQR"
                            className="w-full max-w-[380px] h-auto mix-blend-multiply"
                          />
                        </div>
                      ) : (
                        <div className="p-8 text-slate-400">
                          <AlertTriangle size={48} className="mx-auto mb-2 opacity-50" />
                          <p>Bank settings not configured.</p>
                        </div>
                      )}
                    </div>

                    {/* Right: Banking Details */}
                    <div className="bg-[#0b1121] border border-white/10 p-5 rounded-2xl flex flex-col justify-center h-full">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                          <CreditCard size={16} />
                        </div>
                        <h4 className="text-sm font-bold text-white">Banking Details</h4>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer" onClick={() => handleCopy(settings.bank.bankId)}>
                          <span className="text-xs text-slate-500 font-medium">Bank</span>
                          <span className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{settings.bank.bankId || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl transition-colors cursor-default">
                          <span className="text-xs text-slate-500 font-medium">Amount</span>
                          <div className="text-right">
                            <p className="text-sm font-bold text-green-400">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(checkoutTotal * settings.exchangeRate)}</p>
                            <p className="text-[10px] text-slate-400">({checkoutTotal.toFixed(2)} USD)</p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer" onClick={() => handleCopy(settings.bank.accountNo)}>
                          <span className="text-xs text-slate-500 font-medium">Account No.</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono font-bold text-white group-hover:text-blue-300 transition-colors">{settings.bank.accountNo || 'N/A'}</span>
                            <Copy size={12} className="text-slate-600 group-hover:text-blue-400" />
                          </div>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer" onClick={() => handleCopy(settings.bank.accountName)}>
                          <span className="text-xs text-slate-500 font-medium">Beneficiary</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{settings.bank.accountName || 'N/A'}</span>
                            <Copy size={12} className="text-slate-600 group-hover:text-blue-400" />
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-5 border-t border-white/10">
                        <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block mb-2">Transfer Content (Memo)</label>
                        <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl cursor-pointer hover:bg-blue-500/20 transition-colors group" onClick={() => handleCopy(paymentCode)}>
                          <code className="text-base font-bold text-blue-300 font-mono tracking-wide">{paymentCode}</code>
                          <div className="bg-blue-500/20 p-1.5 rounded-lg text-blue-400 group-hover:text-white transition-colors">
                            <Copy size={14} />
                          </div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 text-center">Please enter the exact content above for automatic processing.</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Col: Summary */}
        <div className="lg:col-span-4 mt-10">
          <div className="sticky top-28 space-y-4">
            <div className="bg-[#0b1121]/90 backdrop-blur-xl rounded-[2rem] p-6 border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-cyan to-transparent opacity-50"></div>

              <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-lg">Order Summary</h3>

              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/10 hover:scrollbar-thumb-white/20">
                {checkoutItems.map(item => (
                  <div key={item.id} className="flex gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="w-12 h-12 bg-black rounded-lg shrink-0 overflow-hidden border border-white/10">
                      <img src={item.image} alt="" className="w-full h-full object-cover opacity-80" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-white truncate line-clamp-1" title={item.title}>{item.title}</h4>
                      <div className="flex justify-between items-baseline mt-1">
                        <span className="text-[10px] text-slate-400">Qty: {item.quantity || 1}</span>
                        <span className="text-sm font-bold text-brand-cyan">${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 py-4 border-t border-white/5 border-dashed">
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Subtotal</span>
                  <span>${checkoutTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-400">
                  <span>Taxes & Fees</span>
                  <span className="text-white font-bold">$0.00</span>
                </div>
              </div>

              <div className="bg-[#020617] rounded-xl p-4 mb-6 border border-white/5">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Total</span>
                  <span className="text-2xl font-bold text-white tracking-tight">${checkoutTotal.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handleConfirmPayment}
                className="w-full bg-brand-cyan text-black hover:bg-[#5ff5ff] shadow-[0_0_25px_rgba(34,211,238,0.3)] hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] h-14 rounded-2xl text-base font-bold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group overflow-hidden relative"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">Processing...</span>
                ) : (
                  <>
                    <span className="relative z-10 flex items-center justify-center gap-2">Confirm Payment <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 backdrop-blur-sm"></div>
                  </>
                )}
              </Button>

              {error && <p className="text-red-400 text-xs text-center mt-3 bg-red-500/10 p-2 rounded-lg border border-red-500/20">{error}</p>}
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest bg-white/5 py-3 rounded-xl border border-white/5">
              <ShieldCheck size={14} className="text-green-500" /> 256-bit Secure Encryption
            </div>
          </div>
        </div >

      </div >
    </div >
  );
}