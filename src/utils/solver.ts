export function randomGridColors(size: number, colors: string[]) {
  // Create one connected region per color by seeded growth (4-neighbor adjacency)
  type Cell = { r: number; c: number };
  const grid: (string | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));

  // choose distinct seed positions for each color
  const allCells: Cell[] = [];
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) allCells.push({ r, c });
  // shuffle
  for (let i = allCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allCells[i], allCells[j]] = [allCells[j], allCells[i]];
  }

  const seeds = allCells.slice(0, colors.length);
  const assigned: Cell[][] = colors.map(() => []);
  const frontiers: Set<string>[] = colors.map(() => new Set());

  const key = (p: Cell) => `${p.r},${p.c}`;
  const neighbors = (p: Cell) => {
    const ns: Cell[] = [];
    if (p.r > 0) ns.push({ r: p.r - 1, c: p.c });
    if (p.r < size - 1) ns.push({ r: p.r + 1, c: p.c });
    if (p.c > 0) ns.push({ r: p.r, c: p.c - 1 });
    if (p.c < size - 1) ns.push({ r: p.r, c: p.c + 1 });
    return ns;
  };

  // assign seeds
  for (let i = 0; i < colors.length; i++) {
    const s = seeds[i];
    grid[s.r][s.c] = colors[i];
    assigned[i].push(s);
    for (const n of neighbors(s)) {
      if (grid[n.r][n.c] === null) frontiers[i].add(key(n));
    }
  }

  // helper to pick a random element from a Set
  const pickFromSet = (s: Set<string>) => {
    const arr = Array.from(s);
    if (arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  };

  let remaining = size * size - colors.length;
  while (remaining > 0) {
    // pick a random color whose frontier is non-empty
    const nonEmpty = frontiers.map((f, idx) => ({ idx, sz: f.size })).filter((x) => x.sz > 0);
    if (nonEmpty.length === 0) {
      // no frontiers (shouldn't happen) - fill remaining randomly
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (grid[r][c] === null) {
            const i = Math.floor(Math.random() * colors.length);
            grid[r][c] = colors[i];
          }
        }
      }
      break;
    }
    const pick = nonEmpty[Math.floor(Math.random() * nonEmpty.length)].idx;
    const k = pickFromSet(frontiers[pick]);
    if (!k) continue;
    frontiers[pick].delete(k);
    const [rStr, cStr] = k.split(',');
    const r = parseInt(rStr, 10);
    const c = parseInt(cStr, 10);
    if (grid[r][c] !== null) continue; // already taken
    grid[r][c] = colors[pick];
    assigned[pick].push({ r, c });
    remaining--;
    // add new neighbors to this color's frontier
    for (const n of neighbors({ r, c })) {
      if (grid[n.r][n.c] === null) frontiers[pick].add(key(n));
    }
    // also remove this cell from other frontiers
    for (let j = 0; j < frontiers.length; j++) {
      if (j === pick) continue;
      frontiers[j].delete(key({ r, c }));
    }
  }

  // convert to string grid
  return grid.map((row) => row.map((v) => (v === null ? colors[0] : v as string)));
}

export type Placement = { colorIndex: number; row: number; col: number };

function shuffleArray<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Place one car per color first (respecting row/col and adjacency constraints)
export function placeCarsFirst(size: number, colors: string[], maxAttempts = 200): Placement[] | null {
  type Cell = { r: number; c: number };
  const allCells: Cell[] = [];
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) allCells.push({ r, c });

  const isValid = (occupied: boolean[][], r: number, c: number) => {
    if (occupied[r][c]) return false;
    for (let i = 0; i < size; i++) if (occupied[r][i] || occupied[i][c]) return false;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && occupied[nr][nc]) return false;
      }
    }
    return true;
  };

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const occupied = Array.from({ length: size }, () => Array(size).fill(false));
    const placements: (Placement | null)[] = Array(colors.length).fill(null);
    const order = colors.map((_, i) => i);
    shuffleArray(order);

    function backtrack(idx: number): boolean {
      if (idx >= order.length) return true;
      const ci = order[idx];
      const cells = allCells.slice();
      shuffleArray(cells);
      for (const cell of cells) {
        if (!isValid(occupied, cell.r, cell.c)) continue;
        occupied[cell.r][cell.c] = true;
        placements[ci] = { colorIndex: ci, row: cell.r, col: cell.c };
        if (backtrack(idx + 1)) return true;
        occupied[cell.r][cell.c] = false;
        placements[ci] = null;
      }
      return false;
    }

    if (backtrack(0)) return placements as Placement[];
  }
  return null;
}

