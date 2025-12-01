import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function LoadingState({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-muted-foreground">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <Loader2 className="w-8 h-8" />
      </motion.div>
      <p className="mt-4 text-sm font-medium" data-testid="loading-message">{message}</p>
    </div>
  );
}
