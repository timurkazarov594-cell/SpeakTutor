import { useState, useRef, useCallback, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import {
  Mic, Flag, Shuffle, Loader2, PlayCircle, Lightbulb,
  Square, AlertCircle, ChevronUp, ChevronDown, CheckCircle2,
  MessageSquare, ArrowLeft, Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PaywallModal } from "@/components/PaywallModal";
import { getScenarioById } from "@/lib/scenarios";
import {
  getLevel, canSendMessage, recordMessageUsed, getScenarioMsgsUsed,
  SCENARIO_MESSAGES_LIMIT, FREE_MESSAGES_LIMIT, getFreeUsed, isPaid,
} from "@/lib/store";

const MIN_RECORDING_MS = 600;

// ── Types ─────────────────────────────────────────────────────────────────────

type CorrectionData = {
  score?: number;
  originalText?: string;
  correctedText?: string;
  grammarMistakes?: string[];
  vocabularyMistakes?: string[];
  pronunciationWarnings?: string[];
  nativeSpeakerVersion?: string;
  explanationRu?: string;
};

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
  correction?: CorrectionData;
};

type ProcessingStage = "transcribing" | "analyzing" | "tts";

// ── Component ─────────────────────────────────────────────────────────────────

export default function Session() {
  const params = useParams<{ scenarioId: string }>();
  const scenarioId = params.scenarioId ?? "";
  const [, setLocation] = useLocation();
  const scenario = getScenarioById(scenarioId);
  const level = getLevel() ?? "beginner";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<ProcessingStage | null>(null);
  const [introLoading, setIntroLoading] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [paywallVariant, setPaywallVariant] = useState<"purchase" | "scenario_done">("purchase");
  const [isPlaying, setIsPlaying] = useState(false);
  const [hintVisible, setHintVisible] = useState(false);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [expandedCorrections, setExpandedCorrections] = useState<Record<number, boolean>>({});

  // Text input — always visible
  const [textInput, setTextInput] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const audioPlayer = useRef<HTMLAudioElement | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const recordingStart = useRef<number>(0);
  const introTriggered = useRef(false);
  const nextId = useRef(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Message counters (live from localStorage)
  const msgsUsed = getScenarioMsgsUsed(scenarioId);
  const msgsTotal = isPaid() ? SCENARIO_MESSAGES_LIMIT : FREE_MESSAGES_LIMIT;
  const msgsRemaining = isPaid()
    ? Math.max(0, SCENARIO_MESSAGES_LIMIT - msgsUsed)
    : Math.max(0, FREE_MESSAGES_LIMIT - getFreeUsed());
  const isMessageLimitReached = msgsRemaining <= 0;

  // ── Scroll to bottom ──────────────────────────────────────────────────────

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isProcessing, introLoading]);

  // ── Trigger intro on mount ────────────────────────────────────────────────

  useEffect(() => {
    if (introTriggered.current || !scenario) return;
    introTriggered.current = true;
    triggerIntro();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Redirect if invalid scenario ──────────────────────────────────────────

  useEffect(() => {
    if (!scenario) setLocation("/scenarios");
  }, [scenario, setLocation]);

  if (!scenario) return null;

  // ── Helpers ───────────────────────────────────────────────────────────────

  const addMessage = (msg: Omit<ChatMessage, "id">) => {
    const id = nextId.current++;
    setMessages((prev) => [...prev, { ...msg, id }]);
    return id;
  };

  const playAudioBase64 = useCallback((base64: string) => {
    if (audioPlayer.current) audioPlayer.current.pause();
    const audio = new Audio(`data:audio/mp3;base64,${base64}`);
    audioPlayer.current = audio;
    setIsPlaying(true);
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play().catch(() => setIsPlaying(false));
  }, []);

  const playExistingAudio = async (text: string) => {
    if (isPlaying) { audioPlayer.current?.pause(); setIsPlaying(false); return; }
    try {
      const res = await fetch("/api/speaktutor/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) return;
      const data = await res.json() as { audioBase64: string };
      playAudioBase64(data.audioBase64);
    } catch { /* non-fatal */ }
  };

  // ── Intro ─────────────────────────────────────────────────────────────────

  const triggerIntro = async () => {
    setIntroLoading(true);
    try {
      const res = await fetch("/api/speaktutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, level, history: [], userMessage: "", isIntro: true }),
      });
      if (!res.ok) return;
      const data = await res.json() as { reply: string };
      addMessage({ role: "assistant", text: data.reply });
      try {
        const ttsRes = await fetch("/api/speaktutor/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: data.reply }),
        });
        if (ttsRes.ok) {
          const ttsData = await ttsRes.json() as { audioBase64: string };
          playAudioBase64(ttsData.audioBase64);
        }
      } catch { /* non-fatal */ }
    } catch { /* non-fatal */ }
    finally { setIntroLoading(false); }
  };

  // ── Hint ──────────────────────────────────────────────────────────────────

  const fetchHint = async () => {
    if (messages.length === 0) return;
    setHintLoading(true);
    setHintText(null);
    try {
      const lastAI = [...messages].reverse().find((m) => m.role === "assistant");
      if (lastAI) {
        const res = await fetch("/api/speaktutor/hint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ scenarioId, level, lastAIMessage: lastAI.text }),
        });
        if (res.ok) {
          const data = await res.json() as { hint: string };
          setHintText(data.hint);
        }
      }
    } catch { /* non-fatal */ }
    finally { setHintLoading(false); setHintVisible(true); }
  };

  // ── Core: handleUserAnswer — used by BOTH text input and voice ────────────

  const handleUserAnswer = async (userText: string) => {
    const trimmed = userText.trim();
    if (!trimmed || isProcessing) return;

    // Check message limit BEFORE sending
    const { allowed, reason } = canSendMessage(scenarioId);
    if (!allowed) {
      setPaywallVariant(reason === "scenario_limit" ? "scenario_done" : "purchase");
      setPaywallOpen(true);
      return;
    }

    setIsProcessing(true);
    setVoiceError("");
    setHintVisible(false);

    // Record usage
    recordMessageUsed(scenarioId);
    addMessage({ role: "user", text: trimmed });

    const history = messages.map((m) => ({ role: m.role, text: m.text }));

    try {
      setProcessingStage("analyzing");
      const cRes = await fetch("/api/speaktutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId, level, history, userMessage: trimmed }),
      });

      let reply = "";
      let correction: CorrectionData | undefined;

      if (cRes.ok) {
        const cData = await cRes.json() as { reply: string; correction?: CorrectionData };
        reply = cData.reply ?? "";
        correction = cData.correction;
      } else {
        setVoiceError("Ошибка соединения с ИИ. Проверьте интернет и повторите.");
      }

      // Attach correction to last user message
      setMessages((prev) => {
        const updated = [...prev];
        const lastUserIdx = updated.map((m) => m.role).lastIndexOf("user");
        if (lastUserIdx !== -1) {
          updated[lastUserIdx] = { ...updated[lastUserIdx], correction };
        }
        return updated;
      });

      if (reply) {
        addMessage({ role: "assistant", text: reply });
        setProcessingStage("tts");
        try {
          const ttsRes = await fetch("/api/speaktutor/tts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: reply }),
          });
          if (ttsRes.ok) {
            const ttsData = await ttsRes.json() as { audioBase64: string };
            playAudioBase64(ttsData.audioBase64);
          }
        } catch { /* non-fatal */ }
      }
    } finally {
      setIsProcessing(false);
      setProcessingStage(null);
    }
  };

  // ── Text submit handler ───────────────────────────────────────────────────

  const handleTextSend = async () => {
    if (!textInput.trim() || isProcessing) return;
    const text = textInput;
    setTextInput("");
    await handleUserAnswer(text);
  };

  // ── Voice recording ───────────────────────────────────────────────────────

  const handleStartRecording = async () => {
    if (isProcessing || isRecording) return;
    setVoiceError("");

    // Check limit before even starting mic
    const { allowed, reason } = canSendMessage(scenarioId);
    if (!allowed) {
      setPaywallVariant(reason === "scenario_limit" ? "scenario_done" : "purchase");
      setPaywallOpen(true);
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (audioPlayer.current) { audioPlayer.current.pause(); setIsPlaying(false); }

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/mp4") ? "audio/mp4"
        : undefined;

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.current.push(e.data); };
      recorder.onstop = () => {
        const duration = Date.now() - recordingStart.current;
        const blob = new Blob(audioChunks.current, { type: mimeType ?? "audio/webm" });
        audioChunks.current = [];
        stream.getTracks().forEach((t) => t.stop());
        if (duration < MIN_RECORDING_MS) {
          setVoiceError("Запись слишком короткая. Нажмите и держите, затем говорите дольше.");
          return;
        }
        processAudio(blob, mimeType ?? "audio/webm");
      };
      audioChunks.current = [];
      recordingStart.current = Date.now();
      recorder.start();
      mediaRecorder.current = recorder;
      setIsRecording(true);
    } catch (err) {
      const name = (err as { name?: string }).name ?? "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setVoiceError("Разрешите доступ к микрофону в настройках браузера.");
      } else if (name === "NotFoundError") {
        setVoiceError("Микрофон не найден. Введите ответ текстом ниже.");
      } else {
        setVoiceError("Не удалось запустить запись. Введите ответ текстом ниже.");
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

  // ── Voice → Whisper → handleUserAnswer ───────────────────────────────────

  const processAudio = async (blob: Blob, mimeType: string) => {
    setIsProcessing(true);
    setProcessingStage("transcribing");
    setVoiceError("");

    try {
      const base64data = await blobToBase64(blob);
      const tRes = await fetch("/api/speaktutor/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ audioBase64: base64data, mimeType }),
      });
      const tData = await tRes.json() as { text?: string; error?: string; code?: string };

      if (!tRes.ok) {
        if (tData.code === "NO_API_KEY") {
          setVoiceError("API ключ OpenAI не настроен на сервере.");
        } else {
          setVoiceError("Голос не распознан. Попробуйте ещё раз или введите ответ текстом.");
        }
        setIsProcessing(false);
        setProcessingStage(null);
        return;
      }

      const transcribedText = tData.text?.trim() ?? "";
      if (!transcribedText) {
        setVoiceError("Голос не распознан. Попробуйте ещё раз или введите ответ текстом.");
        setIsProcessing(false);
        setProcessingStage(null);
        return;
      }

      // Pre-fill text input with transcription so user can edit before sending
      setTextInput(transcribedText);
      // Also send immediately
      setIsProcessing(false);
      setProcessingStage(null);
      await handleUserAnswer(transcribedText);
    } catch {
      setVoiceError("Нет соединения с сервером. Введите ответ текстом.");
      setIsProcessing(false);
      setProcessingStage(null);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(",")[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });

  const handleEndSession = () => setLocation("/scenarios");
  const handleNewScenario = () => setLocation("/scenarios");

  // ── UI helpers ────────────────────────────────────────────────────────────

  const processingLabel: Record<string, string> = {
    transcribing: "Распознаём речь через Whisper…",
    analyzing: "Анализируем вашу фразу…",
    tts: "Репетитор готовит ответ…",
  };

  const inputDisabled = isProcessing || isMessageLimitReached;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-screen bg-background relative overflow-hidden">
      <PaywallModal
        open={paywallOpen}
        variant={paywallVariant}
        onClose={() => setPaywallOpen(false)}
        onActivated={() => setPaywallOpen(false)}
      />

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className={`absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(0,229,255,0.04)_0%,transparent_70%)] blur-3xl transition-opacity duration-1000 ${isRecording ? "opacity-100" : "opacity-30"}`} />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border/50 bg-card/50 backdrop-blur z-10 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/scenarios">
            <button className="text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 shrink-0 truncate max-w-[140px]">
            {scenario.title}
          </Badge>
          <div className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${
            msgsRemaining <= 1 && msgsRemaining > 0
              ? "border-orange-500/40 bg-orange-500/10 text-orange-500"
              : isMessageLimitReached
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-primary/30 bg-primary/5 text-primary"
          }`}>
            <MessageSquare className="w-3 h-3" />
            {isPaid() ? `${msgsRemaining} из ${msgsTotal}` : `Бесплатно: ${msgsRemaining}`}
          </div>
          {isRecording && (
            <div className="flex items-center gap-1.5 text-sm font-medium text-red-500 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              Запись…
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline" size="sm"
            className="gap-1.5 text-muted-foreground hover:text-primary hover:border-primary/50"
            onClick={handleNewScenario}
          >
            <Shuffle className="w-4 h-4" />
            <span className="hidden sm:inline">Другой</span>
          </Button>
          <Button
            variant="ghost" size="sm"
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleEndSession}
          >
            <Flag className="w-4 h-4 mr-1.5" />
            <span className="hidden sm:inline">Завершить</span>
          </Button>
        </div>
      </header>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10" ref={scrollRef}>
        <div className="max-w-3xl mx-auto space-y-6">

          {/* Intro loading */}
          {introLoading && (
            <div className="flex items-start">
              <div className="bg-card border border-border shadow-sm rounded-2xl rounded-tl-sm p-4 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
                <span className="text-sm text-muted-foreground">Репетитор начинает сценарий…</span>
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
              <div className={`relative max-w-[85%] rounded-2xl p-4 md:p-5 ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-card border border-border shadow-sm rounded-tl-sm"
              }`}>
                {msg.role === "assistant" && (
                  <Button
                    variant="ghost" size="icon"
                    className="absolute -left-12 top-2 rounded-full w-8 h-8 bg-background border border-border shadow-sm hover:bg-secondary"
                    onClick={() => playExistingAudio(msg.text)}
                  >
                    <PlayCircle className="w-5 h-5" />
                  </Button>
                )}
                {msg.role === "assistant" ? (
                  <IntroMessage text={msg.text} />
                ) : (
                  <p className="text-[15px] leading-relaxed whitespace-pre-line">{msg.text}</p>
                )}
              </div>

              {msg.role === "user" && msg.correction && (
                <CorrectionCard
                  msg={msg}
                  expanded={!!expandedCorrections[msg.id]}
                  onToggle={() => setExpandedCorrections((prev) => ({ ...prev, [msg.id]: !prev[msg.id] }))}
                />
              )}
            </div>
          ))}

          {/* AI processing indicator */}
          {isProcessing && (
            <div className="flex items-start">
              <div className="bg-card border border-border shadow-sm rounded-2xl rounded-tl-sm p-4 flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  {processingLabel[processingStage ?? "analyzing"] ?? "Обрабатываем…"}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hint card */}
      {hintVisible && hintText && (
        <div className="z-20 px-4 md:px-8 pb-2">
          <div className="max-w-3xl mx-auto">
            <Card className="border-primary/30 bg-primary/5 animate-in slide-in-from-bottom-4 duration-300">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-primary" />
                  Подсказка
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setHintVisible(false)}>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground leading-relaxed">{hintText}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ── Bottom controls ────────────────────────────────────────────────── */}
      <div className="shrink-0 border-t border-border/50 bg-card/60 backdrop-blur z-20">
        <div className="max-w-3xl mx-auto p-4 space-y-3">

          {/* Voice error banner */}
          {voiceError && (
            <div className="flex items-center gap-2 text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2.5 justify-center">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-center">{voiceError}</span>
            </div>
          )}

          {/* Message limit banner */}
          {isMessageLimitReached && !paywallOpen && (
            <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/30 rounded-xl px-4 py-3">
              <MessageSquare className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="text-sm text-orange-400 flex-1">
                {isPaid() ? "Сценарий завершён. Выберите другой." : "Пробный доступ закончился."}
              </span>
              <Button
                size="sm"
                className="bg-orange-500 hover:bg-orange-600 text-white shrink-0"
                onClick={() => {
                  setPaywallVariant(isPaid() ? "scenario_done" : "purchase");
                  setPaywallOpen(true);
                }}
              >
                {isPaid() ? "Другой" : "Купить"}
              </Button>
            </div>
          )}

          {/* Row: mic + hint */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline" size="sm"
              className={`gap-2 rounded-full px-4 flex-1 sm:flex-none transition-all ${hintVisible ? "border-primary text-primary" : "text-muted-foreground"}`}
              onClick={hintVisible ? () => setHintVisible(false) : fetchHint}
              disabled={hintLoading || isProcessing || messages.length === 0}
            >
              {hintLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lightbulb className="w-4 h-4" />}
              Подсказка
            </Button>

            {/* Mic button — press & hold */}
            <div className="relative shrink-0">
              <div className={`absolute inset-0 rounded-full transition-all duration-300 ${isRecording ? "animate-ping bg-red-500/30 scale-150" : ""}`} />
              <button
                className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg focus:outline-none focus:ring-4 ${
                  inputDisabled && !isRecording
                    ? "bg-muted cursor-not-allowed opacity-60"
                    : isRecording
                    ? "bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.5)] focus:ring-red-500/30"
                    : "bg-primary hover:bg-primary/90 shadow-[0_0_20px_-5px_rgba(0,229,255,0.5)] focus:ring-primary/30"
                }`}
                onMouseDown={inputDisabled ? undefined : handleStartRecording}
                onMouseUp={handleStopRecording}
                onTouchStart={(e) => { e.preventDefault(); if (!inputDisabled) handleStartRecording(); }}
                onTouchEnd={handleStopRecording}
                disabled={inputDisabled}
                title={isRecording ? "Отпустите, чтобы отправить" : "Нажмите и держите для записи голоса"}
                aria-label={isRecording ? "Остановить запись" : "Записать голос"}
              >
                {isRecording ? (
                  <Square className="w-6 h-6 text-white fill-white" />
                ) : (
                  <Mic className="w-6 h-6 text-primary-foreground" />
                )}
              </button>
            </div>

            <div className="text-xs text-muted-foreground text-right flex-1 sm:flex-none hidden sm:block">
              {isRecording ? "Отпустите для отправки" : "Держите для записи голоса"}
            </div>
          </div>

          {/* ── Text input — always visible ──────────────────────────────── */}
          <div className={`flex gap-2 transition-opacity ${inputDisabled ? "opacity-60 pointer-events-none" : ""}`}>
            <textarea
              ref={textareaRef}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleTextSend();
                }
              }}
              placeholder="Введите ответ текстом по-английски…"
              rows={2}
              className="flex-1 resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-colors"
              disabled={inputDisabled}
            />
            <Button
              className="rounded-xl px-4 self-end gap-2"
              disabled={!textInput.trim() || inputDisabled}
              onClick={handleTextSend}
            >
              {isProcessing && processingStage !== "transcribing"
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />
              }
              <span className="hidden sm:inline">Отправить</span>
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────────

