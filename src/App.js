import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WelcomePage from './pages/WelcomePage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import DashboardPage from "./pages/DashboardPage";
import PublicPage from "./pages/PublicPage";
import BusinessHubPage from './pages/BusinessHubPage';
function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/signin" element={<SignInPage />} />
                <Route path="/signup" element={<SignUpPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/manage" element={<BusinessHubPage />} /> {/* <-- ДОБАВИТЬ ЭТУ СТРОКУ */}
                <Route path="/u/:slug" element={<PublicPage />} />
            </Routes>
        </Router>
    );
}

export default App;
