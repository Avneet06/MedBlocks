import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import RegisterPatientPage from './pages/RegisterPatientPage';
import PatientRecordsPage from './pages/PatientRecordsPage';
import SQLQueryPage from './pages/SQLQueryPage';
import { DatabaseProvider } from './lib/DatabaseContext';
import LoadingScreen from './components/LoadingScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
  
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <DatabaseProvider>
      <Layout>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/register" element={<RegisterPatientPage />} />
            <Route path="/records" element={<PatientRecordsPage />} />
            <Route path="/query" element={<SQLQueryPage />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </DatabaseProvider>
  );
}

export default App;