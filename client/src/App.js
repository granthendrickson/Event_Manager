import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Pages
import LoginOrRegister from './pages/LoginOrRegister';
import Admin from './pages/Admin';

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
				</Routes>
			</div>
		</Router>
	);
}

export default App;
