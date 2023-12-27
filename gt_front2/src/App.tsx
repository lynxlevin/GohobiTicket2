import { useState } from 'react';
import './App.css';
import { Link, Routes, Route } from 'react-router-dom';
import { UserContext } from './contexts/user-context';
import Login from './pages/Login';
import Tickets from './pages/Tickets';

function App() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
    const [defaultRelationId, setDefaultRelationId] = useState<string | null>(null);

    return (
        <div className="App">
            <UserContext.Provider value={{ isLoggedIn, setIsLoggedIn, defaultRelationId, setDefaultRelationId }}>
                <Routes>
                    <Route
                        path="/"
                        element={
                            <>
                                <p></p>
                                <Link to="/login">Login</Link>
                                <p></p>
                                <Link to="/tickets?user_relation_id=1">Ticketsg</Link>
                            </>
                        }
                    />
                    <Route path="/login" element={<Login />} />
                    <Route path="/tickets" element={<Tickets />} />
                </Routes>
            </UserContext.Provider>
        </div>
    );
}

export default App;
