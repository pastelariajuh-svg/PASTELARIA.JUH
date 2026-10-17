import React, { useState } from 'react';
import { Lock, X, Check, AlertCircle, KeyRound } from 'lucide-react';

interface MerchantPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MerchantPinModal: React.FC<MerchantPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234' || pin.toLowerCase() === 'admin') {
      setError(false);
      setPin('');
      onSuccess();
    } else {
      setError(true);
    }
  };

  const handleQuickKey = (num: string) => {
    if (pin.length < 6) {
      setPin((prev) => prev + num);
      setError(false);
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Acesso do Lojista</h3>
              <p className="text-[11px] text-slate-400">Voltar ao painel administrativo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-xs text-slate-300 text-center">
            Digite a senha de administrador da Pastelaria Juh (padrão: <span className="font-mono font-bold text-amber-400">1234</span>)
          </p>

          <div className="space-y-1">
            <input
              type="password"
              autoFocus
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="••••"
              className="w-full text-center tracking-[0.4em] font-mono text-2xl bg-slate-950 border border-slate-800 rounded-2xl py-3 text-amber-400 focus:outline-none focus:border-amber-400"
            />
            {error && (
              <p className="text-[11px] text-rose-400 text-center flex items-center justify-center gap-1 mt-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                Senha incorreta. Tente 1234.
              </p>
            )}
          </div>

          {/* Quick Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleQuickKey(digit)}
                className="py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-sm font-mono font-semibold transition-colors cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              className="py-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 text-xs font-semibold transition-colors cursor-pointer"
            >
              Apagar
            </button>
            <button
              type="button"
              onClick={() => handleQuickKey('0')}
              className="py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-sm font-mono font-semibold transition-colors cursor-pointer"
            >
              0
            </button>
            <button
              type="submit"
              className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              Entrar
            </button>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-white"
            >
              Continuar no Cardápio
            </button>
            <button
              type="button"
              onClick={() => {
                setPin('1234');
                setTimeout(() => {
                  setError(false);
                  onSuccess();
                }, 50);
              }}
              className="text-xs text-amber-400 hover:underline"
            >
              Entrar direto (1234)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
