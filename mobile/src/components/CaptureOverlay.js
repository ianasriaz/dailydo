import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  StyleSheet,
  KeyboardAvoidingView
} from "react-native";
import { CleanMicIcon } from "./CleanMicIcon.js";
import { theme } from "../theme.js";

export function CaptureOverlay({ visible, initialVoiceMode, onClose, onSubmit, isProcessing }) {
  const [text, setText] = useState("");
  const [isWebListening, setIsWebListening] = useState(false);
  const inputRef = useRef(null);
  const webRecognitionRef = useRef(null);

  // Immediately focus input when opened so the mobile keyboard & its native dictation mic appear
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);

      // On Web browser only, if Web Speech API is present, start real-time listener
      if (Platform.OS === "web" && typeof window !== "undefined") {
        startWebSpeech();
      }

      return () => clearTimeout(timer);
    } else {
      stopWebSpeech();
      setText("");
    }
  }, [visible]);

  const startWebSpeech = () => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";

      rec.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setText(prev => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      rec.onerror = () => setIsWebListening(false);
      rec.onend = () => setIsWebListening(false);

      rec.start();
      webRecognitionRef.current = rec;
      setIsWebListening(true);
    } catch (err) {
      console.warn("Web speech not available:", err);
    }
  };

  const stopWebSpeech = () => {
    if (webRecognitionRef.current) {
      try {
        webRecognitionRef.current.stop();
      } catch {}
      webRecognitionRef.current = null;
    }
    setIsWebListening(false);
  };

  const handleSubmit = () => {
    if (!text.trim() || isProcessing) return;
    stopWebSpeech();
    onSubmit(text.trim());
    setText("");
  };

  const handleChipClick = (snippet) => {
    setText(prev => (prev ? `${prev}, ${snippet}` : snippet));
    inputRef.current?.focus();
  };

  const handleMicClick = () => {
    // Focus the text input so the mobile keyboard's instant mic key is active
    inputRef.current?.focus();
    if (Platform.OS === "web") {
      if (isWebListening) {
        stopWebSpeech();
      } else {
        startWebSpeech();
      }
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardContainer}
      >
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            {/* Header */}
            <View style={styles.headerRow}>
              <View style={styles.titleBox}>
                <Text style={styles.headerTitle}>QUICK CAPTURE</Text>
                <Text style={styles.headerSubtitle}>
                  Speak with keyboard mic or type — Bedrock will organize it.
                </Text>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
                <Text style={styles.closeText}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Instant Voice Guide Banner */}
            <TouchableOpacity
              style={styles.voiceGuideBanner}
              onPress={handleMicClick}
              activeOpacity={0.85}
            >
              <View style={styles.voiceGuideIconBox}>
                <CleanMicIcon size={14} color={theme.colors.accent} active={isWebListening} />
              </View>
              <View style={styles.voiceGuideTextBox}>
                <Text style={styles.voiceGuideTitle}>
                  {isWebListening ? "WEB MIC LISTENING — SPEAK NOW" : "INSTANT VOICE CAPTURE"}
                </Text>
                <Text style={styles.voiceGuideSub}>
                  Tap the microphone key on your phone keyboard to write instantly as you speak.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Main Text Input */}
            <TextInput
              ref={inputRef}
              style={styles.textInput}
              multiline
              placeholder="e.g., Team sync in 1 minute, review lecture slides at 4pm, pick up groceries"
              placeholderTextColor={theme.colors.textMuted}
              value={text}
              onChangeText={setText}
              autoFocus
              returnKeyType="default"
              textAlignVertical="top"
            />

            {/* Quick Prompts */}
            <View style={styles.chipsRow}>
              <Text style={styles.chipsLabel}>PROMPTS:</Text>
              <TouchableOpacity style={styles.chip} onPress={() => handleChipClick("Sync in 1 minute")}>
                <Text style={styles.chipText}>+ in 1 min</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chip} onPress={() => handleChipClick("Pray Zuhr at 1:30")}>
                <Text style={styles.chipText}>+ Pray Zuhr</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chip} onPress={() => handleChipClick("Team sync at 4pm")}>
                <Text style={styles.chipText}>+ Sync at 4pm</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.chip} onPress={() => handleChipClick("Pay electricity by Tuesday")}>
                <Text style={styles.chipText}>+ Pay bill</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footerRow}>
              <TouchableOpacity
                style={styles.micFocusBtn}
                onPress={handleMicClick}
                activeOpacity={0.8}
              >
                <CleanMicIcon size={18} color={theme.colors.accent} active={isWebListening} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, (!text.trim() || isProcessing) && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!text.trim() || isProcessing}
                activeOpacity={0.85}
              >
                {isProcessing ? (
                  <ActivityIndicator color={theme.colors.accentText} />
                ) : (
                  <Text style={styles.submitBtnText}>ORGANIZE WITH BEDROCK ➔</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(9, 9, 11, 0.92)",
    justifyContent: "flex-end"
  },
  sheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 20,
    paddingBottom: Platform.OS === "ios" ? 36 : 24
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12
  },
  titleBox: {
    flex: 1
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: theme.colors.textPrimary,
    marginBottom: 3
  },
  headerSubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 16
  },
  closeBtn: {
    padding: 6,
    marginLeft: 12
  },
  closeText: {
    fontSize: 16,
    color: theme.colors.textMuted,
    fontWeight: "700"
  },
  voiceGuideBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(204, 255, 0, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(204, 255, 0, 0.35)",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 12
  },
  voiceGuideIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(204, 255, 0, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10
  },
  voiceGuideTextBox: {
    flex: 1
  },
  voiceGuideTitle: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: theme.colors.accent,
    marginBottom: 2
  },
  voiceGuideSub: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    lineHeight: 14
  },
  textInput: {
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.borderFocused,
    borderRadius: 10,
    padding: 14,
    color: theme.colors.textPrimary,
    fontSize: 15,
    minHeight: 110,
    textAlignVertical: "top",
    marginBottom: 12
  },
  chipsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16
  },
  chipsLabel: {
    fontSize: 10,
    fontWeight: "800",
    color: theme.colors.textMuted,
    letterSpacing: 0.5
  },
  chip: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.colors.textSecondary
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  micFocusBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    justifyContent: "center",
    alignItems: "center"
  },
  submitBtn: {
    flex: 1,
    height: 48,
    backgroundColor: theme.colors.accent,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center"
  },
  submitBtnDisabled: {
    opacity: 0.4
  },
  submitBtnText: {
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1,
    color: theme.colors.accentText
  }
});
