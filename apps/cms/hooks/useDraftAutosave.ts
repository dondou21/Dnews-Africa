"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { del, flush, get, put } from "@dnews/api-client";
import {
  DRAFT_DEBOUNCE_MS,
  type ArticleDraftData,
  type AutosaveStatus,
  type PendingDraft,
  type ServerDraft,
  clearLocalDraft,
  draftHasContent,
  isDraftStale,
  readLocalDraft,
  writeLocalDraft,
} from "@/lib/draftAutosave";

interface UseDraftAutosaveOptions {
  formKey: string;
  articleId?: string | null;
  enabled: boolean;
  snapshot: ArticleDraftData;
  baselineUpdatedAt?: string | null;
  onRestore: (data: ArticleDraftData) => void;
}

interface UseDraftAutosaveResult {
  status: AutosaveStatus;
  lastSavedAt: Date | null;
  pendingRestore: PendingDraft | null;
  restoreDraft: () => void;
  discardDraft: () => void;
  clearDraft: () => Promise<void>;
  saveNow: () => void;
}

export function useDraftAutosave(options: UseDraftAutosaveOptions): UseDraftAutosaveResult {
  const { formKey, articleId, enabled, snapshot, baselineUpdatedAt, onRestore } = options;

  const [status, setStatus] = useState<AutosaveStatus>("idle");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [pendingRestore, setPendingRestore] = useState<PendingDraft | null>(null);

  const snapshotRef = useRef(snapshot);
  snapshotRef.current = snapshot;

  const snapshotString = useMemo(() => JSON.stringify(snapshot), [snapshot]);
  const snapshotStringRef = useRef(snapshotString);
  snapshotStringRef.current = snapshotString;

  const lastSavedStringRef = useRef<string | null>(null);
  const readyRef = useRef(false);
  const articleIdRef = useRef(articleId);
  articleIdRef.current = articleId;

  const onRestoreRef = useRef(onRestore);
  onRestoreRef.current = onRestore;

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inFlightRef = useRef(false);
  const inFlightPromiseRef = useRef<Promise<void> | null>(null);

  const doSave = useCallback(async () => {
    if (!readyRef.current || inFlightRef.current) return;
    inFlightRef.current = true;

    const payload = snapshotRef.current;
    const payloadString = JSON.stringify(payload);
    setStatus("saving");

    const run = (async () => {
      try {
        const saved = await put<ServerDraft>(`/drafts/${encodeURIComponent(formKey)}`, {
          data: payload,
          articleId: articleIdRef.current ?? null,
        });
        lastSavedStringRef.current = payloadString;
        setLastSavedAt(new Date(saved.updatedAt));
        setStatus("saved");
        writeLocalDraft(formKey, payload, saved.updatedAt);
      } catch {
        setStatus("error");
        writeLocalDraft(formKey, payload, null);
      } finally {
        inFlightRef.current = false;
        inFlightPromiseRef.current = null;
        if (snapshotStringRef.current !== payloadString) {
          setStatus("unsaved");
          if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
          saveTimerRef.current = setTimeout(() => {
            void doSave();
          }, DRAFT_DEBOUNCE_MS);
        }
      }
    })();

    inFlightPromiseRef.current = run;
    await run;
  }, [formKey]);

  const flushNow = useCallback(() => {
    if (!readyRef.current) return;
    const payload = snapshotRef.current;
    const payloadString = JSON.stringify(payload);
    if (payloadString === lastSavedStringRef.current) return;
    writeLocalDraft(formKey, payload, null);
    void flush("PUT", `/drafts/${encodeURIComponent(formKey)}`, {
      data: payload,
      articleId: articleIdRef.current ?? null,
    });
  }, [formKey]);

  useEffect(() => {
    if (!enabled || !readyRef.current) return;
    if (snapshotString === lastSavedStringRef.current) return;
    setStatus("unsaved");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      void doSave();
    }, DRAFT_DEBOUNCE_MS);
  }, [snapshotString, enabled, doSave]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    const baselineString = snapshotStringRef.current;

    function markReady() {
      readyRef.current = true;
      lastSavedStringRef.current = baselineString;
      setStatus("saved");
      if (snapshotStringRef.current !== baselineString) {
        setStatus("unsaved");
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
          void doSave();
        }, DRAFT_DEBOUNCE_MS);
      }
    }

    async function loadExistingDraft() {
      const local = readLocalDraft(formKey);
      let server: ServerDraft | null = null;
      try {
        server = await get<ServerDraft | null>(`/drafts/${encodeURIComponent(formKey)}`);
      } catch {
        server = null;
      }
      if (cancelled) return;

      let candidate: PendingDraft | null = null;
      if (server && server.data && typeof server.data === "object") {
        candidate = {
          data: server.data as ArticleDraftData,
          savedAt: server.updatedAt,
          serverUpdatedAt: server.updatedAt,
        };
      }
      if (local && local.data && typeof local.data === "object") {
        const localTime = local.serverUpdatedAt ? Date.parse(local.serverUpdatedAt) : 0;
        const serverTime = server ? Date.parse(server.updatedAt) : NaN;
        if (!candidate) {
          candidate = {
            data: local.data,
            savedAt: local.savedAt,
            serverUpdatedAt: local.serverUpdatedAt,
          };
        } else if (Number.isFinite(localTime) && Number.isFinite(serverTime) && localTime > serverTime) {
          candidate = {
            data: local.data,
            savedAt: local.savedAt,
            serverUpdatedAt: local.serverUpdatedAt,
          };
        }
      }

      if (candidate) {
        if (isDraftStale(candidate, baselineUpdatedAt)) {
          clearLocalDraft(formKey);
          markReady();
          return;
        }
        if (!draftHasContent(candidate.data)) {
          clearLocalDraft(formKey);
          markReady();
          return;
        }
        setPendingRestore(candidate);
        return;
      }

      markReady();
    }

    void loadExistingDraft();

    return () => {
      cancelled = true;
    };
  }, [enabled, formKey, baselineUpdatedAt, doSave]);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden") flushNow();
    };
    const handlePageHide = () => flushNow();

    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibility);
      flushNow();
    };
  }, [flushNow]);

  const restoreDraft = useCallback(() => {
    if (!pendingRestore) return;
    const data = pendingRestore.data;
    setPendingRestore(null);
    readyRef.current = true;
    onRestoreRef.current(data);
    setStatus("unsaved");
  }, [pendingRestore]);

  const discardDraft = useCallback(() => {
    setPendingRestore(null);
    clearLocalDraft(formKey);
    void del(`/drafts/${encodeURIComponent(formKey)}`).catch(() => {});
    readyRef.current = true;
    lastSavedStringRef.current = snapshotStringRef.current;
    setStatus("saved");
  }, [formKey]);

  const clearDraft = useCallback(async () => {
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
    if (inFlightPromiseRef.current) {
      await inFlightPromiseRef.current.catch(() => {});
    }
    clearLocalDraft(formKey);
    try {
      await del(`/drafts/${encodeURIComponent(formKey)}`);
    } catch {
      void flush("DELETE", `/drafts/${encodeURIComponent(formKey)}`);
    }
    readyRef.current = true;
    lastSavedStringRef.current = snapshotStringRef.current;
    setStatus("saved");
  }, [formKey]);

  const saveNow = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    void doSave();
  }, [doSave]);

  return {
    status,
    lastSavedAt,
    pendingRestore,
    restoreDraft,
    discardDraft,
    clearDraft,
    saveNow,
  };
}
