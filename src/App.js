import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import ProjectDashboard from './components/ProjectDashboard';
import ProjectInfo from './components/ProjectInfo';
// import Menu from './components/Menu'; // Import the Menu component
import DemandManagement from './components/DemandManagement';
import ResourceAllocationReport from './components/ResourceAllocationReport';
import ResourceMappingException from './components/ResourceMappingException';
import Navbar from './components/Navbar';
import NewDemandDataImport from './components/NewDemandDataImport';
import ResourceAllocationDataImport from './components/ResourceAllocationDataImport';
import ResourceInfo from './components/ResourceInfo';

function App() {
  const isAuthenticated = !!localStorage.getItem('authToken'); // Check if user is logged in

  return (
    <Router>
      {isAuthenticated && <Navbar/>} {/* Render Menu if authenticated */}

      <Routes>
        <Route path="/login" element={<Login />} />
        {isAuthenticated ? (
          <>
            <Route path="/" element={<Navigate to="/global-resource-allocation" />} />
            <Route path="/global-resource-allocation" element={<ProjectDashboard />} />
            <Route path="/admin/project-info" element={<ProjectInfo />} />
            <Route path="/admin/resource-info" element={<ResourceInfo />} />
            <Route path="/admin/resource-allocation-data-import" element={<ResourceAllocationDataImport />} />
            <Route path="/admin/new-demand-data-import" element={<NewDemandDataImport />} />
            <Route path="/demand-management" element={<DemandManagement />} />
            <Route path="/reports/resource-allocation" element={<ResourceAllocationReport />} />
            <Route path="/resource-mapping-exception" element={<ResourceMappingException />} />
            <Route path="*" element={<Navigate to="/global-resource-allocation" />} />
          </>
        ) : (
          <>
          <Route path="/" element={<Navigate to="/login" />} /> {/* Default to login */}
          <Route path="*" element={<Navigate to="/login" />} /> // Redirect unknown routes 
          </>
        )}
      </Routes>
    </Router>
  );
}

export default App;

