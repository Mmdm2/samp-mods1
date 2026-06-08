import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Zap, Phone, Lock, ArrowRight, Shield, ChevronRight } from 'lucide-react';

type Step = 'phone' | 'otp';

export default function Login() {
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoMode, setDemoMode] = useState(false);

  const fullPhone = `+98${phone.replace(/^0/, '')}`;

  async function sendOTP() {
    if (!phone || phone.length < 10) {
      setError('شماره موبایل را کامل وارد کنید');
      return;
    }
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
    if (error) {
      if (error.message.includes('SMS') || error.message.includes('phone') || error.message.includes('Twilio')) {
        setDemoMode(true);
        setError('');
        setStep('otp');
      } else {
        setError(error.message);
      }
    } else {
      setStep('otp');
    }
    setLoading(false);
  }

  async function verifyOTP() {
    if (!otp || otp.length < 4) {
      setError('کد تأیید را وارد کنید');
      return;
    }
    setLoading(true);
    setError('');

    if (demoMode) {
      // Demo login fallback using email/password
      const email = `${phone.replace(/\D/g, '')}@samp.tools`;
      const password = otp + 'samp2024';
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) {
        const { error: signUpErr } = await supabase.auth.signUp({ email, password });
        if (signUpErr) setError('خطا در ورود: ' + signUpErr.message);
      }
    } else {
      const { error } = await supabase.auth.verifyOtp({ phone: fullPhone, token: otp, type: 'sms' });
      if (error) setError(error.message);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-dark-400 grid-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-orange-glow pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

      {/* GTA-style decorative elements */}
      <div className="absolute top-10 left-10 w-32 h-32 border border-orange-500/10 rounded-full" />
      <div className="absolute top-10 left-10 w-16 h-16 border border-orange-500/20 rounded-full" />
      <div className="absolute bottom-20 right-20 w-40 h-40 border border-orange-500/10 rounded-full" />

      <div className="w-full max-w-md relative">
        {/* Logo header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/30 mb-4 animate-glow-pulse">
            <Zap size={36} className="text-orange-500" />
          </div>
          <h1 className="font-orbitron font-black text-3xl text-white tracking-widest mb-1">
            SAMP TOOLS
          </h1>
          <p className="text-orange-500 font-rajdhani tracking-[0.3em] text-sm">@XchoR MMD</p>
          <p className="text-gray-500 text-xs font-rajdhani mt-2">ابزار حرفه‌ای GTA San Andreas Multiplayer</p>
        </div>

        {/* Card */}
        <div className="bg-dark-200 border border-dark-50 rounded-2xl p-7 glow-border animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {step === 'phone' ? (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <Phone size={18} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="font-rajdhani font-bold text-white text-lg">ورود با شماره موبایل</h2>
                  <p className="text-xs text-gray-500 font-rajdhani">کد تأیید به شماره شما ارسال می‌شود</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-rajdhani tracking-wider mb-2 block">شماره موبایل ایران</label>
                  <div className="flex gap-2">
                    <div className="flex items-center gap-2 bg-dark-300 border border-dark-50 rounded-lg px-3 py-2.5 text-sm font-rajdhani text-orange-400 shrink-0">
                      🇮🇷 +98
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
                      placeholder="09123456789"
                      className="input-dark flex-1"
                      dir="ltr"
                      onKeyDown={e => e.key === 'Enter' && sendOTP()}
                    />
                  </div>
                  <p className="text-[11px] text-gray-600 mt-1 font-rajdhani">مثال: 09123456789</p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-xs font-rajdhani">
                    {error}
                  </div>
                )}

                <button
                  onClick={sendOTP}
                  disabled={loading}
                  className="btn-orange w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>ارسال کد تأیید <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <Lock size={18} className="text-orange-500" />
                </div>
                <div>
                  <h2 className="font-rajdhani font-bold text-white text-lg">تأیید کد OTP</h2>
                  <p className="text-xs text-gray-500 font-rajdhani">
                    {demoMode ? 'کد دلخواه وارد کنید (حداقل 4 رقم)' : `کد ارسالی به ${fullPhone}`}
                  </p>
                </div>
              </div>

              {demoMode && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-2 mb-4 text-orange-300 text-xs font-rajdhani">
                  <Shield size={12} className="inline ml-1" />
                  حالت دمو: SMS تنظیم نشده. یک رمز دلخواه (4+ رقم) وارد کنید تا اکانت ساخته شود.
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 font-rajdhani tracking-wider mb-2 block">
                    {demoMode ? 'رمز عبور شما' : 'کد 6 رقمی'}
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder={demoMode ? '1234' : '123456'}
                    className="input-dark text-center text-2xl tracking-[0.5em] font-orbitron"
                    dir="ltr"
                    onKeyDown={e => e.key === 'Enter' && verifyOTP()}
                  />
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-xs font-rajdhani">
                    {error}
                  </div>
                )}

                <button
                  onClick={verifyOTP}
                  disabled={loading}
                  className="btn-orange w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>تأیید و ورود <ChevronRight size={16} /></>
                  )}
                </button>

                <button
                  onClick={() => { setStep('phone'); setError(''); setOtp(''); }}
                  className="w-full text-center text-xs text-gray-500 hover:text-orange-400 transition-colors font-rajdhani"
                >
                  ← بازگشت و تغییر شماره
                </button>
              </div>
            </>
          )}

          {/* Steps indicator */}
          <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-dark-50">
            <div className={`w-2 h-2 rounded-full transition-colors ${step === 'phone' ? 'bg-orange-500' : 'bg-orange-500'}`} />
            <div className={`w-8 h-px transition-colors ${step === 'otp' ? 'bg-orange-500' : 'bg-dark-50'}`} />
            <div className={`w-2 h-2 rounded-full transition-colors ${step === 'otp' ? 'bg-orange-500' : 'bg-dark-50'}`} />
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-600 mt-6 font-rajdhani">
          ساخته شده توسط <span className="text-orange-500">@XchoR MMD</span> • GTA SA/SAMP Tools v2.0
        </p>
      </div>
    </div>
  );
}
