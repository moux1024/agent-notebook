import { useCallback, useEffect, useRef, useState } from "react";

/**
 * 单个 section 的滚动进度：0 = section 顶部刚进入视口下缘，
 * 1 = section 底部刚离开视口上缘。滚动即时间轴，驱动内部动效序列。
 */
export function useSectionProgress<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [p, setP] = useState(0);
  const raf = useRef(0);

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const total = r.height + vh;
    const passed = vh - r.top;
    const next = Math.min(1, Math.max(0, passed / total));
    setP((prev) => (Math.abs(prev - next) < 0.002 ? prev : next));
  }, []);

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

  return { ref, p };
}

/** 把进度 p 从 [lo, hi] 窗口线性映射到 0..1 并夹紧 */
export function window_(p: number, lo: number, hi: number) {
  return Math.min(1, Math.max(0, (p - lo) / (hi - lo)));
}
