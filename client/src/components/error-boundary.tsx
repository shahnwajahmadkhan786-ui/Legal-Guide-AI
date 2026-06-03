import { Component, ReactNode } from "react";
import { Shield, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}
interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: any) {
    console.error("NyayaSahay ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-serif font-bold text-foreground mb-2">
              Kuch Gadbad Ho Gayi
            </h1>
            <p className="text-muted-foreground mb-2 text-sm">
              An unexpected error occurred. Your consultation history is safe.
            </p>
            <p className="text-xs text-muted-foreground/60 mb-6 font-mono bg-muted rounded p-2">
              {this.state.errorMessage || "Unknown error"}
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false, errorMessage: "" });
                window.location.reload();
              }}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reload App
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
