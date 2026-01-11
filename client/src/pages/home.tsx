import { useState, useEffect } from "react";
import { ChatSidebar } from "@/components/chat-sidebar";
import { ChatInterface } from "@/components/chat-interface";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, MessageSquarePlus } from "lucide-react";
import { useRoute, useLocation } from "wouter";
import { useCreateThread, useThreads } from "@/hooks/use-legal-chat";

export default function Home() {
  const [match, params] = useRoute("/thread/:id");
  const [, setLocation] = useLocation();
  const { mutate: createThread, isPending: isCreating } = useCreateThread();
  const { data: threads, isLoading: isLoadingThreads } = useThreads();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If we are at root ("/") and have threads, redirect to most recent.
  // If no threads, create one automatically.
  useEffect(() => {
    if (!match && !isLoadingThreads) {
      if (threads && threads.length > 0) {
        setLocation(`/thread/${threads[0].id}`);
      } else if (threads && threads.length === 0 && !isCreating) {
        // No threads exist, create first one automatically
        createThread();
      }
    }
  }, [match, threads, isLoadingThreads, isCreating, setLocation, createThread]);

  const activeThreadId = match ? parseInt(params!.id) : null;

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-sans">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-80 h-full flex-shrink-0">
        <ChatSidebar className="h-full w-full" />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-background">
          <div className="flex items-center gap-2">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="-ml-2 text-muted-foreground">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <ChatSidebar />
              </SheetContent>
            </Sheet>
            <span className="font-serif font-bold text-foreground">Nyaya Sahayak</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => createThread()}
            disabled={isCreating}
            className="text-primary"
          >
            <MessageSquarePlus className="h-6 w-6" />
          </Button>
        </div>

        {/* Chat Interface or Loading State */}
        <div className="flex-1 h-full relative">
          {activeThreadId ? (
            <ChatInterface key={activeThreadId} threadId={activeThreadId} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground text-sm">Initializing consultation...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
