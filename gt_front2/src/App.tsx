import React, { useState } from 'react';
import './App.css';
import { Link, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';

function App() {
    return (
        <div className="App">
          <Routes>
              {/* <Route
                  path="/"
                  element={
                      <>
                          <p></p>
                          <Link to="/wine-list">Wine List</Link>
                          <p></p>
                          <Link to="/settings">Settings</Link>
                          <p></p>
                          <Link to="/grape-list">GrapeList</Link>
                      </>
                  }
              /> */}
              <Route path="/login" element={<Login />} />
              {/* <Route path="/wine-list" element={<WineList />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/grape-list" element={<GrapeList />} /> */}
          </Routes>
        </div>
    );
}

export default App;
