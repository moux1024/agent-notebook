import { useEffect, useRef, useState, type ReactNode } from "react";

/** 进入视口时为子元素加 .in-view，触发上浮淡入动画 */
export default function Reveal({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setShown(true);
      },
      { rootMargin: "-12% 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`reveal${shown ? " in-view" : ""}`}>
      {children}
    </div>
  );
}
