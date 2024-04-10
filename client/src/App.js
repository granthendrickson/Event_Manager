import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Pages
import LoginOrRegister from './pages/LoginOrRegister';
import Admin from './pages/Admin';
import Student from './pages/Student';
import SuperAdmin from './pages/SuperAdmin';
import Event from './pages/Event';

function App() {
	return (
		<Router>
			<div className='App'>
				<Routes>
					<Route
						exact
						path='/'
						element={<LoginOrRegister />}
					/>
					<Route
						exact
						path='pages/Admin.jsx'
						element={<Admin />}
					/>
					<Route
						exact
						path='pages/Student.jsx'
						element={<Student />}
					/>
					<Route
						exact
						path='pages/SuperAdmin.jsx'
						element={<SuperAdmin />}
					/>
					<Route
						exact
						path='pages/Event.jsx'
						element={<Event />}
					/>
				</Routes>
			</div>
		</Router>
	);
}

export default App;
