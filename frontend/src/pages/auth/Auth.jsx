import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const Auth = () => {
	const { login, setCurrentScreen } = useAuth();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		try {
			const response = await axios.post(
				"https://your-personal-bookshelf.onrender.com/api/v1/auth/login",
				{
					username: username,
					password: password,
				},
			);

			const token = response.data;

			if (token) {
				login(token, username);
			} else {
				setError("The server did not return an access token.");
			}
		} catch (err) {
			console.error("Authorization error:", err);
			setError("Invalid username or password");
		}
	};

	return (
		<div className="container centering-wrapper">
			<div className="auth-surface">
				<form className="auth-form auth-content" onSubmit={handleSubmit}>
					<h2 className="title">Login to Bookshelf</h2>

					{error && <div className="error-message">{error}</div>}

					<div className="input-group">
						<label>Login</label>
						<input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
						/>
					</div>

					<div className="input-group">
						<label>Password</label>
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</div>

					<button type="submit" className="auth-btn login-btn">
						Log In
					</button>

					<div className="auth-links">
						<button
							type="button"
							onClick={() => setCurrentScreen("welcome")}
							className="link-btn"
						>
							Back to main page
						</button>
						<button
							type="button"
							onClick={() => setCurrentScreen("register")}
							className="link-btn"
						>
							Registration
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Auth;