export function buildColorsAroundCars(size: number, colors: string[], placements: Placement[]) {
  type Cell = { r: number; c: number };
  const grid: (string | null)[][] = Array.from({ length: size }, () => Array(size).fill(null));
  const assigned: Cell[][] = colors.map(() => []);
  const frontiers: Set<string>[] = colors.map(() => new Set());

  const key = (p: Cell) => `${p.r},${p.c}`;
  const neighbors = (p: Cell) => {
    const ns: Cell[] = [];
    if (p.r > 0) ns.push({ r: p.r - 1, c: p.c });
    if (p.r < size - 1) ns.push({ r: p.r + 1, c: p.c });
    if (p.c > 0) ns.push({ r: p.r, c: p.c - 1 });
    if (p.c < size - 1) ns.push({ r: p.r, c: p.c + 1 });
    return ns;
  };

  // place seeds from placements
  for (let i = 0; i < placements.length; i++) {
    const pl = placements[i];
    grid[pl.row][pl.col] = colors[i];
    assigned[i].push({ r: pl.row, c: pl.col });
    for (const n of neighbors({ r: pl.row, c: pl.col })) {
      if (grid[n.r][n.c] === null) frontiers[i].add(key(n));
    }
  }

  let remaining = size * size - colors.length;
  const pickFromSet = (s: Set<string>) => {
    const arr = Array.from(s);
    if (arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
  };

  while (remaining > 0) {
    const nonEmpty = frontiers.map((f, idx) => ({ idx, sz: f.size })).filter((x) => x.sz > 0);
    if (nonEmpty.length === 0) {
      // fill remaining randomly
      for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
          if (grid[r][c] === null) grid[r][c] = colors[Math.floor(Math.random() * colors.length)];
        }
      }
      break;
    }
    const pick = nonEmpty[Math.floor(Math.random() * nonEmpty.length)].idx;
    const k = pickFromSet(frontiers[pick]);
    if (!k) continue;
    frontiers[pick].delete(k);
    const [rStr, cStr] = k.split(',');
    const r = parseInt(rStr, 10);
    const c = parseInt(cStr, 10);
    if (grid[r][c] !== null) continue; // already taken
    grid[r][c] = colors[pick];
    assigned[pick].push({ r, c });
    remaining--;
    for (const n of neighbors({ r, c })) {
      if (grid[n.r][n.c] === null) frontiers[pick].add(key(n));
    }
    for (let j = 0; j < frontiers.length; j++) {
      if (j === pick) continue;
      frontiers[j].delete(key({ r, c }));
    }
  }

  return grid.map((row) => row.map((v) => (v === null ? colors[0] : (v as string))));
}

export function generateGridFromCars(size: number, colors: string[], maxAttempts = 200) {
  for (let i = 0; i < maxAttempts; i++) {
    const placements = placeCarsFirst(size, colors, 200);
    if (!placements) continue;
    const grid = buildColorsAroundCars(size, colors, placements);
    const solved = solve(grid, colors);
    if (solved) return grid;
  }
  // fallback
  return randomGridColors(size, colors);
}

type Pos = { r: number; c: number };

// Returns array of placements (one per color) or null if unsolvable
export function solve(gridColors: string[][], colors: string[]) {
  const size = gridColors.length;
  const colorPositions: Pos[][] = colors.map(() => []);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const idx = colors.indexOf(gridColors[r][c]);
      if (idx >= 0) colorPositions[idx].push({ r, c });
    }
  }

  const placements: ({ colorIndex: number; row: number; col: number } | null)[] = Array(
    colors.length
  ).fill(null);
  const occupied = Array.from({ length: size }, () => Array(size).fill(false));

  function isValid(r: number, c: number) {
    if (occupied[r][c]) return false;
    // same row or column
    for (let i = 0; i < size; i++) if (occupied[r][i] || occupied[i][c]) return false;
    // adjacent (8-neighbors)
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size && occupied[nr][nc]) return false;
      }
    }
    return true;
  }

  // Order colors by fewest possible positions (heuristic)
  const order = colors.map((_, i) => i).sort((a, b) => colorPositions[a].length - colorPositions[b].length);

  function shuffle<T>(arr: T[]) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }

  function backtrackByOrder(idx: number): boolean {
    if (idx >= order.length) return true;
    const colorIdx = order[idx];
    const positions = colorPositions[colorIdx].slice();
    shuffle(positions);
    for (let i = 0; i < positions.length; i++) {
      const { r, c } = positions[i];
      if (!isValid(r, c)) continue;
      occupied[r][c] = true;
      placements[colorIdx] = { colorIndex: colorIdx, row: r, col: c };
      if (backtrackByOrder(idx + 1)) return true;
      occupied[r][c] = false;
      placements[colorIdx] = null;
    }
    return false;
  }

  if (backtrackByOrder(0)) return placements as any;

  // Fallback: attempt randomized greedy assignment multiple times
  const maxFallback = 1000;
  for (let attempt = 0; attempt < maxFallback; attempt++) {
    const occ = Array.from({ length: size }, () => Array(size).fill(false));
    const pms: ({ colorIndex: number; row: number; col: number } | null)[] = Array(colors.length).fill(null);
    let ok = true;
    // greedy by random color order
    const colorOrder = colors.map((_, i) => i);
    shuffle(colorOrder);
    for (const ci of colorOrder) {
      const positions = colorPositions[ci].slice();
      shuffle(positions);
      let placed = false;
      for (const { r, c } of positions) {
        if (occ[r][c]) continue;
        let bad = false;
        for (let k = 0; k < size; k++) if (occ[r][k] || occ[k][c]) { bad = true; break; }
        if (bad) continue;
        for (let dr = -1; dr <= 1 && !bad; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < size && nc >= 0 && nc < size && occ[nr][nc]) { bad = true; break; }
          }
        }
        if (bad) continue;
        occ[r][c] = true;
        pms[ci] = { colorIndex: ci, row: r, col: c };
        placed = true;
        break;
      }
      if (!placed) { ok = false; break; }
    }
    if (ok) return pms as any;
  }

  return null;
}
