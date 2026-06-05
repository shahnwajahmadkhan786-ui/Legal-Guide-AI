import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, LogIn, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

interface LoginPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoginPrompt({ open, onOpenChange }: LoginPromptProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-primary/20">
        <DialogHeader className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/10"
          >
            <Shield className="w-8 h-8 text-primary" />
          </motion.div>
          <DialogTitle className="text-xl font-serif">
            You've used your free queries!
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Sign up for free to continue getting unlimited legal guidance. Your conversation history will be saved securely.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/50">
            <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Unlimited queries</span> — Ask as many legal questions as you want
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/50">
            <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Save history</span> — All your consultations stored safely
            </p>
          </div>
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border/50">
            <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">100% Free</span> — No credit card needed, forever free
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-4">
          <Link href="/auth">
            <Button className="w-full gap-2" size="lg">
              <LogIn className="w-4 h-4" />
              Sign Up / Login — It's Free
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-xs"
            onClick={() => onOpenChange(false)}
          >
            Maybe later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
