"use client";

import { useLayoutEffect, useRef } from "react";

export function useManuscriptSize(value: string) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const measureRef = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const mirror = document.createElement("textarea");
    mirror.tabIndex = -1;
    mirror.setAttribute("aria-hidden", "true");
    mirror.style.cssText = "position:fixed;top:0;left:0;height:0;min-height:0;max-height:none;visibility:hidden;pointer-events:none;overflow:hidden;box-sizing:border-box;";
    document.body.append(mirror);

    const measure = () => {
      const styles = getComputedStyle(input);
      for (const property of ["font-family", "font-size", "font-weight", "line-height", "letter-spacing", "padding", "border", "white-space", "overflow-wrap", "word-break"]) {
        mirror.style.setProperty(property, styles.getPropertyValue(property));
      }
      mirror.style.width = `${input.getBoundingClientRect().width}px`;
      mirror.value = input.value;
      const borders = parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth);
      const height = Math.max(parseFloat(styles.minHeight) || 0, mirror.scrollHeight + borders);
      if (Math.abs(input.getBoundingClientRect().height - height) > 1) input.style.height = `${height}px`;
    };
    measureRef.current = measure;
    let width = 0;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width === width) return;
      width = entry.contentRect.width;
      measure();
    });
    observer.observe(input);
    measure();
    return () => {
      observer.disconnect();
      mirror.remove();
      measureRef.current = null;
    };
  }, []);

  useLayoutEffect(() => { measureRef.current?.(); }, [value]);
  return inputRef;
}
