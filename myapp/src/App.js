
import './App.css';
import Account from './comp/Account';
import BankApp from './comp/BankApp';
import { BrowserRouter, Route, Router, Routes } from "react-router-dom";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BankApp />} />
        <Route path="accountdetails" element={<Account/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;
