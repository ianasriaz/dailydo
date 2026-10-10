import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Platform,
  StyleSheet
} from "react-native";
import { CleanMicIcon } from "./CleanMicIcon.js";
import { theme } from "../theme.js";

export function CaptureOverlay({ visible, initialVoiceMode, onClose, onSubmit, isProcessing }) {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef(null);
  const webRecognitionRef = useRef(null);

  useEffect(() => {
    if (visible) {
      if (initialVoiceMode) {
        startVoiceCapture();
      } else {
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    } else {
      stopVoiceCapture();
    }
  }, [visible, initialVoiceMode]);

  const startVoiceCapture = () => {
    // If on Web browser, use SpeechRecognition API
    if (Platform.OS === "web" && typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
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
              setText(prev => (prev ? prev + " " + transcript : transcript));
            }
          };

          rec.onerror = () => setIsListening(false);
          rec.onend = () => setIsListening(false);

          rec.start();
          webRecognitionRef.current = rec;
          setIsListening(true);
          return;
        } catch (err) {
          console.warn("Web speech error:", err);
        }
      }
    }

    // On mobile devices, activate listening state and focus input for voice dictation
    setIsListening(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const stopVoiceCapture = () => {
    if (webRecognitionRef.current) {
      try {
        webRecognitionRef.current.stop();
      } catch {}
      webRecognitionRef.current = null;
    }
    setIsListening(false);
  };

  const handleMicToggle = () => {
    if (isListening) {
      stopVoiceCapture();
    } else {
      startVoiceCapture();
    }
  };

  const handleSubmit = () => {
    if (!text.trim() || isProcessing) return;
    stopVoiceCapture();
    onSubmit(text.trim());
    setText("");
  };

  const handleChipClick = (snippet) => {
    setText(prev => (prev ? `${prev}, ${snippet}` : snippet));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <View style={styles.titleBox}>
              <Text style={styles.headerTitle}>QUICK CAPTURE</Text>
              <Text style={styles.headerSubtitle}>
                Speak or type freeform thoughts — AWS Bedrock will organize them.
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {isListening && (
            <View style={styles.listeningBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.listeningText}>
                VOICE CAPTURE ACTIVE — SPEAK OR TYPE FREELY
              </Text>
            </View>
          )}

          <TextInput
            ref={inputRef}
            style={styles.textInput}
            multiline
            placeholder="e.g., Team sync in 1 minute, review lecture slides at 4pm, pick up groceries"
            placeholderTextColor={theme.colors.textMuted}
            value={text}
            onChangeText={setText}
            autoFocus
          />

          <View style={styles.chipsRow}>
            <Text style={styles.chipsLabel}>QUICK PROMPTS:</Text>
            <TouchableOpacity style={styles.chip} onPress={() => handleChipClick("Sync in 1 minute")}>
              <Text style={styles.chipText}>+ in 1 min</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip} onPress={() => handleChipClick("Pray Zuhr at 1:30")}>
              <Text style={styles.chipText}>+ Pray Zuhr</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.chip} onPress={() => handleChipClick("Pay electricity by Tuesday")}>
              <Text style={styles.chipText}>+ Pay bill</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footerRow}>
            <TouchableOpacity
              style={[styles.micToggle, isListening && styles.micToggleActive]}
              onPress={handleMicToggle}
              activeOpacity={0.8}
            >
              <CleanMicIcon
                size={18}
                color={isListening ? theme.colors.accent : theme.colors.textSecondary}
                active={isListening}
              />
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
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    padding: 22,
    minHeight: 380
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14
  },
  titleBox: {
    flex: 1
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 1.5,
    color: theme.colors.textPrimary,
    marginBottom: 4
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
  listeningBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(204, 255, 0, 0.12)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    marginBottom: 12,
    alignSelf: "flex-start"
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
    marginRight: 8
  },
  listeningText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    color: theme.colors.accent
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
    marginBottom: 14
  },
  chipsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18
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
  micToggle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center"
  },
  micToggleActive: {
    borderColor: theme.colors.accent,
    backgroundColor: "rgba(204, 255, 0, 0.15)"
  },
  submitBtn: {
    flex: 1,
    height: 46,
    backgroundColor: theme.colors.accent,
    borderRadius: 23,
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
