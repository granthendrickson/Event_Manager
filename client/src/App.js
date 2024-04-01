import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

// Pages
import LoginOrRegister from './pages/LoginOrRegister';

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
				</Routes>
			</div>
		</Router>
	);
}

export default App;
