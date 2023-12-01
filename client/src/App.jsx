import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import SignupForm from "./components/SignupForm";

function App() {

	return (
		<BrowserRouter>
			<Routes>
				<Route path="/login" element={<LoginForm />} />
				<Route path="/signup" element={<SignupForm />} />
				{/* <Route path="/notes" component={NotesPage} /> */}
				{/* <Route path="/quiz" component={QuizPage} /> */}
				{/* <Redirect from="/" to="/login" /> */}
			</Routes>
		</BrowserRouter>
		
	)
}

export default App