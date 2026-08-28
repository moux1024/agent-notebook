import { useCallback, useEffect, useRef, useState, type MutableRefObject } from "react";

/**
 * 单个 section 的滚动进度：0 = section 顶部刚进入视口下缘，
 * 1 = section 底部刚离开视口上缘。滚动即时间轴，驱动卡片进场/退场。
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

  useScrollListeners(measure, raf);

  return { ref, p };
}

/**
 * 元素自身的视口穿越进度：0 = 元素顶部刚进入视口下缘，
 * 1 = 元素底部刚离开视口上缘。
 *
 * 用于示意图的动效序列：锚定在图元素自身而非所在 section，
 * 这样图下方的内容伸缩（如深潜展开改变 section 高度）不会影响动效状态。
 */
export function useElementProgress<T extends HTMLElement>() {
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

  useScrollListeners(measure, raf);

  return { ref, p };
}

/** 滚动/窗口/内容尺寸变化 → rAF 节流重测量 */
function useScrollListeners(
  measure: () => void,
  raf: MutableRefObject<number>,
) {
  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // 页面内容伸缩（深潜展开/收起）后重测量，避免进度值过期
    const ro = new ResizeObserver(onScroll);
    ro.observe(document.body);
    return () => {
      cancelAnimationFrame(raf.current);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro.disconnect();
    };
  }, [measure, raf]);
}

/** 把进度 p 从 [lo, hi] 窗口线性映射到 0..1 并夹紧 */
export function window_(p: number, lo: number, hi: number) {
  return Math.min(1, Math.max(0, (p - lo) / (hi - lo)));
}
