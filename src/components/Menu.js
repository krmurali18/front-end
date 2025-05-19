import { Link } from 'react-router-dom';
import { Menu as KendoMenu } from '@progress/kendo-react-layout';

// function Menu() {
//     const handleLogout = () => {
//       localStorage.removeItem('authToken');
//       window.location.href = '/login';
//     };
  
//     return (
//       <nav>
//         <ul>
//           <li>
//             <Link to="/dashboard">Dashboard</Link>
//           </li>
//           <li>
//             <Link to="/projectInfo">Project Info</Link>
//           </li>
//         </ul>
//       </nav>
//     );
//   }
  
//   export default Menu;

function Menu() {
    const handleLogout = () => {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    };

    const items = [
      { text: 'Dashboard', url: '/dashboard' },
      { text: 'Project Info', url: '/projectInfo' },
      { text: 'Logout', action: handleLogout }
    ];

    return (
      <KendoMenu items={items} />
    );
}

export default Menu;