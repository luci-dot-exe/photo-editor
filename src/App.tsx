import { Homepage } from "./Homepage";

function App() {
  return (
    <div>
      <nav className="navbar navbar-dark bg-dark">
        <div className="container-fluid">
          <a className="navbar-brand" href="#0">
            PhotoEditor
          </a>
        </div>
      </nav>

      <div className="container" style={{ maxWidth: 768 }}>
        <Homepage />
      </div>
    </div>
  );
}

export default App;
