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
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { CleanMicIcon } from "./CleanMicIcon.js";
import { theme } from "../theme.js";
import { api } from "../services/api.js";

export function CaptureOverlay({ visible, initialVoiceMode, onClose, onSubmit, isProcessing }) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const recordingRef = useRef(null);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const webRecognitionRef = useRef(null);

  useEffect(() => {
    if (visible) {
      setStatusMessage("");
      if (initialVoiceMode) {
        startVoiceCapture();
      } else {
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    } else {
      stopVoiceCapture(false);
    }
  }, [visible, initialVoiceMode]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startVoiceCapture = async () => {
    setStatusMessage("");

    // Web Speech API on Web platform
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

          rec.onerror = (e) => {
            console.warn("Web speech error:", e);
            setIsRecording(false);
          };

          rec.onend = () => {
            setIsRecording(false);
          };

          rec.start();
          webRecognitionRef.current = rec;
          setIsRecording(true);
          return;
        } catch (err) {
          console.warn("Web speech init failed:", err);
        }
      }
    }

    // Native Mobile audio recording with expo-av
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setStatusMessage("Microphone permission denied. Please allow audio access.");
        inputRef.current?.focus();
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      recordingRef.current = recording;
      setIsRecording(true);
      setRecordSeconds(0);

      // Start elapsed seconds counter
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn("Failed to start native audio recording:", err);
      setStatusMessage("Could not start recording. You can type or use quick chips.");
      inputRef.current?.focus();
    }
  };

  const stopVoiceCapture = async (shouldTranscribe = true) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Stop web recognition if running
    if (webRecognitionRef.current) {
      try {
        webRecognitionRef.current.stop();
      } catch {}
      webRecognitionRef.current = null;
    }

    // Stop native recording
    const rec = recordingRef.current;
    if (rec) {
      try {
        await rec.stopAndUnloadAsync();
        const uri = rec.getURI();
        recordingRef.current = null;
        setIsRecording(false);

        if (shouldTranscribe && uri) {
          await transcribeRecordedAudio(uri);
        }
      } catch (err) {
        console.warn("Error stopping native recording:", err);
        setIsRecording(false);
      }
    } else {
      setIsRecording(false);
    }
  };

  const transcribeRecordedAudio = async (uri) => {
    setIsTranscribing(true);
    setStatusMessage("Transcribing audio with AWS...");
    try {
      // Read base64
      const base64Data = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      });

      const result = await api.transcribeAudio(base64Data, "mp4");
      if (result.text && result.text.trim()) {
        const spoken = result.text.trim();
        setText(prev => (prev ? prev + " " + spoken : spoken));
        setStatusMessage("");
      } else {
        setStatusMessage("No speech detected. Please speak clearly or type.");
      }
    } catch (err) {
      console.warn("Transcribe failed:", err);
      setStatusMessage("Cloud transcription unavailable. You can type or use suggestions.");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleMicPress = () => {
    if (isRecording) {
      stopVoiceCapture(true);
    } else {
      startVoiceCapture();
    }
  };

  const handleSubmit = () => {
    if (!text.trim() || isProcessing) return;
    stopVoiceCapture(false);
    onSubmit(text.trim());
    setText("");
    setStatusMessage("");
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
                Speak or type natural thoughts — AWS Bedrock will organize them.
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Clean Minimal Recording / Transcribing Indicator */}
          {isRecording && (
            <View style={styles.recordingBanner}>
              <View style={styles.pulseDot} />
              <Text style={styles.recordingText}>
                RECORDING AUDIO ({recordSeconds}s) — TAP MIC TO TRANSCRIBE
              </Text>
            </View>
          )}

          {isTranscribing && (
            <View style={styles.transcribingBanner}>
              <ActivityIndicator size="small" color={theme.colors.accent} style={{ marginRight: 8 }} />
              <Text style={styles.transcribingText}>TRANSCRIBING WITH AWS...</Text>
            </View>
          )}

          {Boolean(statusMessage) && !isRecording && !isTranscribing && (
            <Text style={styles.statusMessage}>{statusMessage}</Text>
          )}

          <TextInput
            ref={inputRef}
            style={styles.textInput}
            multiline
            placeholder="Speak or type: e.g., Team sync in 1 minute, review lecture slides at 4pm, pick up groceries"
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
              style={[styles.micToggle, isRecording && styles.micToggleRecording]}
              onPress={handleMicPress}
              activeOpacity={0.8}
            >
              <CleanMicIcon
                size={18}
                color={isRecording ? theme.colors.danger : theme.colors.accent}
                active={isRecording}
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
  recordingBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.danger,
    marginBottom: 12,
    alignSelf: "flex-start"
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.danger,
    marginRight: 8
  },
  recordingText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    color: theme.colors.danger
  },
  transcribingBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(204, 255, 0, 0.1)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    marginBottom: 12,
    alignSelf: "flex-start"
  },
  transcribingText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
    color: theme.colors.accent
  },
  statusMessage: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 10,
    fontStyle: "italic"
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
    borderColor: theme.colors.accent,
    justifyContent: "center",
    alignItems: "center"
  },
  micToggleRecording: {
    borderColor: theme.colors.danger,
    backgroundColor: "rgba(239, 68, 68, 0.15)"
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
