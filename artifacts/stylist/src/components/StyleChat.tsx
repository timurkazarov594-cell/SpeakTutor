import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, MessageCircle } from "lucide-react";
import { useAnalyzeStyle, type QuizAnswers, type OutfitResult } from "@workspace/api-client-react";

interface StyleChatProps {
  isOpen: boolean;
  onClose: () => void;
  quizAnswers: QuizAnswers;
  onNewResult?: (result: OutfitResult) => void;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function StyleChat({ isOpen, onClose, quizAnswers, onNewResult }: StyleChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Your outfit has been curated. Want me to adjust anything? Ask me to swap a piece, change the vibe, or refine for a specific occasion.",
    },
  ]);
  const [input, setInput] = useState("");
  const analyzeMutation = useAnalyzeStyle();

  const sendMessage = () => {
    if (!input.trim() || analyzeMutation.isPending) return;

    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);

    analyzeMutation.mutate(
      {
        data: {
          photo: null,
          quizAnswers: { ...quizAnswers, chatMessage: userMsg },
        },
      },
      {
        onSuccess: (result) => {
          const response =
            result.chatResponse ||
            `I've updated your outfit based on your request. ${result.styleNarrative}`;
          setMessages((prev) => [...prev, { role: "assistant", content: response }]);
          if (onNewResult) onNewResult(result);
        },
        onError: () => {
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: "I couldn't process that request. Please try again." },
          ]);
        },
      },
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm flex flex-col"
            style={{
              background: "rgba(12, 13, 16, 0.98)",
              backdropFilter: "blur(20px)",
              borderLeft: "1px solid rgba(212,175,55,0.15)",
            }}
            data-testid="style-chat-drawer"
          >
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(212,175,55,0.1)" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.25)" }}
                >
                  <MessageCircle size={14} style={{ color: "#d4af37" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold">AI Stylist</p>
                  <p className="text-xs text-muted-foreground">Refine your look</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="chat-close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  data-testid={`chat-message-${msg.role}`}
                >
                  <div
                    className="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                    style={
                      msg.role === "user"
                        ? { background: "linear-gradient(135deg, #d4af37 0%, #f5e07a 100%)", color: "#000" }
                        : {
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.85)",
                          }
                    }
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {analyzeMutation.isPending && (
                <div className="flex justify-start">
                  <div
                    className="px-4 py-3 rounded-2xl text-sm"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
                  >
                    <div className="flex gap-1.5 items-center">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ background: "#d4af37" }}
                          animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(212,175,55,0.1)" }}>
              <div
                className="flex items-center gap-3 px-4 py-3 rounded-full"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask me to refine your look..."
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
                  data-testid="chat-input"
                />
                <motion.button
                  onClick={sendMessage}
                  disabled={!input.trim() || analyzeMutation.isPending}
                  className="w-8 h-8 rounded-full flex items-center justify-center disabled:opacity-30 flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #d4af37 0%, #f5e07a 100%)" }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  data-testid="chat-send"
                >
                  <Send size={13} className="text-black" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
