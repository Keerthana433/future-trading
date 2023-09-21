import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import CostCalc from './tradingCostCalc/CostCalc';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/cost-calc' element={<CostCalc />} />
      </Routes>
    </Router>
  );
}

export default App;
