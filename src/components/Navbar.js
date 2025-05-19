import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminOpen1, setIsAdminOpen1] = useState(false);

  return (
    <nav className="navbar">
    <div class="navbar-left">

      <div className="navbar-logo">
        <img src="/eylogo.png" alt="EY Logo" />
      </div>
      <ul className="navbar-links">
      <li 
          className="dropdown" 
          onMouseEnter={() => setIsAdminOpen(true)} 
          onMouseLeave={() => setIsAdminOpen(false)}
        >
          <span>Project Information ▼</span>
          {isAdminOpen && (
            <ul className="dropdown-menu">
              <li><Link to="/global-resource-allocation">Global Resource Allocation</Link></li>
              <li><Link to="/demand-management">Demand Management</Link></li>
              <li><Link to="/resource-mapping-exception">Resource Mapping Exception</Link></li>
            </ul>
          )}
        </li>
        <li 
          className="dropdown" 
          onMouseEnter={() => setIsAdminOpen1(true)} 
          onMouseLeave={() => setIsAdminOpen1(false)}
        >
          <span>Admin ▼</span>
          {isAdminOpen1 && (
            <ul className="dropdown-menu">
              <li><Link to="/admin/project-info">Project Information</Link></li>
              <li><Link to="/admin/resource-info">Resource Information</Link></li>
              <li><Link to="/admin/resource-allocation-data-import">Resource Allocation Data Import</Link></li>
              <li><Link to="/admin/new-demand-data-import">New Demand Data Import</Link></li>
            </ul>
          )}
        </li>
        <li><Link to="/reports/resource-allocation">Reports</Link></li>
      </ul>
      </div>
    </nav>
    
  );
};

export default Navbar;