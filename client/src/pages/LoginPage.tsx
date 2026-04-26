import { useState } from "react";
import type { FormEvent } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch } from "../store/store";
import { HiLockClosed, HiMail, HiPhone, HiUser } from "react-icons/hi";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "react-hot-toast";
import { googleAuth, loginUser, registerUser } from "../store/authSlice";
import "../styles/LoginPage.css";

const roleToPath: Record<string, string> = {
  customer: "/customer-dashboard",
  admin: "/admin",
  manager: "/manager",
  cashier: "/cashier",
  inventory: "/inventory",
  inventory_head: "/inventory",
  vendor: "/vendor",
};

const getRolePath = (role?: string) => {
  if (!role) return "/";
  return roleToPath[role] ?? "/";
};

const LoginPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    if (isSignUp) {
      if (!name || !email || !password || !phone) {
        setLoading(false);
        return;
      }
      (async () => {
        try {
          const result = await dispatch(
            registerUser({
              name,
              email,
              password,
              phoneNumber: phone,
              role: "customer",
            })
          ).unwrap();
          toast.success("Account created successfully.");
          navigate(getRolePath(result.user.role));
        } catch (error) {
          toast.error(
            error instanceof Error ? error.message : "Registration failed."
          );
        } finally {
          setLoading(false);
        }
      })();
      return;
    }

    if (!email || !password) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const result = await dispatch(loginUser({ email, password })).unwrap();
        toast.success("Logged in successfully.");
        navigate(getRolePath(result.user.role));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Login failed.");
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleGoogleSuccess = (credentialResponse: unknown) => {
    const credential =
      typeof credentialResponse === "object" &&
      credentialResponse !== null &&
      "credential" in credentialResponse
        ? String((credentialResponse as { credential: string }).credential)
        : "";

    if (!credential) {
      toast.error("Google login failed.");
      return;
    }

    (async () => {
    try {
      const result = await dispatch(googleAuth({ credential })).unwrap();
      toast.success("Logged in successfully.");
      navigate(getRolePath(result.user.role));
    } catch {
      toast.error("Google login failed.");
    }
  })();
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <h1>Flavor Haven</h1>
          <p>{isSignUp ? "Create your account" : "Sign in to continue"}</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="login-field">
              <HiUser className="login-icon" />
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
          )}
          <div className="login-field">
            <HiMail className="login-icon" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="login-field">
            <HiLockClosed className="login-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          {isSignUp && (
            <div className="login-field">
              <HiPhone className="login-icon" />
              <input
                type="tel"
                placeholder="Phone number"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
          )}
          <button type="submit" disabled={loading}>
            {loading ? "Please wait..." : isSignUp ? "Create account" : "Sign in"}
          </button>
        </form>

        <div className="login-divider">
          <span>or</span>
        </div>

        {!isSignUp && (
          <div className="login-google">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google login failed.")}
              theme="outline"
              shape="rectangular"
              size="large"
              text="continue_with"
              // width="280"
            />
          </div>
        )}

        <button
          type="button"
          className="toggle-mode"
          onClick={() => setIsSignUp((prev) => !prev)}
        >
          {isSignUp
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
