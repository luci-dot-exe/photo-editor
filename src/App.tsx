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

      <div className="container">
        <Homepage />
      </div>
    </div>
  );
}

export default App;
