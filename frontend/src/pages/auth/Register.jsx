import { useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext"; // Укажи правильный путь к контексту

const Register = () => {
	const { login, setCurrentScreen } = useAuth();
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setIsSubmitting(true);

		try {
			const response = await axios.post(
				"http://localhost:8080/api/v1/auth/register",
				{
					username: username,
					password: password,
				},
			);

			const token = response.data;

			if (token) {
				// Сразу логиним пользователя после успешной регистрации
				login(token, username);
			} else {
				setError("Сервер не вернул токен после регистрации.");
			}
		} catch (err) {
			console.error("Ошибка регистрации:", err);

			if (err.response?.status === 409) {
				const backendMessage =
					typeof err.response.data === "object"
						? err.response.data.message
						: err.response.data;

				setError(backendMessage || "The username is already taken.");
			} else if (err.request) {
				setError("The server is not responding. Please try again later.");
			} else {
				setError("Unable to connect to the server.");
			}
		}
		setIsSubmitting(false);
	};

	return (
		<div className="container centering-wrapper">
			<div className="auth-surface">
				<form className="register-form auth-content" onSubmit={handleSubmit}>
					<h2 className="title">Registration to Bookshelf</h2>

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

					<button
						type="submit"
						className="auth-btn register-btn"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Registering..." : "Sign Up"}
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
							onClick={() => setCurrentScreen("login")}
							className="link-btn"
						>
							I already have an account
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default Register;
