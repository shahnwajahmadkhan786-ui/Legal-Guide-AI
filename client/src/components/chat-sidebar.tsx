import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Plus, MessageSquare, Shield, LogOut, User, BarChart3 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useThreads, useCreateThread } from "@/hooks/use-legal-chat";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

export function ChatSidebar({ className }: { className?: string }) {
  const [location] = useLocation();
  const { data: threads, isLoading } = useThreads();
  const { mutate: createThread, isPending: isCreating } = useCreateThread();
  const { user, signOut } = useAuth();

  return (
    <div className={cn("flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-r border-border/50", className)}>
      {/* Header */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Shield className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif font-bold text-lg leading-tight text-foreground">NyayaSahay</h1>
                <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-gradient-to-r from-accent to-amber-500 text-white rounded-md shadow-sm">
                  Beta
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-medium">Your Rights, Your Voice</p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            {user?.email === "shahnwajahmad345@gmail.com" && (
              <Link href="/admin">
                <Button variant="ghost" size="icon" title="Admin Dashboard">
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </Link>
            )}
            {user ? (
              <Button variant="ghost" size="icon" onClick={() => signOut()} title="Logout">
                <LogOut className="h-4 w-4" />
              </Button>
            ) : (
              <Link href="/auth">
                <Button variant="outline" size="sm" className="text-xs gap-1.5 h-8">
                  <LogOut className="h-3 w-3" /> Login
                </Button>
              </Link>
            )}
          </div>
        </div>

        {user && (
          <div className="flex items-center gap-3 p-3 mb-4 bg-muted/50 rounded-lg border border-border/50">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full" />
              ) : (
                <User className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{user?.displayName || user?.email || "User"}</p>
              <p className="text-[10px] text-muted-foreground">Logged In</p>
            </div>
          </div>
        )}
        
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
                        ? "bg-white dark:bg-slate-800 border-border shadow-sm text-primary font-medium" 
                        : "text-muted-foreground hover:bg-white/50 dark:hover:bg-slate-800/50 hover:text-foreground hover:shadow-sm"
                    )}
                  >
                    <MessageSquare className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-accent" : "text-muted-foreground group-hover:text-accent")} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate">
                        {thread.title || `Consultation`}
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
      <div className="p-4 border-t border-border/50 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="bg-accent/10 rounded-md p-3 border border-accent/20">
          <p className="text-[10px] text-primary/80 dark:text-primary/60 leading-relaxed text-center font-medium">
            AI-generated legal awareness based on Indian law. Not a substitute for a lawyer — always consult one.
          </p>
        </div>
      </div>
    </div>
  );
}
