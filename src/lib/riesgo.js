export function obtenerNivelRiesgo(score) {
  if (score === null || score === undefined || Number.isNaN(Number(score))) return null;
  const n = Number(score);
  if (n < 40) return 'bajo';
  if (n < 70) return 'medio';
  return 'alto';
}

export const ESTILO_RIESGO = {
  bajo:  { texto: 'text-emerald-400', chip: 'bg-emerald-950 text-emerald-400 border-emerald-800/70',  hex: '#10b981' },
  medio: { texto: 'text-amber-400',   chip: 'bg-amber-950 text-amber-400 border-amber-800/70',        hex: '#f59e0b' },
  alto:  { texto: 'text-red-400',     chip: 'bg-red-950 text-red-400 border-red-800/70',              hex: '#ef4444' },
  ninguno: { texto: 'text-slate-500', chip: 'bg-slate-800 text-slate-400 border-slate-700',           hex: '#64748b' }
};

export const estiloRiesgo = (score) => ESTILO_RIESGO[obtenerNivelRiesgo(score) || 'ninguno'];
