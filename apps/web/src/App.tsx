import { Home } from "./screens/Home";

export function App() {
  return (
    <div className="page">
      <header className="page-header">
        <span className="brand">
          <img className="brand-mark" src="/logo-mark.svg" alt="" width={36} height={32} />
          <span className="brand-name">Outlay</span>
        </span>
      </header>
      <main className="page-main">
        <Home />
      </main>
      <footer className="page-footer">
        <p>An independent citizen project. Not affiliated with the Philippine government.</p>
        <p className="credit">
          <img className="credit-mark" src="/medelo-mark.svg" alt="" width={21} height={20} />
          <span>Built by Medelo Gaabon, Medelo Software.</span>
        </p>
      </footer>
    </div>
  );
}
