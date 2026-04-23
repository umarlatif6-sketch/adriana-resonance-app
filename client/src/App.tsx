import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Library from "./pages/Library";
import Protocol from "./pages/Protocol";
import Station from "./pages/Station";
import Emergence from "./pages/Emergence";
import Trading from "./pages/Trading";
import AppShell from "./components/AppShell";
import Genesis from "./pages/Genesis";
import Economics from "./pages/Economics";
import NailReading from "./pages/NailReading";
import VoidGameEngine from "./pages/VoidGameEngine";
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/library" component={Library} />
      <Route path="/protocol" component={Protocol} />
      <Route path="/station" component={Station} />
      <Route path="/emergence" component={Emergence} />
      <Route path="/trading" component={Trading} />
      <Route path="/genesis" component={Genesis} />
      <Route path="/economics" component={Economics} />
      <Route path="/nail-reading" component={NailReading} />
      <Route path="/void-games" component={VoidGameEngine} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <AppShell>
            <Router />
          </AppShell>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
