import { useEffect, useState, useMemo } from 'react';
import Cell from './Cell';
import { randomGridColors, solve } from '../utils/solver';
import '../App.css';
import type { Placement } from '../types';
import Confetti from './Confetti';

import blueImg from '../assets/blue.png';
import greenImg from '../assets/green.png';
import orangeImg from '../assets/orange.png';
import purpleImg from '../assets/purple.png';
import redImg from '../assets/red.png';
import yellowImg from '../assets/yellow.png';

type Props = {
  size?: number;
  colors?: string[];
};

// use color IDs (strings) and map to display hex + image
const defaultColors = ['blue', 'green', 'orange', 'purple', 'red', 'yellow'];
const colorHex: Record<string, string> = {
  blue: '#4363d8',
  green: '#3cb44b',
  orange: '#f58231',
  purple: '#911eb4',
  red: '#e6194b',
  yellow: '#ffe119',
};
const colorImage: Record<string, string> = {
  blue: blueImg,
  green: greenImg,
  orange: orangeImg,
  purple: purpleImg,
  red: redImg,
  yellow: yellowImg,
};

export default function Grid({ size = 6, colors = defaultColors }: Props) {
  const [gridColors, setGridColors] = useState<string[][]>(() => randomGridColors(size, colors));
  const [placements, setPlacements] = useState<Placement[] | null>(null);
  const [revealed, setRevealed] = useState<boolean[][]>(() =>
    Array.from({ length: size }, () => Array.from({ length: size }, () => false))
  );
  const [showSolution, setShowSolution] = useState(false);
  const [foundColors, setFoundColors] = useState<Set<number>>(new Set());
  const [guesses, setGuesses] = useState<number>(0);
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    if (foundColors.size > 0 && foundColors.size === colors.length) {
      setShowCongrats(true);
    }
  }, [foundColors, colors.length]);

  useEffect(() => {
    const result = solve(gridColors, colors);
    setPlacements(result);
    // reset reveal/found when puzzle changes
    setRevealed(Array.from({ length: size }, () => Array.from({ length: size }, () => false)));
    setFoundColors(new Set());
    setShowSolution(false);
    setGuesses(0);
  }, [gridColors, colors, size]);

  const placementsMap = useMemo(() => {
    const m = new Map<string, number>();
    placements?.forEach((p) => {
      if (p) m.set(`${p.row}-${p.col}`, p.colorIndex);
    });
    return m;
  }, [placements]);

  const handleClick = (r: number, c: number) => {
    if (revealed[r][c] || showSolution) return;
    const key = `${r}-${c}`;

    // increment guess count for this click
    setGuesses((g) => g + 1);

    // Reveal the clicked cell
    const next = revealed.map((row) => row.slice());
    next[r][c] = true;

    if (placementsMap.has(key)) {
      // found a car: mark this color as found and reveal all cells of that color
      const colorIndex = placementsMap.get(key)!;
      const colorStr = colors[colorIndex];
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          if (gridColors[i][j] === colorStr) next[i][j] = true;
        }
      }

      // also reveal the full row and column of the car and adjacent squares around the car
      const carRow = r;
      const carCol = c;
      // row
      for (let j = 0; j < size; j++) next[carRow][j] = true;
      // column
      for (let i = 0; i < size; i++) next[i][carCol] = true;
      // adjacent 8-neighbors
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = carRow + dr;
          const nc = carCol + dc;
          if (nr >= 0 && nr < size && nc >= 0 && nc < size) next[nr][nc] = true;
        }
      }

      setRevealed(next);
      setFoundColors((s) => new Set(s).add(colorIndex));
    } else {
      setRevealed(next);
    }
  };

  const newPuzzle = () => {
    setShowCongrats(false);
    setGridColors(randomGridColors(size, colors));
  };
  const showAll = () => setShowSolution((s) => !s);
  const resetReveals = () => {
    setRevealed(Array.from({ length: size }, () => Array.from({ length: size }, () => false)));
    setFoundColors(new Set());
    setShowSolution(false);
  };

  const cellSize = Math.max(40, Math.floor(480 / size));

  return (
    <div className="game">
      <div className="status">
        <span>Guesses: {guesses}</span>
        <span>
          Found colors: {foundColors.size} / {colors.length}
        </span>
      </div>
      
      <div
        className="grid"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${size}, ${cellSize}px)`,
          gridAutoRows: `${cellSize}px`,
          gap: '6px',
        }}
      >
        {gridColors.map((row, r) =>
          row.map((color, c) => {
            const key = `${r}-${c}`;
            const isCar = placementsMap.has(key);
            const isRevealed = showSolution ? true : revealed[r][c];
            const bg = colorHex[color] || color;
            let carImg: string | undefined = undefined;
            if (isCar) {
              const colorIndex = placementsMap.get(key)!;
              const colorId = colors[colorIndex];
              carImg = colorImage[colorId];
            }
            return (
              <Cell
                key={key}
                color={bg}
                revealed={isRevealed}
                isCar={isCar}
                carImg={carImg}
                onClick={() => handleClick(r, c)}
              />
            );
          })
        )}
      </div>

      {/* <div className="legend">
        <h3>Legend (one car per color)</h3>
        <div className="legend-list">
          {colors.map((col, i) => (
            <div key={i} className="legend-item">
              <span
                className="swatch"
                style={{ background: colorHex[col], opacity: foundColors.has(i) ? 0.5 : 1 }}
              />
              {col.charAt(0).toUpperCase() + col.slice(1)} {foundColors.has(i) ? '— found' : ''}
            </div>
          ))}
        </div>
      </div> */}
      <div className="controls">
        <button onClick={newPuzzle}>New puzzle</button>
        <button onClick={resetReveals}>Reset reveals</button>
        <button onClick={showAll}>{showSolution ? 'Hide solution' : 'Show solution'}</button>
      </div>


      {showCongrats ? (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-content">
            <button className="modal-close" aria-label="Close" onClick={() => setShowCongrats(false)}>
              ×
              <span className="sr-only">Close</span>
            </button>
            <h2>Congratulations!</h2>
            <p>You found all cars.</p>
            <p>Guesses: {guesses}</p>
            <div className="modal-actions">
              <button onClick={newPuzzle}>New puzzle</button>
            </div>
          </div>
          <Confetti />
        </div>
      ) : null}
    </div>
  );
}
