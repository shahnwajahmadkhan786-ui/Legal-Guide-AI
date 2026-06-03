import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
  className?: string;
}

// Extend Window for webkit prefix
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

export function VoiceButton({ onTranscript, disabled, className }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    // L4: Prefer Hindi recognition; falls back to English automatically
    recognition.lang = "hi-IN";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, []);

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      onClick={toggleListening}
      disabled={disabled}
      title={isListening ? "Stop listening" : "Voice input"}
      className={cn(
        "h-10 w-10 rounded-xl shrink-0 transition-all relative",
        isListening
          ? "text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100"
          : "text-muted-foreground hover:text-primary hover:bg-primary/5",
        className
      )}
    >
      {isListening ? (
        <>
          <MicOff className="h-5 w-5 relative z-10" />
          {/* Pulsing ring animation */}
          <span className="absolute inset-0 rounded-xl animate-ping bg-red-400/20" />
          <span className="absolute inset-1 rounded-lg animate-pulse bg-red-400/10" />
        </>
      ) : (
        <Mic className="h-5 w-5" />
      )}
    </Button>
  );
}
