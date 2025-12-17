import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import { sha256 } from './utils/crypto';
import { AppState, FormData } from './types';
import { TerminalInput } from './components/TerminalInput';
import { ShareCard } from './components/ShareCard';
import { Lock, Unlock, AlertTriangle, ShieldAlert } from 'lucide-react';

// In this environment, we cannot import images as modules. 
// We reference the file path directly as a string.
const logo = '/logo.png';

const REWARD_LIMIT = 50;

// Layout component moved outside App to prevent recreation on state changes
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="relative min-h-screen bg-terminal-black overflow-hidden font-mono text-terminal-green flex flex-col items-center justify-center p-6 selection:bg-terminal-green selection:text-terminal-black">
    {/* Content Layer */}
    <div className="relative z-10 w-full flex flex-col items-center">
      {children}
    </div>
  </div>
);

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LOCKED);
  const [secretInput, setSecretInput] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    roll: '',
    email: ''
  });
  const [formError, setFormError] = useState('');
  const [userRank, setUserRank] = useState<number>(1);

  // Initial check for reward availability
  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    try {
      const { count, error } = await supabase
        .from('claims')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error("Error checking availability:", error);
        return;
      }

      if (count !== null && count >= REWARD_LIMIT) {
        setAppState(AppState.EXHAUSTED);
      }
    } catch (err) {
      console.error("System error:", err);
    }
  };

  const handleSecretSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');
    setIsValidating(true);

    try {
      const inputHash = await sha256(secretInput);

      // Query Supabase to see if this hash exists in the secrets table
      const { data, error } = await supabase
        .from('secrets')
        .select('hash')
        .eq('hash', inputHash)
        .single();

      if (error || !data) {
        setValidationError('ACCESS DENIED: INVALID PASSCODE');
        setSecretInput(''); // Clear input on failure for effect
      } else {
        // Double check limit before unlocking
        const { count } = await supabase
          .from('claims')
          .select('*', { count: 'exact', head: true });

        if (count !== null && count >= REWARD_LIMIT) {
          setAppState(AppState.EXHAUSTED);
        } else {
          setAppState(AppState.UNLOCKED);
        }
      }
    } catch (err) {
      setValidationError('SYSTEM ERROR: VERIFICATION FAILED');
    } finally {
      setIsValidating(false);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    // Validate inputs locally first
    if (!formData.name.trim() || !formData.roll.trim() || !formData.email.trim()) {
      setFormError('MISSING REQUIRED FIELDS');
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Check limit again (Race condition mitigation)
      const { count } = await supabase
        .from('claims')
        .select('*', { count: 'exact', head: true });

      if (count !== null && count >= REWARD_LIMIT) {
        setAppState(AppState.EXHAUSTED);
        return;
      }

      // 2. Attempt Insert
      const { error } = await supabase
        .from('claims')
        .insert([
          {
            name: formData.name.trim(),
            roll: formData.roll.trim(),
            email: formData.email.trim()
          }
        ]);

      if (error) {
        if (error.code === '23505') { // Postgres Unique Violation code
          setFormError(`ERROR: ROLL NUMBER ${formData.roll} ALREADY REGISTERED`);
        } else {
          setFormError(`DB ERROR: ${error.message}`);
        }
      } else {
        // Calculate rank (current count + 1 since we just inserted)
        setUserRank((count ?? 0) + 1);
        setAppState(AppState.SUCCESS);
      }
    } catch (err) {
      setFormError('FATAL ERROR: TRANSACTION FAILED');
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER HELPERS ---

  const renderHeader = () => (
    <div className="w-full max-w-lg mb-12 text-center">
      <div className="inline-block p-4 border-2 border-terminal-green rounded-sm mb-6 animate-fade-in relative bg-terminal-black/80 backdrop-blur-sm">
        <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-terminal-green"></div>
        <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-terminal-green"></div>

        <div className="flex justify-center mb-4">
          <img
            src={logo}
            alt="Logo"
            className="w-20 h-20 md:w-24 md:h-24 drop-shadow-[0_0_10px_rgba(0,255,65,0.5)]"
            style={{ filter: 'hue-rotate(120deg) saturate(2) brightness(1.2)' }}
          />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter glitch-effect text-terminal-green">
          HIDDEN PROTOCOL
        </h1>
        <p className="text-terminal-dim text-sm mt-2 tracking-widest uppercase">
          Freshers Intro 2025
        </p>
      </div>
    </div>
  );

  if (appState === AppState.EXHAUSTED) {
    return (
      <Layout>
        {renderHeader()}
        <div className="border border-terminal-red p-8 max-w-md w-full text-center bg-terminal-black/90 backdrop-blur">
          <ShieldAlert size={64} className="mx-auto text-terminal-red mb-4" />
          <h2 className="text-2xl font-bold text-terminal-red mb-2">REWARDS EXHAUSTED</h2>
          <p className="text-terminal-dim">
            The maximum number of claims has been reached.
          </p>
          <p className="mt-4 text-xs text-terminal-red animate-pulse">
            [ SYSTEM LOCKDOWN INITIATED ]
          </p>
        </div>
      </Layout>
    );
  }

  if (appState === AppState.SUCCESS) {
    return (
      <Layout>
        <ShareCard name={formData.name} rank={userRank} />
      </Layout>
    );
  }

  if (appState === AppState.UNLOCKED) {
    return (
      <Layout>
        {renderHeader()}
        <div className="w-full max-w-md animate-fade-in bg-terminal-black/50 p-6 rounded border border-terminal-dim/20 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6 text-terminal-green border-b border-terminal-dim/30 pb-2">
            <Unlock size={20} />
            <h2 className="text-xl font-bold">IDENTITY VERIFICATION</h2>
          </div>

          <form onSubmit={handleClaimSubmit}>
            <TerminalInput
              label="FULL NAME"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="ENTER NAME"
            />
            <TerminalInput
              label="COLLEGE ID"
              value={formData.roll}
              onChange={(e) => setFormData({ ...formData, roll: e.target.value })}
              placeholder="UNIQUE ID"
            />
            <TerminalInput
              label="EMAIL ADDRESS"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="CONTACT EMAIL"
            />

            {formError && (
              <div className="mb-4 p-3 border border-terminal-red bg-terminal-red/10 flex items-start gap-3">
                <AlertTriangle className="text-terminal-red shrink-0" size={20} />
                <p className="text-terminal-red text-sm font-bold">{formError}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                w-full py-3 px-4 mt-4 font-bold tracking-widest uppercase border-2
                transition-all duration-200
                ${isSubmitting
                  ? 'border-terminal-dim text-terminal-dim cursor-not-allowed'
                  : 'border-terminal-green text-terminal-black bg-terminal-green hover:bg-transparent hover:text-terminal-green'
                }
              `}
            >
              {isSubmitting ? 'PROCESSING...' : 'SUBMIT CLAIM'}
            </button>
          </form>
        </div>
      </Layout>
    );
  }

  // DEFAULT: LOCKED STATE
  return (
    <Layout>
      {renderHeader()}

      <div className="w-full max-w-md bg-terminal-black/50 p-6 rounded border border-terminal-dim/20 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-6 text-terminal-dim">
          <Lock size={20} />
          <h2 className="text-xl font-bold">SECURE GATEWAY</h2>
        </div>

        <form onSubmit={handleSecretSubmit}>
          <TerminalInput
            label="ENTER PASSCODE"
            type="password"
            value={secretInput}
            onChange={(e) => setSecretInput(e.target.value)}
            placeholder=".....?"
            error={validationError}
            disabled={isValidating}
            autoFocus
          />

          <button
            type="submit"
            disabled={isValidating || !secretInput}
            className={`
              w-full py-3 px-4 font-bold tracking-widest uppercase border-2
              transition-all duration-200
              ${isValidating || !secretInput
                ? 'border-terminal-dim text-terminal-dim cursor-not-allowed opacity-50'
                : 'border-terminal-green text-terminal-green hover:bg-terminal-green hover:text-terminal-black'
              }
            `}
          >
            {isValidating ? 'DECRYPTING...' : 'AUTHENTICATE'}
          </button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-xs text-terminal-dim animate-pulse">
            System Status: ONLINE <span className="mx-2">|</span> Encryption: SHA-256
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default App;
