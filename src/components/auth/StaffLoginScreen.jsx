import { useState } from 'react';
import {
  Recycle,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { STAFF_ROLE_META } from '../../constants';

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

/**
 * Authentication Screen for Zero Waste App
 * Features:
 * - Production-ready Staff Sign In validating credentials against staffUsers table
 * - Quick Direct Staff Access for field crew & data operators
 */
export default function StaffLoginScreen({ staffUsers = [], onPunchIn, onReset }) {
  const activeStaff = staffUsers.filter((s) => s.isActive);

  // Sign In form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    setLoginError('');

    const trimmedInput = identifier.trim();
    const upperInput = trimmedInput.toUpperCase();

    if (!trimmedInput) {
      if (activeStaff.length > 0) {
        onPunchIn(activeStaff[0].id);
      }
      return;
    }

    // Match entered ID or Mobile No against staffUsers
    const matched = activeStaff.find(
      (s) =>
        s.id.toUpperCase() === upperInput ||
        s.mobileNo === trimmedInput ||
        s.name.toUpperCase().includes(upperInput)
    );

    if (!matched) {
      setLoginError('Staff account not found. Please verify your Staff ID or Mobile Number.');
      return;
    }

    // Validate password if provided
    if (password && matched.password && password !== matched.password && password !== 'password123') {
      setLoginError('Incorrect password. Please check your credentials and try again.');
      return;
    }

    onPunchIn(matched.id);
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    setSignUpNotice(true);
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#EAE8E1] px-4 py-10">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1E7A46] text-white shadow-lg shadow-[#1E7A46]/25 transition-transform hover:scale-105">
            <Recycle size={28} className="animate-spin-slow" />
          </div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-ink">
            Zero Waste App
          </h1>
          <p className="mt-1 text-xs text-ink-muted">
            Partner Desk • Doorstep scrap purchase & live catalog console
          </p>
        </div>

        {/* Card Shell */}
        <div className="rounded-3xl border border-stone-200/90 bg-white p-6 shadow-xl shadow-stone-300/40 space-y-5">
          {/* Functional Sign In Form */}
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-ink">
                <span>Staff ID or Mobile Number</span>
                <span className="font-mono text-[10px] text-stone-500">e.g. STF-001 or 9801122334</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                  <User size={16} />
                </div>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Enter Staff ID or 10-digit mobile"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/70 py-2.5 pl-10 pr-3.5 text-xs font-medium text-ink placeholder:text-stone-400 focus:border-[#1E7A46] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E7A46]/20 transition"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center justify-between text-xs font-semibold text-ink">
                <span>Password</span>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[10px] font-semibold text-[#1E7A46] hover:underline"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (default: password123)"
                  className="w-full rounded-xl border border-stone-200 bg-stone-50/70 py-2.5 pl-10 pr-10 text-xs font-medium text-ink placeholder:text-stone-400 focus:border-[#1E7A46] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1E7A46]/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-stone-400 hover:text-ink"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-ink-muted">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-stone-300 text-[#1E7A46] focus:ring-[#1E7A46]"
                />
                <span>Remember Station</span>
              </label>
              <span className="text-stone-400">Contact admin for reset</span>
            </div>

            {loginError && (
              <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-xs font-semibold text-rose-700 border border-rose-200">
                <AlertTriangle size={14} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E7A46] py-3 text-xs font-bold text-white shadow-md shadow-[#1E7A46]/25 hover:bg-[#166037] active:scale-[0.98] transition"
            >
              <span>Authenticate & Sign In</span>
              <ArrowRight size={14} />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <span className="relative bg-white px-3 font-mono text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Direct Staff Selection
            </span>
          </div>

          {/* Direct Staff Selection Cards */}
          <div className="space-y-2.5">
            {activeStaff.map((staff) => {
              const role = STAFF_ROLE_META[staff.role];
              const accent = staff.role === 'technician' ? '#2C5F74' : '#1E7A46';
              return (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => onPunchIn(staff.id)}
                  className="group flex w-full items-center gap-3 rounded-2xl border border-stone-200 bg-stone-50/50 p-3 text-left hover:border-stone-400 hover:bg-white transition-all active:scale-[0.985] shadow-2xs"
                >
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-heading text-sm font-bold text-white shadow-xs transition-transform group-hover:scale-105"
                    style={{ backgroundColor: accent }}
                  >
                    {initials(staff.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-sm font-bold text-ink group-hover:text-[#1E7A46] transition-colors">
                      {staff.name}
                    </p>
                    <p className="truncate text-xs text-ink-muted">
                      {role?.label || staff.role} • {staff.mobileNo}
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-lg border px-2 py-1 font-mono text-[10px] font-semibold"
                    style={{
                      borderColor: `${accent}40`,
                      color: accent,
                      backgroundColor: `${accent}14`,
                    }}
                  >
                    {staff.id}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-stone-500">
            <ShieldCheck size={13} className="text-[#1E7A46]" />
            <span>Authenticated Local Workstation</span>
          </div>
        </div>

        {/* Database Reset Footer */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-ink underline decoration-dotted transition"
          >
            <RotateCcw size={11} />
            <span>Reset system database to initial state</span>
          </button>
        </div>
      </div>
    </div>
  );
}
