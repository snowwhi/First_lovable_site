import { useState, useCallback, useRef, useEffect } from "react";
import { Volume2, VolumeX, Pause, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TextToSpeechProps {
  text: string;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const TextToSpeech = ({ text, contentRef }: TextToSpeechProps) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const highlightText = useCallback((charIndex: number) => {
    if (!contentRef?.current) return;
    const el = contentRef.current;
    
    const blocks = el.querySelectorAll("p, li, h1, h2, h3, h4, blockquote");
    if (blocks.length === 0) return;

    const totalChars = text.length;
    const ratio = charIndex / totalChars;
    const targetIdx = Math.min(Math.floor(ratio * blocks.length), blocks.length - 1);

    blocks.forEach((node, i) => {
      const htmlEl = node as HTMLElement;
      if (i < targetIdx) {
        htmlEl.style.color = `hsl(var(--muted-foreground))`;
        htmlEl.style.opacity = "0.5";
        htmlEl.style.transition = "color 0.4s ease, opacity 0.4s ease";
      } else if (i === targetIdx) {
        htmlEl.style.color = `hsl(var(--primary))`;
        htmlEl.style.opacity = "1";
        htmlEl.style.fontWeight = "500";
        htmlEl.style.transition = "color 0.2s ease, opacity 0.2s ease";
        htmlEl.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        htmlEl.style.color = "";
        htmlEl.style.opacity = "";
        htmlEl.style.fontWeight = "";
        htmlEl.style.transition = "";
      }
    });
  }, [contentRef, text]);

  const resetHighlights = useCallback(() => {
    if (!contentRef?.current) return;
    const allEls = contentRef.current.querySelectorAll("p, li, h1, h2, h3, h4, span, a, blockquote");
    allEls.forEach((node) => {
      const el = node as HTMLElement;
      el.style.color = "";
      el.style.opacity = "";
      el.style.fontWeight = "";
      el.style.transition = "";
    });
  }, [contentRef]);

  const startSpeaking = useCallback(() => {
    if (!text) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onboundary = (event) => {
      if (event.name === "word") {
        highlightText(event.charIndex);
        setProgress((event.charIndex / text.length) * 100);
      }
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setProgress(0);
      resetHighlights();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setProgress(0);
      resetHighlights();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  }, [text, highlightText, resetHighlights]);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
    setProgress(0);
    resetHighlights();
  }, [resetHighlights]);

  const togglePause = useCallback(() => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPaused]);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <AnimatePresence mode="wait">
        {!isSpeaking ? (
          <motion.button
            key="play"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={startSpeaking}
            className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-95"
          >
            <Volume2 className="h-4 w-4" />
            Listen
          </motion.button>
        ) : (
          <motion.div
            key="controls"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex items-center gap-1"
          >
            <button
              onClick={togglePause}
              className="rounded-full bg-secondary p-2 text-secondary-foreground transition-colors hover:bg-secondary/80"
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
            <button
              onClick={stopSpeaking}
              className="rounded-full bg-destructive/10 p-2 text-destructive transition-colors hover:bg-destructive/20"
            >
              <VolumeX className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {isSpeaking && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 80, opacity: 1 }}
          className="h-1.5 rounded-full bg-secondary overflow-hidden"
        >
          <motion.div
            className="h-full rounded-full bg-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </motion.div>
      )}

      {isSpeaking && (
        <motion.div
          className="flex items-center gap-0.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-0.5 rounded-full bg-primary"
              animate={{ height: isPaused ? 8 : [8, 16, 8] }}
              transition={{
                duration: 0.5,
                repeat: isPaused ? 0 : Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default TextToSpeech;
