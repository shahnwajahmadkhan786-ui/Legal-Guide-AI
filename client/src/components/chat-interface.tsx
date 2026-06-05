import { useState, useRef, useEffect } from "react";
import { useMessages, useSendMessage, useDeleteMessage } from "@/hooks/use-legal-chat";
import { MessageBubble, LoadingBubble } from "@/components/message-bubble";
import { VoiceButton } from "@/components/voice-button";
import { LoginPrompt } from "@/components/login-prompt";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Shield, Scale, Trash2, Download } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useDeleteThread } from "@/hooks/use-legal-chat";
import { useAuth } from "@/hooks/use-auth";
import { hasGuestReachedLimit, getGuestQueryCount, FREE_LIMIT } from "@/lib/guest-limit";
import { useLocation } from "wouter";
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

interface ChatInterfaceProps {
  threadId: string;
}

const SUGGESTIONS = [
  "Police are detaining me without reason — what are my rights?",
  "Landlord cut off electricity and water and is threatening to evict me",
  "My employer hasn't paid salary for 3 months — what can I do?",
  "Police are refusing to register my FIR — what should I do?",
  "How do I file a consumer complaint against a company?",
  "How to register a domestic violence case?",
];

export function ChatInterface({ threadId }: ChatInterfaceProps) {
  const { data: messages, isLoading } = useMessages(threadId);
  const { mutate: sendMessage, isPending } = useSendMessage(threadId);
  const deleteMessage = useDeleteMessage(threadId);
  const deleteThread = useDeleteThread();
  const { user } = useAuth();
  const [input, setInput] = useState("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  const isGuest = !user;
  const guestQueriesUsed = getGuestQueryCount();
  const guestQueriesLeft = Math.max(0, FREE_LIMIT - guestQueriesUsed);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, isPending]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isPending) return;

    // Guest limit check — show login prompt on 3rd query
    if (isGuest && hasGuestReachedLimit()) {
      setShowLoginPrompt(true);
      return;
    }
    
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleVoiceTranscript = (text: string) => {
    setInput((prev) => (prev ? prev + " " + text : text));
  };

  // M4: Download thread as text file
  const handleDownloadThread = () => {
    if (!messages || messages.length === 0) return;
    const text = messages
      .map((m) => `[${m.role === "user" ? "You" : "NyayaSahay"}]\n${m.content}`)
      .join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `nyayasahay-consultation-${threadId.slice(0, 8)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // L1: Delete thread uses AlertDialog (no window.confirm)
  const handleDeleteThread = async () => {
    await deleteThread(threadId);
    setLocation("/");
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50/30 dark:bg-slate-900/30">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/30 dark:bg-slate-900/30 relative">
      {/* Scrollable Message Area */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto pb-6">
          {(!messages || messages.length === 0) && (
            <div className="text-center space-y-4 my-12 md:my-20">
              <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-primary/10">
                <Shield className="w-10 h-10 text-primary" />
              </div>
              
              <div className="flex items-center justify-center gap-2">
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-foreground">
                  Know Your Rights
                </h2>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      title="Delete Conversation"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this conversation?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This consultation will be permanently deleted. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteThread}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              
              <p className="text-muted-foreground max-w-lg mx-auto text-sm md:text-base">
                Describe your situation — police, landlord, employer, or any legal problem. We'll tell you your exact rights and the steps you can take.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto mt-8">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                    }}
                    className="text-sm p-4 bg-white dark:bg-slate-800 border border-border/60 rounded-xl hover:border-accent/50 hover:shadow-md transition-all text-left text-foreground/80 hover:text-primary leading-relaxed"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages?.map((msg) => (
            <MessageBubble 
              key={msg.id}
              id={msg.id}
              role={msg.role as 'user' | 'assistant'} 
              content={msg.content}
              createdAt={msg.createdAt!}
              onDelete={(id) => deleteMessage(id)}
            />
          ))}

          {isPending && <LoadingBubble />}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-background border-t border-border z-10 shadow-sm">
        <div className="max-w-4xl mx-auto space-y-3">
          <form onSubmit={handleSubmit} className="relative flex items-end gap-3 bg-white dark:bg-slate-800 p-2 rounded-2xl border border-border shadow-sm focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your legal situation here... (English, Hindi, or any language)"
              className="min-h-[60px] max-h-[200px] border-0 focus-visible:ring-0 resize-none bg-transparent py-3 px-3 md:text-base"
            />
            <div className="flex items-center gap-1 mb-1 mr-1">
              <VoiceButton
                onTranscript={handleVoiceTranscript}
                disabled={isPending}
              />
              {/* M4: Download conversation */}
              {messages && messages.length > 0 && (
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={handleDownloadThread}
                  title="Download consultation as text"
                  className="h-10 w-10 rounded-xl shrink-0 text-muted-foreground hover:text-primary"
                >
                  <Download className="h-5 w-5" />
                </Button>
              )}
              <Button 
                type="submit" 
                size="icon"
                disabled={!input.trim() || isPending}
                className="h-10 w-10 rounded-xl shrink-0 bg-primary hover:bg-primary/90 transition-all shadow-md"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </form>

          <Alert className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 py-2.5 rounded-lg">
            <AlertTitle className="text-amber-800 dark:text-amber-200 text-[11px] font-bold uppercase tracking-wider mb-0.5 flex items-center gap-1.5">
              <Scale className="w-3 h-3" /> Disclaimer
            </AlertTitle>
            <AlertDescription className="text-amber-900/80 dark:text-amber-100/70 text-[10px] leading-relaxed">
              This is general legal information, not legal advice. For your specific case, consult a qualified advocate. Free legal aid is available through NALSA / DLSA.
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Guest query limit banner */}
      {isGuest && guestQueriesLeft > 0 && (
        <div className="absolute top-3 right-3 bg-accent/90 text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-md">
          {guestQueriesLeft} free {guestQueriesLeft === 1 ? 'query' : 'queries'} left
        </div>
      )}

      {/* Login prompt modal */}
      <LoginPrompt open={showLoginPrompt} onOpenChange={setShowLoginPrompt} />
    </div>
  );
}
