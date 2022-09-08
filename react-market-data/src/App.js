import { Link, Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import LastQuotes from './components/lastQuotes';
import LastTrades from './components/lastTrades';
import Streaming from './components/streaming';
import Symbols from './components/symbols';
import TradesList from './components/tradesList';
function App() {
  return (
    <div className="App">
      <Header />
      <div>
        <Routes>
          <Route path="/symbols" element={<Symbols />} />
        </Routes>
        <Routes>
          <Route path="/real-time" element={<Streaming />} />
        </Routes>
        <Routes>
          <Route path="/last-quotes" element={<LastQuotes />} />
        </Routes>
        <Routes>
          <Route path="/last-trades" element={<LastTrades />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
