import { useState, useRef, useEffect } from "react";
import { useMessages, useSendMessage } from "@/hooks/use-legal-chat";
import { MessageBubble, LoadingBubble } from "@/components/message-bubble";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Gavel, Scale } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

interface ChatInterfaceProps {
  threadId: number;
}

export function ChatInterface({ threadId }: ChatInterfaceProps) {
  const { data: messages, isLoading } = useMessages(threadId);
  const { mutate: sendMessage, isPending } = useSendMessage(threadId);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

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
    
    sendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-50/30">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/30 relative">
      {/* Scrollable Message Area */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4 md:p-8">
        <div className="max-w-4xl mx-auto pb-6">
          {(!messages || messages.length === 0) && (
            <div className="text-center space-y-4 my-20">
              <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-6">
                <Gavel className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-serif font-bold text-foreground">
                How can I assist you legally?
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                I can help explain Indian laws (IPC, CrPC), draft simple legal notices, 
                or guide you on the next steps for your situation.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mt-8">
                {["Draft a rent agreement notice", "Rights during police arrest", "Filing a consumer complaint", "Divorce proceedings overview"].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInput(suggestion);
                      // Optional: auto-submit
                    }}
                    className="text-sm p-4 bg-white border border-border/60 rounded-xl hover:border-accent/50 hover:shadow-md transition-all text-left text-foreground/80 hover:text-primary"
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
              role={msg.role as 'user' | 'assistant'} 
              content={msg.content}
              createdAt={msg.createdAt!}
            />
          ))}

          {isPending && <LoadingBubble />}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-background border-t border-border z-10 shadow-sm">
        <div className="max-w-4xl mx-auto space-y-4">
          <form onSubmit={handleSubmit} className="relative flex items-end gap-3 bg-white p-2 rounded-2xl border border-border shadow-sm focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary transition-all">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe your legal situation here..."
              className="min-h-[60px] max-h-[200px] border-0 focus-visible:ring-0 resize-none bg-transparent py-3 px-3 md:text-base"
            />
            <Button 
              type="submit" 
              size="icon"
              disabled={!input.trim() || isPending}
              className="h-10 w-10 rounded-xl mb-1 mr-1 shrink-0 bg-primary hover:bg-primary/90 transition-all shadow-md"
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>

          <Alert className="bg-amber-50 border-amber-200 py-3 rounded-lg">
            <AlertTitle className="text-amber-800 text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-2">
              <Scale className="w-3 h-3" /> Important Disclaimer
            </AlertTitle>
            <AlertDescription className="text-amber-900/80 text-[11px] leading-relaxed">
              This information is for general legal awareness based on Indian law and does not constitute legal advice. 
              Always consult a qualified advocate for advice specific to your facts and circumstances.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
