import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { palette, commonStyles } from "../../theme";
import { AppCard } from "../../components/AppCard";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Message } from "../../types";
import { api } from "../../api/api";
import { screenPadding } from "../../styles/screenStyles";
import { prettifyCvLine } from "../../utils/cvFeedback";
import { formatCoachFeedback, formatCoachQuestion } from "../../utils/coachText";
import { confirmAction, showAlert } from "../../utils/alert";
import { useTheme } from "../../theme/ThemeContext";

const COMPOSER_MIN_HEIGHT = 44;
const COMPOSER_MAX_HEIGHT = 108;

const PROMPTS = [
  {
    id: "task",
    label: "Assign me a new task",
    subtitle: "A focused assignment for your technical skills",
    icon: "list-circle-outline" as const,
  },
  {
    id: "interview",
    label: "Let's practice for an interview",
    subtitle: "STAR-style behavioral prompts",
    icon: "mic-outline" as const,
  },
  {
    id: "reflect",
    label: "Help me reflect on my progress",
    subtitle: "One guided reflection with feedback",
    icon: "leaf-outline" as const,
  },
  {
    id: "comm",
    label: "Help to improve my communication skills",
    subtitle: "Workplace scenarios • 7Cs • type exit when done",
    icon: "chatbubbles-outline" as const,
  },
] as const;

