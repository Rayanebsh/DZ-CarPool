import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [apiStatus, setApiStatus] = useState('Checking...');
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    fetch(API_URL + '/')
      .then(res => res.json())
      .then(data => {
        setApiStatus(`✅ Connected: ${data.message}`);
      })
      .catch(err => {
        setApiStatus('❌ API not reachable');
        console.error(err);
      });
  }, [API_URL]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚗 DZ-CarPool</h1>
        <p>Plateforme de covoiturage en Algérie</p>
        
        <div className="status-box">
          <h3>État du Backend</h3>
          <p>{apiStatus}</p>
          <a 
            href="http://localhost:8000/admin/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            Django Admin
          </a>
          {' | '}
          <a 
            href="http://localhost:8000/api/docs/" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            API Docs
          </a>
        </div>

        <div className="features">
          <h3>Fonctionnalités MVP</h3>
          <ul>
            <li>✅ Profils Utilisateurs (Conducteur/Passager)</li>
            <li>✅ Gestion des Trajets (CRUD)</li>
            <li>✅ Recherche de Trajets</li>
            <li>✅ Réservation Simple</li>
            <li>✅ Messagerie Basique</li>
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;