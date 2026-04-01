import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import type { AppDispatch, RootState } from "../../store/store";
import { logoutUser } from "../../store/authSlice";
import Container from "../common/Container";
import GlowButton from "../ui/GlowButton";
/* config not used, hardcoded for restaurant */

// Updated for restaurant landing: Menu, About links
const links = [
  { label: "Menu", href: "#menu" },
  { label: "About", href: "#features" },
  { label: "Gallery", href: "#popular" },
  { label: "Contact", href: "#cta" },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    (async () => {
      try {
        await dispatch(logoutUser()).unwrap();
        toast.success("Logged out successfully.");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Logout failed."
        );
      } finally {
        navigate("/");
      }
    })();
  };

  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-white/10 bg-gradient-to-r from-orange/10 via-amber/10 to-red/10 backdrop-blur-xl">
      <Container className="max-w-none px-6">
        <nav className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent drop-shadow-lg">
             🍽️ Flavor Haven
            </span>
          </div>
          <div className="hidden items-center gap-8 text-sm text-white/80 md:flex">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="transition-all duration-300 hover:text-orange-400 hover:underline underline-offset-4 font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="hidden md:inline-flex rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:border-orange-400 hover:text-orange-400 transition-all"
              >
                Log Out
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/authUser")}
                  className="hidden md:inline-flex rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:border-orange-400 hover:text-orange-400 transition-all"
                >
                  Log In
                </button>
              </>
            )}
            <GlowButton className="hidden md:inline-flex bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              Get Started
            </GlowButton>
            <button
              className="text-sm font-medium text-white/80 md:hidden hover:text-orange-400 transition-colors"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              Menu
            </button>
          </div>
        </nav>
        <div
          id="mobile-menu"
          className={`md:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mt-2 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-4 text-sm text-white/80">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="transition hover:text-orange-400"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </a>
            ))}
            {user ? (
              <button
                type="button"
                className="mt-2 w-full rounded-full border border-white/40 px-4 py-2 text-center text-sm font-semibold text-white hover:border-orange-400 hover:text-orange-400 transition-all"
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
              >
                Log Out
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="mt-2 w-full rounded-full border border-white/40 px-4 py-2 text-center text-sm font-semibold text-white hover:border-orange-400 hover:text-orange-400 transition-all"
                  onClick={() => {
                    setIsOpen(false);
                    navigate("/authUser");
                  }}
                >
                  Log In
                </button>
              </>
            )}
            <GlowButton className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              Get Started
            </GlowButton>
          </div>
        </div>
      </Container>
    </header>
  );
};

export default Navbar;