function fmtTime(d: Date) {
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtSessionDate(value: string | null | undefined) {
  if (!value) return "Unknown date";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "Unknown date";
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type ChatSessionSummary = {
  id: number;
  topic: string;
  started_at: string | null;
  message_count: number;
  preview: string;
};

export type PendingTaskAnswerPayload = {
  userCommonTaskId: number;
  taskText: string;
  skillName: string;
};

type Phase =
  | { kind: "home" }
  | { kind: "interview"; questionNumber: number; questionText: string; awaitingFeedback: boolean }
  | { kind: "reflection"; questionNumber: number; questionText: string; awaitingFeedback: boolean }
  | { kind: "communication" }
  | { kind: "task_answer"; payload: PendingTaskAnswerPayload };

export function AICoachScreen({
  pendingTaskAnswer,
  onConsumedPendingTask,
}: {
  pendingTaskAnswer?: PendingTaskAnswerPayload | null;
  onConsumedPendingTask?: () => void;
}) {
  const { height } = useWindowDimensions();
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatSessionId, setChatSessionId] = useState<number | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [phase, setPhase] = useState<Phase>({ kind: "home" });
  /** Input bar hidden until user picks a path or opens task answer from Tasks. */
  const [showComposer, setShowComposer] = useState(false);
  const [reflectionShowNext, setReflectionShowNext] = useState(false);
  const [interviewShowNext, setInterviewShowNext] = useState(false);
  const [cvLocalSummary, setCvLocalSummary] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [inputHeight, setInputHeight] = useState(COMPOSER_MIN_HEIGHT);
  const [showHistory, setShowHistory] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historySessions, setHistorySessions] = useState<ChatSessionSummary[]>([]);
  const scrollRef = useRef<ScrollView>(null);
  const { colors } = useTheme();

  const resetComposerHeight = useCallback(() => setInputHeight(COMPOSER_MIN_HEIGHT), []);
  const clearComposerInput = useCallback(() => {
    setInput("");
    resetComposerHeight();
  }, [resetComposerHeight]);

  const activeTaskAnswer = useMemo((): PendingTaskAnswerPayload | null => {
    if (phase.kind === "task_answer") return phase.payload;
    if (pendingTaskAnswer) return pendingTaskAnswer;
    return null;
  }, [phase, pendingTaskAnswer]);

  /** Prompt strip only on home — active flows get full chat height for questions. */
  const showPromptBand = phase.kind === "home";
  const promptBandMaxHeight = useMemo(() => {
    const cap = height * 0.28;
    return Math.min(Math.round(cap), 260);
  }, [height]);

  const pushAura = useCallback((content: string, category?: string) => {
    setMessages((c) => [
      ...c,
      {
        id: Date.now() + Math.random(),
        type: "aura",
        content,
        timestamp: fmtTime(new Date()),
        category,
      },
    ]);
  }, []);

  const pushUser = useCallback((content: string) => {
    setMessages((c) => [
      ...c,
      { id: Date.now() + Math.random(), type: "user", content, timestamp: fmtTime(new Date()) },
    ]);
  }, []);

  /**
   * Single bootstrap: loads history (or welcome), then appends deep-linked task answer lines so
   * async history hydration cannot wipe them (fixes navigation from Tasks).
   */
  useEffect(() => {
    let cancelled = false;
    const pendingAtMount = pendingTaskAnswer ?? null;

    (async () => {
      let nextSessionId: number | null = null;
      let baseMessages: Message[] = [];

      try {
        const hist = await api.getAgentChatHistory();
        if (cancelled) return;
        if ((hist.messages?.length ?? 0) > 0 && hist.session_id != null) {
          nextSessionId = hist.session_id;
          baseMessages = hist.messages.map((m, i) => ({
            id: typeof m.id === "number" ? m.id : 2000 + i,
            type: m.role === "user" ? ("user" as const) : ("aura" as const),
            content: m.content,
            timestamp: fmtTime(new Date()),
          }));
        }
      } catch {
        /* welcome path below */
      }

      if (cancelled) return;

      if (baseMessages.length === 0) {
        try {
          const [quote, reminder] = await Promise.all([
            api.getMotivationalQuote().catch(() => null),
            api.getDailyTaskReminder().catch(() => null),
          ]);
          if (cancelled) return;
          const parts = [quote?.message, reminder?.message].filter(Boolean);
          baseMessages = [
            {
              id: 1,
              type: "aura",
              content:
                parts.length > 0
                  ? parts.join("\n\n")
                  : "Choose a guided path below, or analyze your CV. Your coach adapts to your goal and saves progress automatically.",
              timestamp: fmtTime(new Date()),
              category: "Welcome",
            },
          ];
        } catch {
          if (!cancelled) {
            baseMessages = [
              {
                id: 1,
                type: "aura",
                content: "Choose a guided path below to begin.",
                timestamp: fmtTime(new Date()),
                category: "Welcome",
              },
            ];
          }
        }
      }

      if (cancelled) return;

      const t = fmtTime(new Date());
      if (pendingAtMount) {
        const uid = Date.now();
        baseMessages = [
          ...baseMessages,
          {
            id: uid,
            type: "user",
            content: "I'm ready to answer my agent task.",
            timestamp: t,
          },
          {
            id: uid + 1,
            type: "aura",
            content: `Review the **Your task** card above for full instructions. Submissions are graded on **${pendingAtMount.skillName}** only.`,
            timestamp: t,
            category: "Task answer",
          },
        ];
        setPhase({ kind: "task_answer", payload: pendingAtMount });
        setShowComposer(true);
        setInterviewShowNext(false);
        onConsumedPendingTask?.();
      } else {
        setShowComposer(false);
      }

      if (nextSessionId != null) setChatSessionId(nextSessionId);
      setMessages(baseMessages);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only run bootstrap on mount; pending is captured from first paint
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping, interviewShowNext, reflectionShowNext, showComposer, activeTaskAnswer]);

  const resetToHome = useCallback(() => {
    setPhase({ kind: "home" });
    setShowComposer(false);
    setInterviewShowNext(false);
    setReflectionShowNext(false);
    clearComposerInput();
  }, [clearComposerInput]);

  const startNewChat = useCallback(async () => {
    const ok = await confirmAction(
      "Start new chat?",
      "Your previous session stays saved, but this screen will reset so you can begin fresh.",
    );
    if (!ok) return;

    setIsTyping(true);
    try {
      const res = await api.agentNewChatSession();
      setChatSessionId(res.session_id);
      setMessages([
        {
          id: Date.now(),
          type: "aura",
          content:
            "Fresh chat started. Choose a guided path below, upload your CV, or ask for a new task when you are ready.",
          timestamp: fmtTime(new Date()),
          category: "New chat",
        },
      ]);
      setCvLocalSummary("");
      setFileName("");
      resetToHome();
    } catch (e) {
      showAlert("Could not start new chat", (e as Error).message);
    } finally {
      setIsTyping(false);
    }
  }, [resetToHome]);

  const openChatHistory = useCallback(async () => {
    setShowHistory(true);
    setHistoryLoading(true);
    try {
      const data = await api.getAgentChatSessions();
      setHistorySessions(Array.isArray(data.sessions) ? data.sessions : []);
    } catch (e) {
      setHistorySessions([]);
      showAlert("Could not load chat history", (e as Error).message);
      setShowHistory(false);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadChatSession = useCallback(
    async (sessionId: number) => {
      setHistoryLoading(true);
      try {
        const hist = await api.getAgentChatHistory(sessionId);
        const loaded: Message[] = (hist.messages ?? []).map((m, i) => ({
          id: typeof m.id === "number" ? m.id : 3000 + i,
          type: m.role === "user" ? ("user" as const) : ("aura" as const),
          content: m.content,
          timestamp: fmtTime(new Date()),
        }));
        setChatSessionId(hist.session_id ?? sessionId);
        setMessages(
          loaded.length > 0
            ? loaded
            : [
                {
                  id: Date.now(),
                  type: "aura",
                  content: "This session has no messages yet.",
                  timestamp: fmtTime(new Date()),
                  category: "History",
                },
              ],
        );
        resetToHome();
        setShowHistory(false);
      } catch (e) {
        showAlert("Could not open session", (e as Error).message);
      } finally {
        setHistoryLoading(false);
      }
    },
    [resetToHome],
  );

  const runAssignTask = async () => {
    pushUser("Assign me a new task");
    setShowComposer(false);
    setIsTyping(true);
    try {
      const res = await api.agentTaskGenerate({
        sessionId: chatSessionId,
        chatUserMessage: "Assign me a new task",
      });
      setChatSessionId(res.session_id);
      pushAura(res.chat_message, "New task");
    } catch (e) {
      pushAura(`Could not generate a task: ${(e as Error).message}`, "Error");
    } finally {
      setIsTyping(false);
    }
  };

  const startInterview = async () => {
    pushUser("Let's practice for an interview");
    setShowComposer(true);
    setInterviewShowNext(false);
    setIsTyping(true);
    try {
      const q = await api.agentInterviewQuestion(1, {
        sessionId: chatSessionId,
        chatUserMessage: "Let's practice for an interview",
      });
      setChatSessionId(q.session_id);
      setPhase({
        kind: "interview",
        questionNumber: q.question_number,
        questionText: q.question,
        awaitingFeedback: true,
      });
      pushAura(formatCoachQuestion("Question", q.question_number, q.question), "Interview");
    } catch (e) {
      pushAura(`Interview could not start: ${(e as Error).message}`, "Error");
      resetToHome();
    } finally {
      setIsTyping(false);
    }
  };

  const startCommunication = async () => {
    const label = PROMPTS[3].label;
    pushUser(label);
    setPhase({ kind: "communication" });
    setShowComposer(true);
    setInterviewShowNext(false);
    setReflectionShowNext(false);
    setIsTyping(true);
    try {
      const res = await api.agentChat(label, null, "communication");
      setChatSessionId(res.session_id);
      pushAura(formatCoachFeedback(res.reply), "Communication");
      if (res.follow_up?.trim()) {
        pushAura(formatCoachFeedback(res.follow_up.trim()), "Review");
      }
    } catch (e) {
      pushAura(`Something went wrong: ${(e as Error).message}`, "Error");
      resetToHome();
    } finally {
      setIsTyping(false);
    }
  };

  const startReflection = async () => {
    pushUser(PROMPTS[2].label);
    setInterviewShowNext(false);
    setReflectionShowNext(false);
    setShowComposer(true);
    setIsTyping(true);
    try {
      const q = await api.agentReflectionQuestion(1, {
        sessionId: chatSessionId,
        chatUserMessage: PROMPTS[2].label,
      });
      setChatSessionId(q.session_id);
      setPhase({
        kind: "reflection",
        questionNumber: q.question_number,
        questionText: q.question,
        awaitingFeedback: true,
      });
      pushAura(formatCoachQuestion("Reflection", q.question_number, q.question), "Reflection");
    } catch (e) {
      pushAura(`Reflection could not start: ${(e as Error).message}`, "Error");
      resetToHome();
    } finally {
      setIsTyping(false);
    }
  };

  const nextReflectionQuestion = async () => {
    if (phase.kind !== "reflection") return;
    const nextN = phase.questionNumber + 1;
    setReflectionShowNext(false);
    setIsTyping(true);
    try {
      const q = await api.agentReflectionQuestion(nextN, { sessionId: chatSessionId });
      setChatSessionId(q.session_id);
      setShowComposer(true);
      setPhase({
        kind: "reflection",
        questionNumber: q.question_number,
        questionText: q.question,
        awaitingFeedback: true,
      });
      pushAura(formatCoachQuestion("Reflection", q.question_number, q.question), "Reflection");
    } catch (e) {
      pushAura(`Next reflection failed: ${(e as Error).message}`, "Error");
    } finally {
      setIsTyping(false);
    }
  };

  const onPickPrompt = (id: (typeof PROMPTS)[number]["id"]) => {
    if (phase.kind !== "home") return;
    if (id === "task") runAssignTask();
    else if (id === "interview") startInterview();
    else if (id === "reflect") startReflection();
    else if (id === "comm") startCommunication();
  };

  const sendComposer = async () => {
    const content = input.trim();
    if (!content) return;

    if (phase.kind === "task_answer") {
      pushUser(content);
      clearComposerInput();
      setIsTyping(true);
      try {
        const p = phase.payload;
        const res = await api.agentTaskEvaluate({
          user_common_task_id: p.userCommonTaskId,
          task_description: p.taskText,
          skill: p.skillName,
          answer: content,
          session_id: chatSessionId ?? undefined,
        });
        setChatSessionId(res.session_id);
        pushAura(formatCoachFeedback(res.feedback_message || "Thanks - review your skill matrix on Goals."), "Feedback");
        if (res.ethical_flag) {
          setShowComposer(true);
        } else {
          setPhase({ kind: "home" });
          setShowComposer(false);
        }
      } catch (e) {
        pushAura(`Evaluation failed: ${(e as Error).message}`, "Error");
      } finally {
        setIsTyping(false);
      }
      return;
    }

    if (phase.kind === "interview" && phase.awaitingFeedback) {
      pushUser(content);
      clearComposerInput();
      setIsTyping(true);
      try {
        const ev = await api.agentInterviewEvaluate(
          phase.questionNumber,
          phase.questionText,
          content,
          chatSessionId,
        );
        setChatSessionId(ev.session_id);
        pushAura(formatCoachFeedback(ev.feedback), ev.ethical_flag ? "Ethical review" : "Feedback");
        if (ev.ethical_flag) {
          setInterviewShowNext(false);
          setShowComposer(true);
          setPhase({
            kind: "interview",
            questionNumber: phase.questionNumber,
            questionText: phase.questionText,
            awaitingFeedback: true,
          });
        } else {
          setInterviewShowNext(true);
          setShowComposer(false);
          setPhase({
            kind: "interview",
            questionNumber: phase.questionNumber,
            questionText: phase.questionText,
            awaitingFeedback: false,
          });
        }
      } catch (e) {
        pushAura(`Could not evaluate: ${(e as Error).message}`, "Error");
      } finally {
        setIsTyping(false);
      }
      return;
    }

    if (phase.kind === "reflection" && phase.awaitingFeedback) {
      pushUser(content);
      clearComposerInput();
      setIsTyping(true);
      try {
        const ev = await api.agentReflectionEvaluate(
          phase.questionNumber,
          phase.questionText,
          content,
          chatSessionId,
        );
        setChatSessionId(ev.session_id);
        pushAura(formatCoachFeedback(ev.feedback), ev.ethical_flag ? "Ethical review" : "Feedback");
        if (ev.ethical_flag) {
          setReflectionShowNext(false);
          setShowComposer(true);
          setPhase({
            kind: "reflection",
            questionNumber: phase.questionNumber,
            questionText: phase.questionText,
            awaitingFeedback: true,
          });
        } else {
          setReflectionShowNext(true);
          setShowComposer(false);
          setPhase({
            kind: "reflection",
            questionNumber: phase.questionNumber,
            questionText: phase.questionText,
            awaitingFeedback: false,
          });
        }
      } catch (e) {
        pushAura(`Could not evaluate: ${(e as Error).message}`, "Error");
      } finally {
        setIsTyping(false);
      }
      return;
    }

    if (phase.kind === "communication") {
      pushUser(content);
      clearComposerInput();
      setIsTyping(true);
      try {
        const res = await api.agentChat(content, chatSessionId, "communication");
        setChatSessionId(res.session_id);
        pushAura(formatCoachFeedback(res.reply), "Communication");
        if (res.follow_up?.trim()) {
          pushAura(formatCoachFeedback(res.follow_up.trim()), "Review");
        }
        const ended =
          res.reply.trim() === "Session ended. Good job today!" ||
          res.reply.includes("Session ended. Good job today!");
        if (ended) {
          setPhase({ kind: "home" });
          setShowComposer(false);
        }
      } catch (e) {
        pushAura(`Could not reach coach: ${(e as Error).message}`, "Error");
      } finally {
        setIsTyping(false);
      }
    }
  };

  const nextInterviewQuestion = async () => {
    if (phase.kind !== "interview") return;
    const nextN = phase.questionNumber + 1;
    setInterviewShowNext(false);
    setIsTyping(true);
    try {
      const q = await api.agentInterviewQuestion(nextN, { sessionId: chatSessionId });
      setChatSessionId(q.session_id);
      setShowComposer(true);
      setPhase({
        kind: "interview",
        questionNumber: q.question_number,
        questionText: q.question,
        awaitingFeedback: true,
      });
      pushAura(formatCoachQuestion("Question", q.question_number, q.question), "Interview");
    } catch (e) {
      pushAura(`Next question failed: ${(e as Error).message}`, "Error");
    } finally {
      setIsTyping(false);
    }
  };

  const pickPdf = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: Platform.OS === "ios" ? (["application/pdf", "com.adobe.pdf"] as string[]) : "application/pdf",
        copyToCacheDirectory: Platform.OS !== "web",
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const name = asset.name || "cv.pdf";
      const lower = name.toLowerCase();
      const mime = (asset.mimeType || "").toLowerCase();
      const pdfMsg =
        "Only PDF files can be uploaded as your CV. Word, text, and other document types are not accepted — export your CV as PDF and try again.";
      const blockedExt = [".doc", ".docx", ".txt", ".rtf", ".odt", ".pages", ".md"];
      if (blockedExt.some((ext) => lower.endsWith(ext))) {
        showAlert("PDF only", pdfMsg);
        return;
      }
      const blockedMime =
        mime.startsWith("text/") ||
        mime.includes("msword") ||
        mime.includes("wordprocessingml") ||
        mime.includes("opendocument") ||
        mime === "application/rtf" ||
        mime === "application/json";
      if (blockedMime) {
        showAlert("PDF only", pdfMsg);
        return;
      }
      if (!lower.endsWith(".pdf")) {
        showAlert("PDF only", pdfMsg);
        return;
      }
      if (mime) {
        const looksPdf =
          mime === "application/pdf" ||
          mime === "application/x-pdf" ||
          mime.endsWith("+pdf") ||
          (mime === "application/octet-stream" && lower.endsWith(".pdf"));
        if (!looksPdf) {
          showAlert("PDF only", pdfMsg);
          return;
        }
      }
      setFileName(name);
      setIsUploading(true);
      const data = await api.uploadCVPdf({
        uri: asset.uri,
        name,
        mimeType: asset.mimeType || "application/pdf",
      });
      const bullets = (arr: unknown[]) =>
        Array.isArray(arr) ? arr.map((s) => `• ${prettifyCvLine(s)}`).join("\n") : "";
      const prettifyBulletLines = (text: string) =>
        text
          .split("\n")
          .map((ln) => {
            const m = /^(\s*•\s*)(.+)$/.exec(ln);
            return m ? `${m[1]}${prettifyCvLine(m[2])}` : ln.replace(/\*\*([^*]+)\*\*/g, "$1");
          })
          .join("\n");
      const summaryRaw =
        data.chat_summary ||
        ["Strengths", bullets(data.strengths as unknown[]), "", "Growth areas", bullets(data.weaknesses as unknown[])].join("\n");
      const summary = prettifyBulletLines(summaryRaw);
      setCvLocalSummary(summary);
      pushAura(`Here's your CV feedback.\n\n${summary}\n\n_Saved under Profile › CV & analysis._`, "CV feedback");
    } catch (e) {
      pushAura(`CV upload failed: ${(e as Error).message}`, "Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const composerHint =
    phase.kind === "task_answer"
      ? "Write your task answer here - it will be scored on the selected skill."
      : phase.kind === "interview" && phase.awaitingFeedback
        ? "Answer using STAR where you can (Situation, Task, Action, Result)."
        : phase.kind === "reflection" && phase.awaitingFeedback
          ? "Answer in a short paragraph. Be specific about what you learned and what you'd improve."
          : phase.kind === "communication"
            ? 'Reply as you would at work. When finished, send **exit**, **quit**, or **stop** to end and get your communication score.'
            : "";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={[commonStyles.flexOne, styles.kavRoot, { backgroundColor: colors.background }]}
    >
      <View style={styles.layoutColumn}>
        <View style={[styles.topBar, { paddingHorizontal: screenPadding }]}>
          <View style={{ flex: 1 }}>
            <ScreenHeader title="AI Coach" subtitle="Choose a path - then reply in your own words" />
          </View>
          <View style={styles.topBarActions}>
            <Pressable
              onPress={() => void openChatHistory()}
              style={({ pressed }) => [
                styles.headerIconBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.headerIconBtnPressed,
              ]}
              accessibilityLabel="View previous chats"
              accessibilityRole="button"
            >
              <Ionicons name="time-outline" size={20} color={colors.primary} />
            </Pressable>
            <Pressable
              onPress={() => void startNewChat()}
              style={({ pressed }) => [
                styles.headerIconBtn,
                { backgroundColor: colors.surface, borderColor: colors.border },
                pressed && styles.headerIconBtnPressed,
              ]}
              accessibilityLabel="Start new chat"
              accessibilityRole="button"
            >
              <Ionicons name="create-outline" size={20} color={colors.primary} />
            </Pressable>
            {phase.kind !== "home" ? (
              <Pressable
                onPress={resetToHome}
                style={styles.exitPill}
                accessibilityLabel={phase.kind === "interview" ? "Exit interview" : "Exit flow"}
              >
                <Ionicons name="close" size={18} color={palette.text} />
                <Text style={styles.exitPillText}>
                  {phase.kind === "interview" ? "Exit interview" : "Exit"}
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        {showPromptBand ? (
        <View style={[styles.promptBand, { maxHeight: promptBandMaxHeight }]}>
          <ScrollView
            nestedScrollEnabled
            style={{ flexGrow: 0 }}
            contentContainerStyle={[styles.promptBandInnerScroll, { paddingHorizontal: screenPadding }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.promptBandCaption} numberOfLines={2}>
              Upload your CV anytime (PDF only) - or tap a coach path when you are on Home.
            </Text>
            <Pressable
              onPress={pickPdf}
              disabled={isUploading}
              style={({ pressed }) => [
                styles.promptRow,
                styles.cvUploadRow,
                pressed && styles.promptRowPressed,
                isUploading && styles.promptRowDisabled,
              ]}
            >
              <View style={[styles.promptRowBadge, styles.cvUploadBadge]}>
                <Ionicons name="cloud-upload-outline" size={14} color={palette.primary} />
              </View>
              <View style={commonStyles.flexOne}>
                <Text style={styles.promptRowLabel} numberOfLines={1}>
                  {isUploading ? "Uploading PDF…" : "Upload CV (PDF)"}
                </Text>
                <Text style={styles.promptRowMeta} numberOfLines={2}>
                  {fileName ? fileName : "Extract text on the server, then AI feedback in chat & profile"}
                </Text>
              </View>
              <Ionicons name="document-attach" size={18} color={palette.primary} />
            </Pressable>
            <View style={styles.promptRowList}>
              {PROMPTS.map((p, index) => (
                <Pressable
                  key={p.id}
                  disabled={phase.kind !== "home"}
                  onPress={() => onPickPrompt(p.id)}
                  style={({ pressed }) => [
                    styles.promptRow,
                    phase.kind !== "home" && styles.promptRowMuted,
                    pressed && phase.kind === "home" && styles.promptRowPressed,
                  ]}
                >
                  <View style={styles.promptRowBadge}>
                    <Text style={styles.promptRowBadgeText}>{index + 1}</Text>
                  </View>
                  <Ionicons name={p.icon} size={17} color={palette.primary} style={styles.promptRowIcon} />
                  <View style={commonStyles.flexOne}>
                    <Text style={styles.promptRowLabel} numberOfLines={1}>
                      {p.label}
                    </Text>
                    <Text style={styles.promptRowMeta} numberOfLines={1}>
                      {phase.kind !== "home" ? "Finish current flow or tap Exit" : p.subtitle}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={palette.muted} />
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
        ) : null}

        <ScrollView
          ref={scrollRef}
          style={styles.chatScroll}
          contentContainerStyle={[styles.chatBody, { paddingHorizontal: screenPadding }]}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
        >
          {activeTaskAnswer ? (
            <AppCard style={styles.taskContextCard}>
              <View style={styles.taskContextHeader}>
                <Ionicons name="reader-outline" size={22} color={palette.primary} />
                <View style={commonStyles.flexOne}>
                  <Text style={styles.taskContextEyebrow}>Your task</Text>
                  <Text style={styles.taskContextSkill}>{activeTaskAnswer.skillName}</Text>
                </View>
              </View>
              <Text selectable style={styles.taskContextBody}>
                {activeTaskAnswer.taskText}
              </Text>
            </AppCard>
          ) : null}

        {cvLocalSummary ? (
          <AppCard style={styles.cvSummaryCard}>
            <Text style={styles.cvSummaryCardTitle}>Latest CV feedback</Text>
            <ScrollView nestedScrollEnabled style={styles.cvSummaryScroll} showsVerticalScrollIndicator>
              <Text selectable style={styles.cvSummaryText}>
                {cvLocalSummary}
              </Text>
            </ScrollView>
          </AppCard>
        ) : null}

        {messages.map((message) => {
          const isUser = message.type === "user";
          return (
            <View key={message.id} style={[styles.messageRow, isUser ? styles.rowUser : styles.rowAura]}>
              {!isUser ? (
                <View style={styles.avatarAura}>
                  <Ionicons name="sparkles" size={18} color="#FFFFFF" />
                </View>
              ) : null}
              <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAura]}>
                {message.category ? (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{message.category}</Text>
                  </View>
                ) : null}
                <Text style={[styles.msgText, isUser && styles.msgTextUser]}>{message.content}</Text>
                {message.timestamp ? (
                  <Text style={[styles.msgTime, isUser && styles.msgTimeUser]}>{message.timestamp}</Text>
                ) : null}
              </View>
            </View>
          );
        })}

        {interviewShowNext && phase.kind === "interview" ? (
          <Pressable onPress={nextInterviewQuestion} style={styles.nextQBtn}>
            <Text style={styles.nextQBtnText}>Next question</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>
        ) : null}

        {reflectionShowNext && phase.kind === "reflection" ? (
          <Pressable onPress={nextReflectionQuestion} style={styles.nextQBtnSecondary}>
            <Text style={styles.nextQBtnSecondaryText}>Another reflection</Text>
            <Ionicons name="leaf-outline" size={18} color={palette.primary} />
          </Pressable>
        ) : null}

        {isTyping ? (
          <View style={styles.messageRow}>
            <View style={styles.avatarAura}>
              <Ionicons name="sparkles" size={18} color="#FFFFFF" />
            </View>
            <View style={[styles.bubble, styles.bubbleAura]}>
              <Text style={styles.typing}>Thinking…</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>
      </View>

      {showComposer ? (
        <View style={[styles.footer, { paddingHorizontal: screenPadding, backgroundColor: colors.background, borderTopColor: colors.border }]}>
          {composerHint ? <Text style={[styles.composerHint, { color: colors.muted }]}>{composerHint}</Text> : null}
          <View style={styles.footerRow}>
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Type your message…"
              placeholderTextColor={colors.muted}
              style={[
                styles.footerInput,
                {
                  height: inputHeight,
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              multiline
              textAlignVertical="top"
              scrollEnabled={inputHeight >= COMPOSER_MAX_HEIGHT}
              onContentSizeChange={(e) => {
                const next = Math.ceil(e.nativeEvent.contentSize.height) + 8;
                setInputHeight(Math.min(COMPOSER_MAX_HEIGHT, Math.max(COMPOSER_MIN_HEIGHT, next)));
              }}
            />
            <Pressable accessibilityLabel="Send" onPress={sendComposer} style={styles.sendFab}>
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.footerPlaceholder} />
      )}

      <Modal visible={showHistory} animationType="slide" transparent onRequestClose={() => setShowHistory(false)}>
        <Pressable style={styles.historyBackdrop} onPress={() => setShowHistory(false)}>
          <Pressable
            style={[styles.historySheet, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.historySheetHeader}>
              <View>
                <Text style={[styles.historyTitle, { color: colors.text }]}>Previous chats</Text>
                <Text style={[styles.historySubtitle, { color: colors.muted }]}>
                  Tap a session to load its messages
                </Text>
              </View>
              <Pressable
                onPress={() => setShowHistory(false)}
                hitSlop={12}
                accessibilityLabel="Close chat history"
                style={[styles.historyCloseBtn, { backgroundColor: colors.surfaceMuted }]}
              >
                <Ionicons name="close" size={20} color={colors.text} />
              </Pressable>
            </View>

            {historyLoading ? (
              <View style={styles.historyEmpty}>
                <Text style={[styles.historyEmptyText, { color: colors.muted }]}>Loading sessions…</Text>
              </View>
            ) : historySessions.length === 0 ? (
              <View style={styles.historyEmpty}>
                <Ionicons name="chatbubbles-outline" size={40} color={colors.muted} />
                <Text style={[styles.historyEmptyTitle, { color: colors.text }]}>No saved chats yet</Text>
                <Text style={[styles.historyEmptyText, { color: colors.muted }]}>
                  Start a conversation and it will appear here.
                </Text>
              </View>
            ) : (
              <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
                {historySessions.map((session) => {
                  const isActive = chatSessionId === session.id;
                  return (
                    <Pressable
                      key={session.id}
                      onPress={() => void loadChatSession(session.id)}
                      style={({ pressed }) => [
                        styles.historyItem,
                        {
                          backgroundColor: isActive ? colors.chipBlue : colors.surfaceMuted,
                          borderColor: isActive ? colors.primary : colors.border,
                        },
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <View style={styles.historyItemTop}>
                        <Text style={[styles.historyItemTopic, { color: colors.text }]} numberOfLines={1}>
                          {session.topic || "AI Coach"}
                        </Text>
                        {isActive ? (
                          <View style={[styles.historyActivePill, { backgroundColor: colors.primary }]}>
                            <Text style={styles.historyActivePillText}>Current</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={[styles.historyItemMeta, { color: colors.muted }]}>
                        {fmtSessionDate(session.started_at)} · {session.message_count} message
                        {session.message_count === 1 ? "" : "s"}
                      </Text>
                      {session.preview ? (
                        <Text style={[styles.historyItemPreview, { color: colors.text }]} numberOfLines={2}>
                          {session.preview.replace(/\*\*/g, "")}
                        </Text>
                      ) : null}
                    </Pressable>
                  );
                })}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  kavRoot: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: screenPadding,
    paddingTop: 6,
    gap: 8,
  },
  topBarActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  headerIconBtnPressed: {
    opacity: 0.75,
  },
  exitPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  exitPillText: {
    fontSize: 13,
    fontWeight: "700",
    color: palette.text,
  },
  layoutColumn: {
    flex: 1,
    minHeight: 0,
  },
  promptBand: {
    flexGrow: 0,
    flexShrink: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: palette.border,
    backgroundColor: palette.background,
    overflow: "hidden",
  },
  promptBandInnerScroll: {
    paddingTop: 4,
    paddingBottom: 10,
    gap: 6,
    flexGrow: 0,
  },
  promptBandCaption: {
    fontSize: 11,
    fontWeight: "700",
    color: palette.muted,
    letterSpacing: 0.3,
  },
  promptRowList: {
    gap: 6,
  },
  promptRow: {
    flexShrink: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  cvUploadRow: {
    borderColor: palette.primaryMuted,
    backgroundColor: palette.chipBlue,
  },
  cvUploadBadge: {
    alignItems: "center",
    justifyContent: "center",
  },
  promptRowMuted: {
    opacity: 0.55,
  },
  promptRowDisabled: {
    opacity: 0.7,
  },
  promptRowPressed: {
    opacity: 0.88,
    backgroundColor: palette.surfaceMuted,
  },
  promptRowBadge: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "rgba(99,102,241,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  promptRowBadgeText: {
    fontSize: 12,
    fontWeight: "900",
    color: palette.primary,
  },
  promptRowIcon: {
    alignSelf: "center",
  },
  promptRowLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: palette.text,
    letterSpacing: -0.2,
  },
  promptRowMeta: {
    fontSize: 10,
    fontWeight: "600",
    color: palette.muted,
    marginTop: 2,
  },
  chatScroll: {
    flex: 1,
    minHeight: 0,
  },
  taskContextCard: {
    borderLeftWidth: 4,
    borderLeftColor: palette.primary,
    gap: 10,
    padding: 14,
  },
  taskContextHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  taskContextEyebrow: {
    fontSize: 11,
    fontWeight: "800",
    color: palette.muted,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  taskContextSkill: {
    fontSize: 15,
    fontWeight: "900",
    color: palette.text,
    marginTop: 2,
  },
  taskContextBody: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "600",
    color: palette.text,
  },
  chatBody: {
    paddingBottom: 24,
    gap: 14,
    flexGrow: 1,
  },
  cvSummaryCard: {
    padding: 14,
    borderLeftWidth: 3,
    borderLeftColor: palette.primaryMuted,
  },
  cvSummaryCardTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: palette.muted,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cvSummaryScroll: {
    marginTop: 4,
    maxHeight: 200,
    borderRadius: 12,
    backgroundColor: palette.surfaceMuted,
    borderWidth: 1,
    borderColor: palette.border,
    padding: 12,
  },
  cvSummaryText: {
    fontSize: 13,
    lineHeight: 20,
    color: palette.text,
    fontWeight: "600",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  rowUser: {
    justifyContent: "flex-end",
  },
  rowAura: {
    justifyContent: "flex-start",
  },
  avatarAura: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: palette.primaryMuted,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  bubble: {
    maxWidth: "88%",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  bubbleAura: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: palette.primary,
    borderBottomRightRadius: 4,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: "rgba(99,102,241,0.12)",
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "800",
    color: palette.primary,
    textTransform: "uppercase",
  },
  msgText: {
    color: palette.text,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  msgTextUser: {
    color: "#FFFFFF",
  },
  msgTime: {
    fontSize: 10,
    fontWeight: "600",
    color: palette.muted,
    alignSelf: "flex-end",
    marginTop: 2,
  },
  msgTimeUser: {
    color: "rgba(255,255,255,0.6)",
  },
  typing: {
    color: palette.muted,
    fontStyle: "italic",
    fontSize: 13,
  },
  nextQBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "center",
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 99,
    backgroundColor: palette.primary,
  },
  nextQBtnText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 15,
  },
  nextQBtnSecondary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    alignSelf: "center",
    marginTop: 4,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 99,
    backgroundColor: palette.surface,
    borderWidth: 2,
    borderColor: palette.primary,
  },
  nextQBtnSecondaryText: {
    color: palette.primary,
    fontWeight: "800",
    fontSize: 15,
  },
  footer: {
    flexShrink: 0,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 20 : 12,
    borderTopWidth: 1,
  },
  footerPlaceholder: {
    height: Platform.OS === "ios" ? 12 : 6,
  },
  composerHint: {
    fontSize: 12,
    fontWeight: "600",
    color: palette.muted,
    marginBottom: 8,
    lineHeight: 17,
    paddingHorizontal: 4,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  footerInput: {
    flex: 1,
    minHeight: COMPOSER_MIN_HEIGHT,
    maxHeight: COMPOSER_MAX_HEIGHT,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    fontSize: 15,
    lineHeight: 20,
  },
  sendFab: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primary,
  },
  historyBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
    justifyContent: "flex-end",
  },
  historySheet: {
    maxHeight: "78%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingTop: 18,
    paddingHorizontal: screenPadding,
    paddingBottom: Platform.OS === "ios" ? 28 : 18,
  },
  historySheetHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
    gap: 12,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  historySubtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  historyCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  historyList: {
    maxHeight: 420,
  },
  historyItem: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    gap: 6,
  },
  historyItemTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  historyItemTopic: {
    flex: 1,
    fontSize: 15,
    fontWeight: "800",
  },
  historyActivePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
  },
  historyActivePillText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  historyItemMeta: {
    fontSize: 12,
    fontWeight: "600",
  },
  historyItemPreview: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.88,
  },
  historyEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 36,
    gap: 10,
  },
  historyEmptyTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  historyEmptyText: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
    paddingHorizontal: 12,
  },
});
