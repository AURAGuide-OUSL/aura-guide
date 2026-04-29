import React, { useEffect, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { palette, commonStyles } from "../../theme";
import { Badge } from "../../components/Badge";
import { ScreenHeader } from "../../components/ScreenHeader";
import { Message } from "../../types";
import { initialMessages } from "../../constants";
import { quickPrompts } from "../../../src-native/mockData";
import { PrimaryButton } from "../../components/PrimaryButton";
import { api } from "../../api/api";

function getAuraResponse(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("debug") || lower.includes("code")) {
    return {
      category: "Technical",
      content:
        "Start by isolating the failing behavior, comparing expected vs actual output, and checking logs around the exact point of failure. If you paste the code and error details, I can help you debug it step by step.",
    };
  }

  if (lower.includes("interview")) {
    return {
      category: "Soft Skills",
      content:
        "Use the STAR framework: Situation, Task, Action, Result. Pick one experience, make the action section concrete, and end with the impact you created.",
    };
  }

  if (lower.includes("git")) {
    return {
      category: "Technical",
      content:
        "Focus on the mental model first: a repository stores history, commits are snapshots, and branches are movable pointers. Once that clicks, commands like add, commit, pull, merge, and rebase become much easier to reason about.",
    };
  }

  if (lower.includes("career") || lower.includes("roadmap")) {
    return {
      category: "Career",
      content:
        "A strong student roadmap usually combines fundamentals, visible projects, interview practice, and networking. Keep one active build project, one interview track, and one career growth habit running every week.",
    };
  }

  return {
    category: "General",
    content:
      "Tell me a little more about your situation and goal, and I will help you break it into the next practical steps.",
  };
}

export function AICoachScreen() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [cvName, setCvName] = useState("");
  const [cvContent, setCvContent] = useState("");
  const [cvFeedback, setCvFeedback] = useState<string[]>([]);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    scrollRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  const sendMessage = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content) {
      return;
    }

    const nextUserMessage: Message = {
      id: Date.now(),
      type: "user",
      content,
      timestamp: "Now",
    };

    setMessages((current) => [...current, nextUserMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getAuraResponse(content);
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          type: "aura",
          content: response.content,
          category: response.category,
          timestamp: "Now",
        },
      ]);
      setIsTyping(false);
    }, 900);
  };

  const analyzeCV = async () => {
    if (!cvName.trim() || !cvContent.trim()) {
      return;
    }
    try {
      await api.uploadCV(cvName.trim(), cvContent.trim());
      await api.analyzeCV();
      const feedback = await api.getCVFeedback();
      setCvFeedback(feedback.feedback || []);
    } catch (error) {
      setCvFeedback([`CV analysis failed: ${(error as Error).message}`]);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={commonStyles.flexOne}>
      <ScreenHeader title="AURA Life Coach" subtitle="Ask about study, career, or technical growth" />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.promptStrip}
        style={styles.promptsContainer}
      >
        {quickPrompts.map((prompt) => (
          <Pressable key={prompt} onPress={() => sendMessage(prompt)} style={styles.promptChip}>
            <Ionicons name="sparkles-outline" size={14} color={palette.primary} />
            <Text style={styles.promptChipText}>{prompt}</Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView ref={scrollRef} contentContainerStyle={styles.chatBody}>
        <View style={styles.cvCard}>
          <Text style={styles.cvTitle}>CV status</Text>
          <TextInput
            value={cvName}
            onChangeText={setCvName}
            placeholder="CV file name (example: my_cv.txt)"
            placeholderTextColor={palette.muted}
            style={styles.cvInput}
          />
          <TextInput
            value={cvContent}
            onChangeText={setCvContent}
            placeholder="Paste CV content for analysis"
            placeholderTextColor={palette.muted}
            style={[styles.cvInput, styles.cvInputMultiline]}
            multiline
          />
          <PrimaryButton label="Upload & Analyze CV" onPress={analyzeCV} />
          {cvFeedback.map((line, index) => (
            <Text key={index} style={styles.cvFeedback}>{`\u2022 ${line}`}</Text>
          ))}
        </View>

        {messages.map((message) => {
          const isUser = message.type === "user";
          return (
            <View key={message.id} style={[styles.messageRow, isUser ? styles.messageRowUser : undefined]}>
              <View style={[styles.messageAvatar, isUser ? styles.userAvatar : styles.auraAvatar]}>
                <Ionicons name={isUser ? "person-outline" : "sparkles-outline"} size={16} color={palette.surface} />
              </View>
              <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleAura]}>
                {message.category ? (
                  <Badge
                    label={message.category}
                    backgroundColor={isUser ? "rgba(255,255,255,0.18)" : palette.chipBlue}
                    textColor={isUser ? palette.surface : palette.primary}
                  />
                ) : null}
                <Text style={[styles.messageText, isUser ? styles.messageTextUser : undefined]}>{message.content}</Text>
                <Text style={[styles.messageTime, isUser ? styles.messageTimeUser : undefined]}>{message.timestamp}</Text>
              </View>
            </View>
          );
        })}

        {isTyping ? (
          <View style={styles.messageRow}>
            <View style={[styles.messageAvatar, styles.auraAvatar]}>
              <Ionicons name="sparkles-outline" size={16} color={palette.surface} />
            </View>
            <View style={[styles.messageBubble, styles.messageBubbleAura]}>
              <Text style={styles.typingText}>AURA is thinking...</Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.chatInputBar}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Ask AURA anything..."
          placeholderTextColor={palette.muted}
          style={styles.chatInput}
          onSubmitEditing={() => sendMessage()}
        />
        <Pressable onPress={() => sendMessage()} style={styles.sendButton}>
          <Ionicons name="send" size={18} color={palette.surface} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  promptsContainer: {
    maxHeight: 56,
  },
  promptStrip: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 8,
  },
  promptChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  promptChipText: {
    color: palette.text,
    fontWeight: "600",
  },
  chatBody: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 14,
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  messageRowUser: {
    justifyContent: "flex-end",
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  auraAvatar: {
    backgroundColor: palette.primary,
  },
  userAvatar: {
    backgroundColor: palette.secondary,
  },
  messageBubble: {
    maxWidth: "82%",
    borderRadius: 18,
    padding: 14,
    gap: 8,
  },
  messageBubbleAura: {
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
  },
  messageBubbleUser: {
    backgroundColor: palette.primary,
  },
  messageText: {
    color: palette.text,
    lineHeight: 21,
  },
  messageTextUser: {
    color: palette.surface,
  },
  messageTime: {
    color: palette.muted,
    fontSize: 12,
  },
  messageTimeUser: {
    color: "rgba(255,255,255,0.72)",
  },
  typingText: {
    color: palette.muted,
    fontStyle: "italic",
  },
  chatInputBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    backgroundColor: "rgba(255,255,255,0.94)",
  },
  chatInput: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: palette.surface,
    borderWidth: 1,
    borderColor: palette.border,
    color: palette.text,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: palette.primary,
  },
  cvCard: {
    borderWidth: 1,
    borderColor: palette.border,
    backgroundColor: palette.surface,
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  cvTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: palette.text,
  },
  cvInput: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    color: palette.text,
    backgroundColor: "#F8FBFF",
  },
  cvInputMultiline: {
    minHeight: 84,
    textAlignVertical: "top",
  },
  cvFeedback: {
    color: palette.muted,
    lineHeight: 20,
  },
});
