import React from "react";
import Markdown from "react-native-markdown-display";
import { TextStyle } from "react-native";

type Props = {
  children: string;
  style?: Record<string, TextStyle>;
};

const superMap: Record<string, string> = {
  "0": "⁰",
  "1": "¹",
  "2": "²",
  "3": "³",
  "4": "⁴",
  "5": "⁵",
  "6": "⁶",
  "7": "⁷",
  "8": "⁸",
  "9": "⁹",
  "+": "⁺",
  "-": "⁻",
  "=": "⁼",
  "(": "⁽",
  ")": "⁾",
  n: "ⁿ",
  i: "ⁱ",
};

const subMap: Record<string, string> = {
  "0": "₀",
  "1": "₁",
  "2": "₂",
  "3": "₃",
  "4": "₄",
  "5": "₅",
  "6": "₆",
  "7": "₇",
  "8": "₈",
  "9": "₉",
  "+": "₊",
  "-": "₋",
  "=": "₌",
  "(": "₍",
  ")": "₎",
  // letters that have unicode subscripts
  a: "ₐ",
  e: "ₑ",
  h: "ₕ",
  i: "ᵢ",
  j: "ⱼ",
  k: "ₖ",
  l: "ₗ",
  m: "ₘ",
  n: "ₙ",
  o: "ₒ",
  p: "ₚ",
  r: "ᵣ",
  s: "ₛ",
  t: "ₜ",
  u: "ᵤ",
  v: "ᵥ",
  x: "ₓ",
};

function toSuperscript(input: string): string {
  return input
    .split("")
    .map((ch) => superMap[ch] ?? ch)
    .join("");
}

function toSubscript(input: string): string {
  return input
    .split("")
    .map((ch) => subMap[ch] ?? ch)
    .join("");
}

function convertSimpleMath(src: string): string {
  let text = src;

  // Handle ^{...} and _{...}
  text = text.replace(/\^\{([^}]+)\}/g, (_, grp) => toSuperscript(grp));
  text = text.replace(/_\{([^}]+)\}/g, (_, grp) => toSubscript(grp));

  // Handle simple ^x and _x (one or more word chars/digits/signs)
  // Prefer shorter matches to avoid being too greedy within words
  text = text.replace(/\^(\w[\w+\-()=]*)/g, (_, grp) => toSuperscript(grp));
  text = text.replace(/_(\w[\w+\-()=]*)/g, (_, grp) => toSubscript(grp));

  return text;
}

export default function MathMarkdown({ children, style }: Props) {
  const processed = React.useMemo(
    () => convertSimpleMath(children || ""),
    [children]
  );
  return <Markdown style={style as any}>{processed}</Markdown>;
}
