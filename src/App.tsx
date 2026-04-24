import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import DashboardPage from "./pages/DashboardPage";
import MentalMathDrill from "./pages/MentalMathDrill";
import CaseMathDrill from "./pages/CaseMathDrill";
import MarketSizingDrill from "./pages/MarketSizingDrill";
import FrameworksDrill from "./pages/FrameworksDrill";
import ChartDrill from "./pages/ChartDrill";
import CreativityDrill from "./pages/CreativityDrill";
import IBBotPage from "./pages/IBBotPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";
import EmbedRedirect from "./pages/EmbedRedirect";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/mental-math-drill" element={<MentalMathDrill />} />
          <Route path="/case-math-drill" element={<CaseMathDrill />} />
          <Route path="/market-sizing-drill" element={<MarketSizingDrill />} />
          <Route path="/frameworks-drill" element={<FrameworksDrill />} />
          <Route path="/chart-drill" element={<ChartDrill />} />
          <Route path="/creativity-drill" element={<CreativityDrill />} />
          <Route path="/IB-bot" element={<IBBotPage />} />
          <Route path="/ib-bot" element={<IBBotPage />} />
          <Route path="/embed" element={<EmbedRedirect />} />
          <Route path="/admin" element={<AdminPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
