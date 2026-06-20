# Cardoku

Play Cardoku — a small logic puzzle built with React + TypeScript + Vite.

Live demo: https://implodingduck.github.io/cardoku

Game rules
- Board: 6×6 grid of colored regions.
- There is exactly one hidden car for each color.
- Cars cannot share a row, a column, nor be adjacent (8-neighbors).
- Click cells to reveal them. Finding a car for a color reveals all cells of that color, the car's entire row & column, and adjacent squares.
- A guess counter increments on each reveal. Finish when all cars are found.

How to run locally
1. npm install
2. npm run dev
3. Open http://localhost:5173

Build & deploy
- Build: npm run build (outputs `dist/`)
- GitHub Pages: a GitHub Actions workflow is included (.github/workflows/pages.yml) to build and publish `dist/` on push to main.

Assets
- Place car images in src/assets (blue.png, green.png, orange.png, purple.png, red.png, yellow.png). The app uses these when revealing cars.

Contributing
- PRs welcome. Run the dev server and make changes in src/.

License
- MIT
