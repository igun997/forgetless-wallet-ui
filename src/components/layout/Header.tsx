import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Wallet, BookOpen, LogOut } from "lucide-react";
import { useState } from "react";
import { useWalletSession } from "@/hooks/use-wallet-session";

const navItems = [
  { path: "/dashboard", label: "Dashboard" },
  { path: "/deposit", label: "Deposit" },
  { path: "/withdraw", label: "Withdraw" },
  { path: "/history", label: "History" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isConnected, clearSession } = useWalletSession();
  const isLanding = location.pathname === "/";

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="to-chart-1 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary">
            <Wallet className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">Forgetless</span>
        </Link>

        {!isLanding && (
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button variant={location.pathname === item.path ? "secondary" : "ghost"} size="sm">
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
            <a href="https://docs-wallet.enitip.com" target="_blank" rel="noopener noreferrer">
              <BookOpen className="h-4 w-4" />
            </a>
          </Button>
          {isConnected && !isLanding && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hidden gap-2 border-border/50 text-muted-foreground hover:border-destructive/50 hover:bg-destructive/10 hover:text-destructive sm:flex"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          )}
          {!isLanding && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && !isLanding && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container flex flex-col gap-2 py-4">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={location.pathname === item.path ? "secondary" : "ghost"}
                  className="w-full justify-start"
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            {isConnected && (
              <Button
                variant="ghost"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
