import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API from '../api/client';
import toast from 'react-hot-toast';
import { useStore } from '../store/useStore';

export default function VerifyOtpPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { fetchUser } = useStore();

  const email = location.state?.email || '';
  const userId = location.state?.userId || '';

  const [otpBoxes, setOtpBoxes] = useState(['', '', '', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [timeLeft, setTimeLeft] = useState(600);

  const inputRefs = useRef([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCooldown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChangeBox = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newBoxes = [...otpBoxes];
    newBoxes[index] = value.slice(-1);
    setOtpBoxes(newBoxes);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpBoxes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      setOtpBoxes(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otpBoxes.join('');
    if (code.length !== 6) {
      toast.error('Please enter the full 6-digit OTP code.');
      return;
    }

    try {
      setSubmitting(true);
      await API.post('/auth/verify-otp', { email, userId, otpCode: code });
      toast.success('Account verified successfully!');
      await fetchUser();
      navigate('/app/dashboard');
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await API.post('/auth/resend-otp', { email, userId });
      toast.success('New OTP sent to your email.');
      setCooldown(60);
    } catch (err) {
    } finally {
      setResending(false);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="w-full max-w-md space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-[#1F2A37]">Verify Email OTP</h1>
        <p className="text-xs text-[#5B6778]">
          We sent a 6-digit code to <span className="font-semibold text-[#1F2A37]">{email || 'your email'}</span>
        </p>
      </div>

      <div className="p-8 rounded-2xl bg-[#F7F8FA] border border-[#D3D9E2] shadow-sm space-y-6">
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {otpBoxes.map((val, i) => (
              <input
                key={i}
                ref={el => inputRefs.current[i] = el}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={val}
                onChange={e => handleChangeBox(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                className="w-11 h-12 text-center text-lg font-bold font-mono rounded-2xl bg-[#FAFBFC] border border-[#D3D9E2] text-[#1F2A37] focus:outline-none focus:border-[#2F6FDE]"
              />
            ))}
          </div>

          <div className="text-xs text-[#5B6778] font-mono">
            Code expires in: <span className="font-bold text-[#1F2A37]">{formatTime(timeLeft)}</span>
          </div>

          <button
            type="submit"
            disabled={submitting || timeLeft === 0}
            className="w-full py-3 rounded-2xl bg-[#2F6FDE] hover:bg-[#2459B8] text-[#F7F8FA] font-semibold text-xs transition-colors shadow-sm"
          >
            {submitting ? 'Verifying...' : 'Verify OTP & Continue'}
          </button>
        </form>

        <div className="pt-4 border-t border-[#D3D9E2] flex items-center justify-between text-xs text-[#5B6778]">
          <span>Didn't receive code?</span>
          <button
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="text-[#2F6FDE] font-semibold hover:underline disabled:text-[#8792A2] cursor-pointer"
          >
            {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? 'Sending...' : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );
}
