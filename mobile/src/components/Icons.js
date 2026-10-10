import React from "react";
import Svg, { Path, Rect, Circle, Line } from "react-native-svg";

export function TasksTabIcon({ color = "#0E382F", size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="4"
        width="18"
        height="17"
        rx="3"
        stroke={color}
        strokeWidth="1.8"
      />
      <Line x1="16" y1="2" x2="16" y2="5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="8" y1="2" x2="8" y2="5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Line x1="3" y1="9" x2="21" y2="9" stroke={color} strokeWidth="1.5" />
      <Path
        d="M8 14L10.5 16.5L16 12"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CategoriesTabIcon({ color = "#0E382F", size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3.5" y="3.5" width="7" height="7" rx="2" stroke={color} strokeWidth="1.8" />
      <Rect x="13.5" y="3.5" width="7" height="7" rx="2" stroke={color} strokeWidth="1.8" />
      <Rect x="3.5" y="13.5" width="7" height="7" rx="2" stroke={color} strokeWidth="1.8" />
      <Rect x="13.5" y="13.5" width="7" height="7" rx="2" stroke={color} strokeWidth="1.8" />
    </Svg>
  );
}

export function CompletedTabIcon({ color = "#0E382F", size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
      <Path
        d="M8 12.2L10.8 15L16.2 9.5"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function InsightsTabIcon({ color = "#0E382F", size = 20 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="13" width="3.5" height="7" rx="1.5" stroke={color} strokeWidth="1.8" />
      <Rect x="10.25" y="7" width="3.5" height="13" rx="1.5" stroke={color} strokeWidth="1.8" />
      <Rect x="16.5" y="4" width="3.5" height="16" rx="1.5" stroke={color} strokeWidth="1.8" />
    </Svg>
  );
}

export function CenterPlusIcon({ color = "#FFFFFF", size = 22 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5V19M5 12H19"
        stroke={color}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function ClockIcon({ color = "#7C9289", size = 12 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
      <Path d="M12 7V12L15 14" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function CloseIcon({ color = "#7C9289", size = 16 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 6L6 18M6 6L18 18"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}
