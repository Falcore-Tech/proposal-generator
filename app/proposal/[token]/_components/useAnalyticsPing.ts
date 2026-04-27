"use client";

import { useEffect, useRef } from "react";
import axios from "axios";

export function useAnalyticsPing(proposalId: string) {
  const pinged = useRef(false);
  const scrollPinged = useRef(false);

  useEffect(() => {
    if (pinged.current) return;
    pinged.current = true;
    axios.post(`/api/animated-proposals/${proposalId}/events`, { event_type: "view" }).catch(() => {});
  }, [proposalId]);

  useEffect(() => {
    const onScroll = () => {
      if (scrollPinged.current) return;
      const scrollBottom = window.scrollY + window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      if (scrollBottom >= docHeight - 200) {
        scrollPinged.current = true;
        axios.post(`/api/animated-proposals/${proposalId}/events`, { event_type: "scroll_complete" }).catch(() => {});
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [proposalId]);
}
