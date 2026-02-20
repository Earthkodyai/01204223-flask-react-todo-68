import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import './App.css'
import { useAuth } from "./context/AuthContext";

function LoginForm({loginUrl}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { login, username: loggedInUsername } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: username, password: password }),
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        //alert("Login successful.  access token = " + data.access_token);
        login(username, data.access_token);
        navigate('/');
      } else if (response.status === 401) {
        setErrorMessage("Invalid username or password");
      }
    } catch (error) {
      console.log("Error logging in:", error);
    }
  }
  return (
<div>
      <h2>Login</h2>
      <form onSubmit={(e) => {handleLogin(e)}}>
        {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
        <div>
          <label>Username:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
        </div>
        <div>
          <label>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
        </div>
        <button type="submit">Login</button>
        {loggedInUsername && <p>User {loggedInUsername} is already logged in.</p>}
      </form>
    </div>
  )
}

export default LoginForm;