import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ResumeDoctor from './pages/ResumeDoctor';
import InterviewCoach from './pages/InterviewCoach';
import CareerPath from './pages/CareerPath';
import JobAssessor from './pages/JobAssessor';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />;
      case 'assessor': return <JobAssessor />;
      case 'resume': return <ResumeDoctor />;
      case 'interview': return <InterviewCoach />;
      case 'career': return <CareerPath />;
      default: return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
