import "./App.scss";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import PokemonList from "./pages/PokemonList";
import PokemonDetail from "./pages/PokemonDetail";

function App() {
  return (
    <Router basename="/pokemon-test-fe">
      <Routes>
        <Route exact path="/" element={<PokemonList />} />
        <Route exact path="/pokemon/:id" element={<PokemonDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
