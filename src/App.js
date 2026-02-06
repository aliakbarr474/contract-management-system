import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';
import Clients from './Clients';
import Labor from './Labor';
import Purchases from './Purchases';
import Projects from './Projects';
import Expenses from './Expenses';
import Payments from './Payments';
import Vendors from './Vendors';
import { ProtectedRoute } from "./ProtectedRoute";

function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path='/clients' element={<Clients />} />
          <Route path='/labor' element={<Labor />} />
          <Route path='/purchases' element={<Purchases />} />
          <Route path='/projects' element={<Projects />} />
          <Route path='/vendors' element={<Vendors />} />
          <Route path='/expenses' element={<Expenses />} />
          <Route path='/payments' element={<Payments />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
