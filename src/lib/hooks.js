import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
export function useRows(table, { order = 'created_at', ascending = false } = {}) {
  const [rows, setRows] = useState([]), [loading, setLoading] = useState(Boolean(supabase)), [error, setError] = useState('');
  const refresh = useCallback(async () => {
    if (!supabase) { setLoading(false); return; }
    setLoading(true);
    const { data, error } = await supabase.from(table).select('*').order(order, { ascending });
    setRows(data || []); setError(error ? 'No pudimos cargar la información.' : ''); setLoading(false);
  }, [table, order, ascending]);
  useEffect(() => { refresh(); }, [refresh]);
  return { rows, loading, error: error ? 'No pudimos cargar la información. Intenta nuevamente.' : '', refresh };
}
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => { const q = window.matchMedia('(prefers-reduced-motion: reduce)'); const fn = () => setReduced(q.matches); q.addEventListener('change', fn); return () => q.removeEventListener('change', fn); }, []);
  return reduced;
}
export const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
export const dateLabel = (date) => new Date(`${date.slice(0,10)}T12:00:00`).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
