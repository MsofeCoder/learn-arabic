"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Arabic pronunciation via the browser's own speech synthesis.
 *
 * This is the MVP's `AudioSource` for single words and phrases: no external
 * media, no rights questions, no infrastructure. It degrades silently — when no
 * Arabic voice is installed the control simply does not render, rather than
 * offering a button that does nothing.
 */
export interface ArabicSpeech {
  supported: boolean;
  speak: (text: string) => void;
}

export function useArabicSpeech(): ArabicSpeech {
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    const check = () => {
      const voices = window.speechSynthesis.getVoices();
      setSupported(voices.some((voice) => voice.lang.toLowerCase().startsWith("ar")));
    };

    check();
    window.speechSynthesis.addEventListener("voiceschanged", check);
    return () =>
      window.speechSynthesis.removeEventListener("voiceschanged", check);
  }, []);

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const voice = window.speechSynthesis
      .getVoices()
      .find((candidate) => candidate.lang.toLowerCase().startsWith("ar"));
    if (!voice) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }, []);

  return { supported, speak };
}
