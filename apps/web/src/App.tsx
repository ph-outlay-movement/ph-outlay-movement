import { Home } from "./screens/Home";

export function App() {
  return (
    <div className="page">
      <header className="page-header">
        <span className="brand">Outlay</span>
      </header>
      <main className="page-main">
        <Home />
      </main>
      <footer className="page-footer">
        <p>An independent citizen project. Not affiliated with the Philippine government.</p>
        <p>Built by Medelo Gaabon, Medelo Software.</p>
      </footer>
    </div>
  );
}
