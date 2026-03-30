import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-8">
          <Sparkles className="h-7 w-7 text-primary" />
        </div>

        {/* 404 */}
        <motion.p
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-8xl sm:text-9xl font-semibold text-muted-foreground/20 mb-4 leading-none"
        >
          404
        </motion.p>

        <h1 className="text-2xl sm:text-3xl font-semibold mb-2">Page not found</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">
          The page you're looking for doesn't exist or has been moved. Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button asChild>
            <Link to="/ai-chat">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
