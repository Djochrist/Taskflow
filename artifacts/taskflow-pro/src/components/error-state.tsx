import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorState({ 
  title = "Something went wrong", 
  message = "There was an error loading this data. Please try again later.",
  onRetry 
}: { 
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center max-w-md mx-auto">
      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-destructive" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="error-title">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6" data-testid="error-message">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" data-testid="button-retry">
          Try Again
        </Button>
      )}
    </div>
  );
}
