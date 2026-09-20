import { useCallback, useEffect, useRef, useState } from 'react';

/** Chạy một hàm async khi deps đổi; trả về {data, loading, error, reload}. */
export default function useAsync(fn, deps, initial = null) {
  const [state, setState] = useState({ data: initial, loading: true, error: null });
  const seq = useRef(0);

  const run = useCallback(() => {
    const id = ++seq.current;
    setState((s) => ({ ...s, loading: true, error: null }));
    Promise.resolve()
      .then(fn)
      .then((data) => id === seq.current && setState({ data, loading: false, error: null }))
      .catch((error) => id === seq.current && setState((s) => ({ ...s, loading: false, error })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => { run(); }, [run]);
  return { ...state, reload: run };
}
