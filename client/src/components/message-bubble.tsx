import ReactMarkdown from 'react-markdown';
import { cn } from "@/lib/utils";
import { User, Scale, Bot, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string | Date;
  id?: number;
  onDelete?: (id: number) => void;
}

export function MessageBubble({ role, content, createdAt, id, onDelete }: MessageBubbleProps) {
  const isUser = role === 'user';

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
        isUser ? "bg-primary text-primary-foreground" : "bg-white border border-border text-accent"
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
            : "bg-white border border-border/60 text-foreground rounded-tl-none prose-legal"
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
        
        {isUser && onDelete && id && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (confirm("Delete this message?")) {
                onDelete(id);
              }
            }}
            className="absolute -left-10 top-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}

        {/* Timestamp */}
        <span className="text-[11px] text-muted-foreground mt-2 px-1">
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
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center shadow-sm text-accent">
        <Bot className="w-4 h-4" />
      </div>
      <div className="bg-white border border-border/60 px-6 py-5 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
        <div className="w-2 h-2 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-accent/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  );
}
