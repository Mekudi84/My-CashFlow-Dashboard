import { useEffect, useRef, useState } from "react";

const reduceMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function useCountUp(target, duration = 900) {
  const [value, setValue] = useState(0);
  const fromRef = useRef(0);
  const rafRef = useRef(null);
  const startRef = useRef(0);

  useEffect(() => {
    const end = Number(target) || 0;
    if (reduceMotion()) {
      fromRef.current = end;
      setValue(end);
      return undefined;
    }
    fromRef.current = value;
    startRef.current = 0;
    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      const cur = fromRef.current + (end - fromRef.current) * eased;
      setValue(cur);
      if (p < 1) rafRef.current = requestAnimationFrame(step);
      else setValue(end);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => rafRef.current && cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration]);

  return value;
}
