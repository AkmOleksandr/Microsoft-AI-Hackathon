import Login from "./Login";
import Signup from "./Signup";
import { Route, Routes } from "react-router-dom"


const AuthPage = ({ handleLogin }) => {

  return (
    <Routes>
        <Route path="/login" element={<Login handleLogin={handleLogin}/>} />
        <Route path="/signup" element={<Signup />} />
    </Routes>
  );
};

export default AuthPage;
