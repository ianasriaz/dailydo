import React from "react";
import { View } from "react-native";

export function CleanMicIcon({ size = 18, color = "#FFFFFF", active = false }) {
  const capsuleW = Math.round(size * 0.44);
  const capsuleH = Math.round(size * 0.65);
  const stroke = 2;

  return (
    <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
      {/* Top Capsule Mic Head */}
      <View
        style={{
          width: capsuleW,
          height: capsuleH,
          borderRadius: Math.round(capsuleW / 2),
          borderWidth: stroke,
          borderColor: color,
          backgroundColor: active ? color : "transparent"
        }}
      />

      {/* U-shaped Cradle Arc */}
      <View
        style={{
          position: "absolute",
          bottom: Math.round(size * 0.18),
          width: Math.round(size * 0.76),
          height: Math.round(size * 0.44),
          borderBottomLeftRadius: Math.round(size * 0.38),
          borderBottomRightRadius: Math.round(size * 0.38),
          borderWidth: stroke,
          borderTopWidth: 0,
          borderColor: color
        }}
      />

      {/* Stem / Stand */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: stroke,
          height: Math.round(size * 0.22),
          backgroundColor: color
        }}
      />

      {/* Stand Base */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: Math.round(size * 0.44),
          height: stroke,
          backgroundColor: color,
          borderRadius: 1
        }}
      />
    </View>
  );
}
