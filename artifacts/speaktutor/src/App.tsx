import { Component, useState, useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Mic, FileText, ScrollText } from "lucide-react";
import Landing from "./pages/Landing";
import LevelSelect from "./pages/LevelSelect";
import Scenarios from "./pages/Scenarios";
import Session from "./pages/Session";
import PaymentReturn from "./pages/PaymentReturn";
import Offer from "./pages/Offer";
import { getLevel } from "@/lib/store";
import { UserAgreementModal } from "@/components/UserAgreementModal";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

// ── Error boundary ────────────────────────────────────────────────────────────

interface EBState { hasError: boolean; message: string }

class ErrorBoundary extends Component<{ children: React.ReactNode }, EBState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: "" };
  }
  static getDerivedStateFromError(error: unknown): EBState {
    return { hasError: true, message: error instanceof Error ? error.message : String(error) };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-card border border-destructive/50 rounded-2xl p-8 space-y-4">
            <h2 className="text-lg font-semibold text-destructive">Что-то пошло не так</h2>
            <p className="text-sm text-muted-foreground font-mono bg-muted p-3 rounded-lg break-all">
              {this.state.message || "Неизвестная ошибка"}
            </p>
            <button
              onClick={() => { this.setState({ hasError: false, message: "" }); window.location.href = import.meta.env.BASE_URL; }}
              className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Вернуться на главную
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Guard: redirects to /level if no level set ───────────────────────────────

function LevelGuard({ component: Comp }: { component: React.ComponentType }) {
  const [, navigate] = useLocation();
  useEffect(() => {
    if (!getLevel()) navigate("/level");
  }, [navigate]);
  if (!getLevel()) return null;
  return <Comp />;
}

const ScenariosPage     = () => <LevelGuard component={Scenarios} />;
const SessionPage       = () => <LevelGuard component={Session} />;

// ── Fixed legal buttons (shown on every page) ─────────────────────────────────

const PDF_URL = `${import.meta.env.BASE_URL}offer.pdf`;

function LegalFixedButtons({ onShowAgreement }: { onShowAgreement: () => void }) {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex flex-col gap-1.5">
      <a
        href={PDF_URL}
        target="_blank"
        rel="noreferrer"
        className="text-[11px] text-muted-foreground hover:text-foreground transition-colors bg-card/90 backdrop-blur border border-border rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-sm"
      >
        <FileText className="w-3 h-3" />
        Оферта
      </a>
      <button
        onClick={onShowAgreement}
        className="text-[11px] text-muted-foreground hover:text-foreground transition-colors bg-card/90 backdrop-blur border border-border rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 shadow-sm"
      >
        <ScrollText className="w-3 h-3" />
        Соглашение
      </button>
    </div>
  );
}

// ── Router ────────────────────────────────────────────────────────────────────

function Router() {
  return (
    <Switch>
      <Route path="/"                    component={Landing} />
      <Route path="/level"               component={LevelSelect} />
      <Route path="/scenarios"           component={ScenariosPage} />
      <Route path="/session/:scenarioId" component={SessionPage} />
      <Route path="/payment/return"      component={() => <PaymentReturn />} />
      <Route path="/offer"               component={Offer} />
      {/* Legacy auth routes → redirect to level select */}
      <Route path="/register">           <Redirect to="/level" /></Route>
      <Route path="/login">              <Redirect to="/level" /></Route>
      <Route path="/sign-up">            <Redirect to="/level" /></Route>
      <Route path="/signup">             <Redirect to="/level" /></Route>
      <Route path="/user-agreement">     <Redirect to="/level" /></Route>
      {/* Catch-all */}
      <Route>
        <Redirect to="/" />
      </Route>
    </Switch>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────

function App() {
  useEffect(() => { document.documentElement.classList.add("dark"); }, []);

  const [showAgreement, setShowAgreement] = useState(false);

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={base}>
            <Router />
            <LegalFixedButtons onShowAgreement={() => setShowAgreement(true)} />
          </WouterRouter>
          <UserAgreementModal open={showAgreement} onClose={() => setShowAgreement(false)} />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
