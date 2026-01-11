import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Scale } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useThreads, useCreateThread } from "@/hooks/use-legal-chat";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function ChatSidebar({ className }: { className?: string }) {
  const [location] = useLocation();
  const { data: threads, isLoading } = useThreads();
  const { mutate: createThread, isPending: isCreating } = useCreateThread();

  return (
    <div className={cn("flex flex-col h-full bg-slate-50 border-r border-border/50", className)}>
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Scale className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-lg leading-tight text-foreground">Nyaya Sahayak</h1>
            <p className="text-xs text-muted-foreground font-medium">Indian Legal Assistant</p>
          </div>
        </div>
        
        <Button 
          onClick={() => createThread()} 
          disabled={isCreating}
          className="w-full bg-primary hover:bg-primary/90 shadow-md transition-all active:scale-[0.98]"
        >
          {isCreating ? "Creating..." : (
            <>
              <Plus className="mr-2 h-4 w-4" /> New Consultation
            </>
          )}
        </Button>
      </div>

      {/* Threads List */}
      <ScrollArea className="flex-1 px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </div>
        ) : threads?.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-sm text-muted-foreground">No consultations yet. Start a new one to receive guidance.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">Recent History</h3>
            {threads?.map((thread) => {
              const isActive = location === `/thread/${thread.id}`;
              return (
                <Link key={thread.id} href={`/thread/${thread.id}`}>
                  <div
                    className={cn(
                      "group flex items-center gap-3 px-3 py-3 rounded-md text-sm transition-all duration-200 cursor-pointer border border-transparent",
                      isActive 
                        ? "bg-white border-border shadow-sm text-primary font-medium" 
                        : "text-muted-foreground hover:bg-white/50 hover:text-foreground hover:shadow-sm"
                    )}
                  >
                    <MessageSquare className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-accent" : "text-muted-foreground group-hover:text-accent")} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">
                        {thread.title || `Consultation #${thread.id}`}
                      </p>
                      <span className="text-[10px] text-muted-foreground/70 block mt-0.5">
                        {thread.createdAt && format(new Date(thread.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Footer Info */}
      <div className="p-4 border-t border-border/50 bg-slate-50/50">
        <div className="bg-accent/10 rounded-md p-3 border border-accent/20">
          <p className="text-[10px] text-primary/80 leading-relaxed text-center font-medium">
            AI-generated guidance based on Indian Law (IPC, CrPC, etc). Not a substitute for a lawyer.
          </p>
        </div>
      </div>
    </div>
  );
}
