import React, { useContext, useState } from "react";
import axios from "axios";
import { UserContext } from "./UserContext";

export default function RegisterAndLoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginOrRegister, setIsLoginOrRegister] = useState("Register");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isLoginOrRegister === "Register" ? "/register" : "/login";

    const { data } = await axios.post(url, { username, password });
    setLoggedInUsername(username);
    setId(data._id);
  };

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form className="w-64 mx-auto mb-12" onSubmit={handleSubmit}>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          placeholder="Username"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="block w-full rounded-sm p-2 mb-2 border"
        />
        <button className="bg-blue-500 text-white block w-full rounded-sm p-2">
          {isLoginOrRegister}
        </button>
        <div className="text-center mt-2">
          {isLoginOrRegister === "Register" && (
            <div>
              Already a member?
              <button
                className="ml-1"
                onClick={() => setIsLoginOrRegister("Login")}
              >
                Login here
              </button>
            </div>
          )}
          {isLoginOrRegister === "Login" && (
            <div>
              Don't have an account?
              <button
                className="ml-1"
                onClick={() => setIsLoginOrRegister("Register")}
              >
                Register
              </button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
