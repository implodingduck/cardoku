import './App.css'
import Grid from './components/Grid'

function App() {
  return (
    <div className="App">
      <header>
        <h1>Cardoku</h1>
        <p>A fun puzzle game! There is one car per color. No two cars may share a row, column, or be adjacent.</p>
      </header>

      <main>
        <Grid size={6} />
      </main>

    </div>
  )
}

export default App
