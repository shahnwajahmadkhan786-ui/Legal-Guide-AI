import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { User, Scale, Bot, Trash2, Copy, Check } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string | Date | null;
  id?: string;
  onDelete?: (id: string) => void;
}

export function MessageBubble({ role, content, createdAt, id, onDelete }: MessageBubbleProps) {
  const isUser = role === 'user';
  const [copied, setCopied] = useState(false);

  // M4: Copy message content to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea");
      el.value = content;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "flex w-full gap-4 max-w-4xl mx-auto mb-8 group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm",
        isUser ? "bg-primary text-primary-foreground" : "bg-white dark:bg-slate-800 border border-border text-accent"
      )}>
        {isUser ? <User className="w-4 h-4" /> : <Scale className="w-5 h-5" />}
      </div>

      {/* Content */}
      <div className={cn(
        "flex flex-col max-w-[85%] relative",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "relative px-6 py-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed overflow-hidden",
          isUser 
            ? "bg-primary text-primary-foreground rounded-tr-none" 
            : "bg-white dark:bg-slate-800 border border-border/60 text-foreground rounded-tl-none prose-legal"
        )}>
          {/* Subtle decoration for assistant */}
          {!isUser && (
            <div className="absolute top-0 left-0 w-1 h-full bg-accent/30" />
          )}

          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <ReactMarkdown>
              {content}
            </ReactMarkdown>
          )}
        </div>
        
        {/* Action bar — copy + delete */}
        <div className={cn(
          "flex items-center gap-1 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity",
          isUser ? "flex-row-reverse" : "flex-row"
        )}>
          {/* M4: Copy button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
            title="Copy message"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>

          {/* L1: AlertDialog-based delete (replaces confirm()) */}
          {onDelete && id && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive"
                  title="Delete message"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This message will be permanently deleted and cannot be recovered.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[11px] text-muted-foreground mt-1 px-1">
          {role === 'assistant' ? 'Legal Assistant • ' : 'You • '}
          {createdAt ? format(new Date(createdAt), 'h:mm a') : 'Just now'}
        </span>
      </div>
    </motion.div>
  );
}

export function LoadingBubble() {
  return (
    <div className="flex w-full gap-4 max-w-4xl mx-auto mb-8">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-border flex items-center justify-center shadow-sm text-accent">
        <Bot className="w-4 h-4" />
      </div>
      <div className="bg-white dark:bg-slate-800 border border-border/60 px-6 py-5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
        <div className="w-2 h-2 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
