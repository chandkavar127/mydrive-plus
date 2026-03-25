import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Files from './pages/Files.jsx';
import Recent from './pages/Recent.jsx';
import Starred from './pages/Starred.jsx';
import Trash from './pages/Trash.jsx';
import Shared from './pages/Shared.jsx';
import Login from './pages/auth/Login.jsx';
import Signup from './pages/auth/Signup.jsx';
import AppLayout from './components/layout/AppLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

const App = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />

    <Route element={<ProtectedRoute />}> 
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/files" element={<Files />} />
        <Route path="/recent" element={<Recent />} />
        <Route path="/starred" element={<Starred />} />
        <Route path="/trash" element={<Trash />} />
        <Route path="/shared" element={<Shared />} />
      </Route>
    </Route>

    <Route path="*" element={<Navigate to="/" />} />
  </Routes>
);

export default App;
