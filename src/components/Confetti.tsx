import { useMemo } from 'react';

export default function Confetti({ count = 200, colors = ['#f94144', '#f3722c', '#f9c74f', '#90be6d', '#577590', '#4363d8', '#f032e6', '#ffe119', '#3cb44b'] }: { count?: number; colors?: string[] }) {
  const pieces = useMemo(() => {
    const arr = [] as { left: number; bg: string; delay: number; duration: number; rotate: number; scale: number }[];
    for (let i = 0; i < count; i++) {
      arr.push({
        left: Math.random() * 100,
        bg: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.6,
        duration: 2 + Math.random() * 2.5,
        rotate: Math.random() * 360,
        scale: 0.8 + Math.random() * 1.4,
      });
    }
    return arr;
  }, [count, colors]);

  return (
    <div className="confetti-root" aria-hidden>
      {pieces.map((p, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            background: p.bg,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s, ${1.2 + Math.random() * 1.6}s`,
            transform: `translateY(0) rotate(${p.rotate}deg) scale(${p.scale})`,
          }}
        />
      ))}
    </div>
  );
}
