import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 滚动 → 当前站点 + 全程进度（0..1）的状态机。
 * 每个站点 section 通过 registerRef(i) 注册 DOM 节点；
 * 以视口中线判定当前站点，站内进度插值出时间线光点位置。
 */
export function useStepProgress(count: number) {
  const refs = useRef<(HTMLElement | null)[]>([]);
  const [active, setActive] = useState(-1);
  const [fraction, setFraction] = useState(0);
  const raf = useRef(0);

  const registerRef = useCallback((i: number) => (el: HTMLElement | null) => {
    refs.current[i] = el;
  }, []);

  const measure = useCallback(() => {
    const mid = window.innerHeight * 0.55;
    const els = refs.current;
    let act = -1;
    let intra = 0;
    for (let i = 0; i < els.length; i++) {
      const el = els[i];
      if (!el) continue;
      const r = el.getBoundingClientRect();
      if (r.top <= mid && r.bottom > mid) {
        act = i;
        intra = (mid - r.top) / r.height;
        break;
      }
    }
    setActive(act);
    if (act < 0) {
      const first = els[0]?.getBoundingClientRect();
      setFraction(first && first.top > mid ? 0 : 1);
    } else {
      setFraction(Math.min(1, Math.max(0, (act + intra) / count)));
    }
  }, [count]);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [measure]);

  const scrollToStep = useCallback((i: number) => {
    const el = refs.current[i];
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY + el.offsetHeight * 0.1;
    window.scrollTo({ top: y, behavior: "smooth" });
  }, []);

  return { registerRef, active, fraction, scrollToStep };
}
