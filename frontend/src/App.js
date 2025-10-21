import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Page Components
import Home from './components/pages/Home';
import CategoryPage from './components/pages/CategoryPage';
import ProductPage from './components/pages/ProductPage';
import Checkout from './components/pages/Checkout';
import Dashboard from './components/pages/Dashboard';
import AdminPanel from './components/pages/AdminPanel';

// Import store (will be created)
// import store from './redux/store';

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <main style={{ minHeight: '80vh' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:categorySlug" element={<CategoryPage />} />
            <Route path="/product/:productSlug" element={<ProductPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminPanel />} />
          </Routes>
        </main>
        <Footer />
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
