import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Quiz from "@/pages/Quiz";
import PhotoUpload from "@/pages/PhotoUpload";
import LoadingScreen from "@/components/LoadingScreen";
import Results from "@/pages/Results";
import History from "@/pages/History";
import Premium from "@/pages/Premium";
import Nav from "@/components/Nav";

const queryClient = new QueryClient();

function Router() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/upload" element={<PhotoUpload />} />
        <Route path="/loading" element={<LoadingScreen />} />
        <Route path="/results" element={<Results />} />
        <Route path="/history" element={<History />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Router />
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
