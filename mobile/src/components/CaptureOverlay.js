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
  Alert
} from "react-native";
import {
  useAudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";
import { CleanMicIcon } from "./CleanMicIcon.js";
import { api } from "../services/api.js";
import { theme } from "../theme.js";

export function CaptureOverlay({ visible, initialVoiceMode, onClose, onSubmit, isProcessing }) {
  const [text, setText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("info"); // 'info' | 'active' | 'error' | 'success'

  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const webRecognitionRef = useRef(null);

  // Initialize native audio recorder from Expo SDK 57
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

  // Synchronize timer while recording
  useEffect(() => {
    if (isRecording) {
      setRecordSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setRecordSeconds(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);

  useEffect(() => {
    if (visible) {
      if (initialVoiceMode) {
        startRecording();
      } else {
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    } else {
      cleanupOnClose();
    }
  }, [visible, initialVoiceMode]);

  const cleanupOnClose = () => {
    if (webRecognitionRef.current) {
      try {
        webRecognitionRef.current.stop();
      } catch {}
      webRecognitionRef.current = null;
    }
    if (isRecording) {
      try {
        recorder.stop().catch(() => {});
      } catch {}
      setIsRecording(false);
    }
    setIsTranscribing(false);
    setStatusMessage("");
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordSeconds(0);
  };

  const startRecording = async () => {
    // 1. Web browser: Use Web Speech API if supported for instant real-time dictation
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

          rec.onerror = (err) => {
            console.warn("Web speech error:", err);
            setIsRecording(false);
            setStatusMessage("Web speech stopped");
            setStatusType("info");
          };

          rec.onend = () => {
            setIsRecording(false);
          };

          rec.start();
          webRecognitionRef.current = rec;
          setIsRecording(true);
          setStatusMessage("LISTENING... SPEAK NOW");
          setStatusType("active");
          return;
        } catch (err) {
          console.warn("Web speech init failed, falling back to audio recording:", err);
        }
      }
    }

    // 2. Native Mobile (iOS / Android / Expo Go): Record audio and send to AWS Transcribe
    try {
      setStatusMessage("CHECKING MICROPHONE PERMISSION...");
      setStatusType("info");

      const perm = await requestRecordingPermissionsAsync();
      if (!perm.granted) {
        setStatusMessage("MICROPHONE PERMISSION DENIED — ALLOW IN SETTINGS");
        setStatusType("error");
        Alert.alert(
          "Microphone Permission",
          "Microphone access is required to capture voice tasks. Please enable it in your device settings."
        );
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      setStatusMessage("PREPARING MICROPHONE...");
      await recorder.prepareToRecordAsync();
      recorder.record();
      setIsRecording(true);
      setStatusMessage("RECORDING... SPEAK NOW (TAP MIC WHEN DONE)");
      setStatusType("active");
    } catch (err) {
      console.error("Failed to start voice recording:", err);
      setStatusMessage("MIC ERROR: " + (err.message || "Failed to start"));
      setStatusType("error");
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    // Web speech recognition cleanup
    if (webRecognitionRef.current) {
      try {
        webRecognitionRef.current.stop();
      } catch {}
      webRecognitionRef.current = null;
      setIsRecording(false);
      setStatusMessage("VOICE CAPTURED");
      setStatusType("success");
      return;
    }

    if (!isRecording) return;
    setIsRecording(false);
    setIsTranscribing(true);
    setStatusMessage("TRANSCRIBING WITH AWS...");
    setStatusType("info");

    try {
      await recorder.stop();
      const uri = recorder.uri;
      console.log("[DailyDo Voice] Captured audio at URI:", uri);

      if (!uri) {
        throw new Error("No audio recording file was created");
      }

      // Read audio file as base64 using expo-file-system
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (!base64Audio || base64Audio.length < 50) {
        throw new Error("Audio recording was empty or too brief");
      }

      console.log(`[DailyDo Voice] Uploading ${base64Audio.length} base64 chars for transcription...`);
      const format = Platform.OS === "web" ? "webm" : "m4a";
      const result = await api.transcribeAudio(base64Audio, format);

      if (result?.text && result.text.trim()) {
        const spoken = result.text.trim();
        setText(prev => (prev ? `${prev} ${spoken}` : spoken));
        setStatusMessage("TRANSCRIBED: " + spoken.slice(0, 36) + (spoken.length > 36 ? "..." : ""));
        setStatusType("success");
      } else {
        setStatusMessage("NO SPEECH DETECTED — SPEAK CLEARLY");
        setStatusType("info");
      }
    } catch (err) {
      console.warn("[DailyDo Voice] Transcription error:", err);
      setStatusMessage("TRANSCRIBE FAILED: " + (err.message || "Network issue"));
      setStatusType("error");
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isTranscribing) {
      startRecording();
    }
  };

  const handleSubmit = async () => {
    if (isRecording) {
      await stopRecording();
    }
    if (!text.trim() || isProcessing) return;
    cleanupOnClose();
    onSubmit(text.trim());
    setText("");
  };

  const handleChipClick = (snippet) => {
    setText(prev => (prev ? `${prev}, ${snippet}` : snippet));
  };

  const formatTimer = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <View style={styles.titleBox}>
              <Text style={styles.headerTitle}>QUICK CAPTURE</Text>
              <Text style={styles.headerSubtitle}>
                Speak or type thoughts — Bedrock will organize them.
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Dynamic Status / Recording Indicator */}
          {isRecording ? (
            <View style={styles.recordingBadge}>
              <View style={styles.pulseDot} />
              <Text style={styles.recordingText}>
                RECORDING [{formatTimer(recordSeconds)}] — SPEAK NOW
              </Text>
              <TouchableOpacity style={styles.stopPill} onPress={stopRecording} activeOpacity={0.8}>
                <Text style={styles.stopPillText}>DONE SPEAKING</Text>
              </TouchableOpacity>
            </View>
          ) : isTranscribing ? (
            <View style={styles.transcribingBadge}>
              <ActivityIndicator size="small" color={theme.colors.accent} style={{ marginRight: 8 }} />
              <Text style={styles.transcribingText}>TRANSCRIBING WITH AWS TRANSCRIBE...</Text>
            </View>
          ) : statusMessage ? (
            <View style={[
              styles.statusBadge,
              statusType === "error" && styles.statusBadgeError,
              statusType === "success" && styles.statusBadgeSuccess
            ]}>
              <Text style={[
                styles.statusText,
                statusType === "error" && styles.statusTextError,
                statusType === "success" && styles.statusTextSuccess
              ]}>
                {statusMessage}
              </Text>
            </View>
          ) : null}

          <TextInput
            ref={inputRef}
            style={styles.textInput}
            multiline
            placeholder="e.g., Team sync in 1 minute, review lecture slides at 4pm, pick up groceries"
            placeholderTextColor={theme.colors.textMuted}
            value={text}
            onChangeText={setText}
            autoFocus={!initialVoiceMode}
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
              style={[
                styles.micToggle,
                isRecording && styles.micToggleRecording,
                isTranscribing && styles.micToggleTranscribing
              ]}
              onPress={handleMicToggle}
              disabled={isTranscribing}
              activeOpacity={0.8}
            >
              {isTranscribing ? (
                <ActivityIndicator size="small" color={theme.colors.accent} />
              ) : (
                <CleanMicIcon
                  size={18}
                  color={isRecording ? theme.colors.accent : theme.colors.textSecondary}
                  active={isRecording}
                />
              )}
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
    minHeight: 390
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
  recordingBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(204, 255, 0, 0.12)",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.accent,
    marginBottom: 12
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.accent,
    marginRight: 8
  },
  recordingText: {
    flex: 1,
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0.8,
    color: theme.colors.accent
  },
  stopPill: {
    backgroundColor: theme.colors.accent,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginLeft: 8
  },
  stopPillText: {
    fontSize: 9,
    fontWeight: "900",
    color: theme.colors.accentText,
    letterSpacing: 0.5
  },
  transcribingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12
  },
  transcribingText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: theme.colors.accent
  },
  statusBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: 12
  },
  statusBadgeError: {
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    borderColor: "#EF4444"
  },
  statusBadgeSuccess: {
    backgroundColor: "rgba(34, 197, 94, 0.12)",
    borderColor: "#22C55E"
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: theme.colors.textSecondary
  },
  statusTextError: {
    color: "#EF4444"
  },
  statusTextSuccess: {
    color: "#22C55E"
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.bg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    justifyContent: "center",
    alignItems: "center"
  },
  micToggleRecording: {
    borderColor: theme.colors.accent,
    backgroundColor: "rgba(204, 255, 0, 0.16)"
  },
  micToggleTranscribing: {
    borderColor: theme.colors.accent,
    backgroundColor: "rgba(204, 255, 0, 0.06)"
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
