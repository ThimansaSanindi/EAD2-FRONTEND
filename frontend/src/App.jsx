import './css/App.css';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import MovieDescription from './pages/MovieDescription';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Booking from './pages/Booking';
import Payment from './pages/Payment';
import Signup from './pages/Signup';

function App() {
  return (
    <div className="App">
      <NavBar />
      <main className='main-content'>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/movie/:id" element={<MovieDescription />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
           <Route path="/signup" element={<Signup />} />

        </Routes>
      </main>
    </div>
  );
}

export default App;
