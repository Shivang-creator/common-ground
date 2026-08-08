"use client";

import { useState } from "react";
import type { Answer } from "@/lib/answers";

/**
 * Writing down what the tutor said.
 *
 * The point is not note-taking. An answer recorded here removes that question from
 * the email — so the tenth person in a group to open the brief asks the tutor only
 * what nobody has asked yet.
 *
 * The tutor's words are stored exactly as typed. Nothing here rewrites them, and no
 * model ever sees them.
 */
export function AnswerBox({
  answer,
  onSave,
  onRemove,
}: {
  answer?: Answer;
  onSave: (a: Answer) => void;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(answer?.text ?? "");
  const [by, setBy] = useState(answer?.by ?? "");

  if (answer && !open) {
    return (
      <div
        className="rounded-lg p-3 mt-2 text-sm"
        style={{ background: "var(--accent-soft)", border: "1px solid var(--accent)" }}
      >
        <p className="font-semibold mb-1" style={{ color: "var(--accent)" }}>
          Answered — this one is out of the email
        </p>
        <p style={{ color: "var(--text)" }}>{answer.text}</p>
        <p className="text-xs mt-1.5" style={{ color: "var(--text-muted)" }}>
          {answer.by ? `Written down by ${answer.by}` : "Written down"} ·{" "}
          {new Date(answer.at).toLocaleDateString()}
        </p>
        <div className="flex gap-2 mt-2 no-print">
          <button type="button" className="btn btn-quiet px-3 py-1.5 text-sm" onClick={() => setOpen(true)}>
            Edit
          </button>
          <button
            type="button"
            className="btn btn-quiet px-3 py-1.5 text-sm"
            onClick={() => {
              onRemove();
              setText("");
              setBy("");
            }}
          >
            Remove
          </button>
        </div>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        className="btn btn-quiet px-3 py-1.5 text-sm mt-2 no-print"
        onClick={() => setOpen(true)}
      >
        + They answered this
      </button>
    );
  }

  return (
    <form
      className="mt-2 space-y-2 no-print"
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        onSave({ text: text.trim(), by: by.trim() || undefined, at: new Date().toISOString() });
        setOpen(false);
      }}
    >
      <label className="text-sm font-semibold block">
        What did they say?
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          autoFocus
          className="w-full p-2.5 mt-1 font-normal"
          placeholder="Their answer, in their words."
        />
      </label>
      <label className="text-sm font-semibold block">
        Your name{" "}
        <span className="font-normal" style={{ color: "var(--text-muted)" }}>
          — optional, so the group knows who asked
        </span>
        <input value={by} onChange={(e) => setBy(e.target.value)} className="w-full p-2.5 mt-1 font-normal" />
      </label>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primary px-4 py-2 text-sm" disabled={!text.trim()}>
          Save
        </button>
        <button
          type="button"
          className="btn btn-quiet px-4 py-2 text-sm"
          onClick={() => {
            setOpen(false);
            setText(answer?.text ?? "");
          }}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