function IntroMessage({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        const isEnglishLine = /^[A-Z"']/.test(line.trim()) && !/[а-яё]/i.test(line);
        if (isEnglishLine) {
          return (
            <p key={i} className="text-[17px] leading-relaxed font-semibold text-foreground">
              {line}
            </p>
          );
        }
        return (
          <p key={i} className={`text-[14px] leading-relaxed ${
            line.includes("Ответь") || line.includes("Ответьте")
              ? "text-primary font-medium"
              : "text-muted-foreground"
          }`}>
            {line}
          </p>
        );
      })}
    </div>
  );
}

function CorrectionCard({
  msg, expanded, onToggle,
}: {
  msg: ChatMessage;
  expanded: boolean;
  onToggle: () => void;
}) {
  const c = msg.correction as CorrectionData;
  if (!c) return null;
  const score = c.score ?? 7;
  const hasErrors =
    (c.grammarMistakes?.length ?? 0) > 0 ||
    (c.vocabularyMistakes?.length ?? 0) > 0 ||
    (c.pronunciationWarnings?.length ?? 0) > 0;

  const scoreColor =
    score >= 9 ? "text-green-500" : score >= 7 ? "text-primary" : score >= 5 ? "text-orange-500" : "text-destructive";

  return (
    <div className="mt-2 w-full max-w-[85%] self-end">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2 bg-card border border-border rounded-xl text-sm hover:border-primary/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          {hasErrors
            ? <AlertCircle className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            : <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
          }
          <span className="text-muted-foreground text-xs">
            {hasErrors ? "Есть ошибки — нажми для разбора" : "Всё верно!"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`font-bold text-sm ${scoreColor}`}>{score}/10</span>
          {expanded
            ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
            : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          }
        </div>
      </button>

      {expanded && (
        <div className="mt-1 bg-card border border-border rounded-xl p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {c.explanationRu && (
            <p className="text-sm text-muted-foreground leading-relaxed">{c.explanationRu}</p>
          )}
          {c.correctedText && c.correctedText !== c.originalText && (
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Исправление</div>
              <p className="text-sm font-medium text-green-400">✓ {c.correctedText}</p>
            </div>
          )}
          {c.nativeSpeakerVersion && c.nativeSpeakerVersion !== c.originalText && (
            <div className="space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Как скажет носитель</div>
              <p className="text-sm italic text-primary/80">"{c.nativeSpeakerVersion}"</p>
            </div>
          )}
          {(c.grammarMistakes?.length ?? 0) > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Грамматика</div>
              {c.grammarMistakes!.map((m, i) => (
                <div key={i} className="text-xs text-orange-400 flex items-start gap-1.5 mt-0.5">
                  <span className="shrink-0 mt-0.5">•</span>{m}
                </div>
              ))}
            </div>
          )}
          {(c.vocabularyMistakes?.length ?? 0) > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Словарный запас</div>
              {c.vocabularyMistakes!.map((m, i) => (
                <div key={i} className="text-xs text-orange-400 flex items-start gap-1.5 mt-0.5">
                  <span className="shrink-0 mt-0.5">•</span>{m}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
