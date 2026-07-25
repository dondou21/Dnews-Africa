"use client";

import { useState } from "react";
import { useEditor, EditorContent, Editor as EditorType } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Underline } from "@tiptap/extension-underline";
import { Link as LinkExtension } from "@tiptap/extension-link";
import { Image as ImageExtension } from "@tiptap/extension-image";
import { TextAlign } from "@tiptap/extension-text-align";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table/row";
import { TableCell } from "@tiptap/extension-table/cell";
import { TableHeader } from "@tiptap/extension-table/header";
import { TextStyle } from "@tiptap/extension-text-style";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, RemoveFormatting,
  List, ListOrdered, ListChecks,
  AlignLeft, AlignCenter, AlignRight, AlignJustify, IndentIncrease, IndentDecrease,
  Link, Link2Off, Image, Quote, Code2, Table as TableIcon,
  Minus, Undo2, Redo2,
} from "lucide-react";

const lowlight = createLowlight(common);

function isHtml(str: string): boolean {
  if (!str) return false;
  const trimmed = str.trim();
  return trimmed.startsWith("<") && trimmed.endsWith(">") ||
    /<[a-z][\s\S]*>/i.test(trimmed);
}

export function isRichTextContent(content: string): boolean {
  return isHtml(content);
}

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
}

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, active, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-sm p-1.5 transition-colors ${
        active
          ? "bg-dnews-accent text-white"
          : "text-dnews-gray hover:bg-dnews-light-gray hover:text-dnews-dark"
      }`}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-0.5 h-5 w-px bg-dnews-border" />;
}

interface ToolbarSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}

function ToolbarSelect({ value, onChange, options }: ToolbarSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 rounded-sm border border-dnews-border bg-dnews-bg px-1.5 text-[11px] text-dnews-dark outline-none transition-colors focus:border-dnews-accent"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

function ImageDialog({ editor, onClose }: { editor: EditorType; onClose: () => void }) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");

  const handleInsert = () => {
    if (!url) return;
    editor.chain().focus().setImage({ src: url, alt: alt || undefined }).run();
    if (caption) {
      const { from } = editor.state.selection;
      editor.chain().focus().insertContentAt(from + 1, [
        { type: "paragraph", attrs: { textAlign: "center" }, content: [{ type: "text", text: caption }] }
      ]).run();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-sm rounded-sm border border-dnews-border bg-dnews-card p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-dnews-dark">Insert Image</h4>
        <div className="space-y-3">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Image URL" className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-xs text-dnews-dark outline-none focus:border-dnews-accent" />
          <input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Alt text (optional)" className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-xs text-dnews-dark outline-none focus:border-dnews-accent" />
          <input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption (optional)" className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-xs text-dnews-dark outline-none focus:border-dnews-accent" />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-sm border border-dnews-border px-3 py-1.5 text-xs text-dnews-gray hover:bg-dnews-light-gray">Cancel</button>
          <button type="button" onClick={handleInsert} disabled={!url} className="rounded-sm bg-dnews-accent px-3 py-1.5 text-xs text-white hover:bg-dnews-accent-light disabled:opacity-50">Insert</button>
        </div>
      </div>
    </div>
  );
}

function LinkDialog({ editor, onClose }: { editor: EditorType; onClose: () => void }) {
  const existingHref = editor.getAttributes("link").href || "";
  const [href, setHref] = useState(existingHref);
  const [newTab, setNewTab] = useState(editor.getAttributes("link").target === "_blank");

  const handleSave = () => {
    if (!href) {
      editor.chain().focus().unsetLink().run();
    } else {
      editor.chain().focus().setLink({ href, target: newTab ? "_blank" : null }).run();
    }
    onClose();
  };

  const handleRemove = () => {
    editor.chain().focus().unsetLink().run();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-sm rounded-sm border border-dnews-border bg-dnews-card p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-dnews-dark">
          {existingHref ? "Edit Link" : "Insert Link"}
        </h4>
        <div className="space-y-3">
          <input value={href} onChange={(e) => setHref(e.target.value)} placeholder="https://..." className="w-full rounded-sm border border-dnews-border bg-dnews-bg px-3 py-2 text-xs text-dnews-dark outline-none focus:border-dnews-accent" />
          <label className="flex items-center gap-2 text-xs text-dnews-gray">
            <input type="checkbox" checked={newTab} onChange={(e) => setNewTab(e.target.checked)} className="h-3.5 w-3.5 accent-dnews-accent" />
            Open in new tab
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          {existingHref && <button type="button" onClick={handleRemove} className="rounded-sm border border-dnews-red/30 px-3 py-1.5 text-xs text-dnews-red hover:bg-dnews-red/5">Remove</button>}
          <button type="button" onClick={onClose} className="rounded-sm border border-dnews-border px-3 py-1.5 text-xs text-dnews-gray hover:bg-dnews-light-gray">Cancel</button>
          <button type="button" onClick={handleSave} className="rounded-sm bg-dnews-accent px-3 py-1.5 text-xs text-white hover:bg-dnews-accent-light">Save</button>
        </div>
      </div>
    </div>
  );
}

function TableMenu({ editor, onClose }: { editor: EditorType; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-xs rounded-sm border border-dnews-border bg-dnews-card p-5 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-dnews-dark">Table</h4>
        <div className="space-y-2">
          <button type="button" onClick={() => { editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(); onClose(); }} className="w-full rounded-sm bg-dnews-accent px-3 py-2 text-xs text-white hover:bg-dnews-accent-light">Insert Table (3x3)</button>
          {editor.isActive("table") && (
            <>
              <button type="button" onClick={() => { editor.chain().focus().addRowBefore().run(); }} className="w-full rounded-sm border border-dnews-border px-3 py-1.5 text-xs text-dnews-dark hover:bg-dnews-light-gray">Add Row Before</button>
              <button type="button" onClick={() => { editor.chain().focus().addRowAfter().run(); }} className="w-full rounded-sm border border-dnews-border px-3 py-1.5 text-xs text-dnews-dark hover:bg-dnews-light-gray">Add Row After</button>
              <button type="button" onClick={() => { editor.chain().focus().deleteRow().run(); }} className="w-full rounded-sm border border-dnews-red/30 px-3 py-1.5 text-xs text-dnews-red hover:bg-dnews-red/5">Delete Row</button>
              <button type="button" onClick={() => { editor.chain().focus().addColumnBefore().run(); }} className="w-full rounded-sm border border-dnews-border px-3 py-1.5 text-xs text-dnews-dark hover:bg-dnews-light-gray">Add Column Before</button>
              <button type="button" onClick={() => { editor.chain().focus().addColumnAfter().run(); }} className="w-full rounded-sm border border-dnews-border px-3 py-1.5 text-xs text-dnews-dark hover:bg-dnews-light-gray">Add Column After</button>
              <button type="button" onClick={() => { editor.chain().focus().deleteColumn().run(); }} className="w-full rounded-sm border border-dnews-red/30 px-3 py-1.5 text-xs text-dnews-red hover:bg-dnews-red/5">Delete Column</button>
              <button type="button" onClick={() => { editor.chain().focus().deleteTable().run(); onClose(); }} className="w-full rounded-sm border border-dnews-red/30 px-3 py-1.5 text-xs text-dnews-red hover:bg-dnews-red/5">Delete Table</button>
            </>
          )}
        </div>
        <div className="mt-3 flex justify-end">
          <button type="button" onClick={onClose} className="rounded-sm border border-dnews-border px-3 py-1.5 text-xs text-dnews-gray hover:bg-dnews-light-gray">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showTableMenu, setShowTableMenu] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4] },
        codeBlock: false,
      }),
      Underline,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer" },
      }),
      ImageExtension,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextStyle,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: isHtml(content) ? content : "",
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[300px] px-4 py-3 text-dnews-dark leading-relaxed",
      },
    },
  });

  if (!editor) return null;

  const headingLevel = (() => {
    for (let i = 1; i <= 4; i++) {
      if (editor.isActive("heading", { level: i })) return i;
    }
    return 0;
  })();

  return (
    <div className="rounded-sm border border-dnews-border bg-dnews-card">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-dnews-border bg-dnews-bg/80 px-2 py-1.5">
        {/* History */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)">
          <Undo2 size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Shift+Z)">
          <Redo2 size={14} />
        </ToolbarButton>
        <ToolbarDivider />

        {/* Formatting */}
        <ToolbarSelect
          value={String(headingLevel)}
          onChange={(val) => {
            const level = Number(val);
            if (level === 0) editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 }).run();
          }}
          options={[
            { value: "0", label: "Paragraph" },
            { value: "1", label: "Heading 1" },
            { value: "2", label: "Heading 2" },
            { value: "3", label: "Heading 3" },
            { value: "4", label: "Heading 4" },
          ]}
        />
        <ToolbarDivider />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold (Ctrl+B)">
          <Bold size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic (Ctrl+I)">
          <Italic size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline (Ctrl+U)">
          <UnderlineIcon size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough">
          <Strikethrough size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline Code">
          <Code size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().unsetAllMarks().run()} title="Clear Formatting">
          <RemoveFormatting size={14} />
        </ToolbarButton>
        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet List">
          <List size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Numbered List">
          <ListOrdered size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleTaskList().run()} active={editor.isActive("taskList")} title="Checklist">
          <ListChecks size={14} />
        </ToolbarButton>
        <ToolbarDivider />

        {/* Alignment */}
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align Left">
          <AlignLeft size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align Center">
          <AlignCenter size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align Right">
          <AlignRight size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("justify").run()} active={editor.isActive({ textAlign: "justify" })} title="Justify">
          <AlignJustify size={14} />
        </ToolbarButton>
        <ToolbarDivider />

        {/* Indent */}
        <ToolbarButton onClick={() => editor.chain().focus().sinkListItem("listItem").run()} title="Increase Indent">
          <IndentIncrease size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().liftListItem("listItem").run()} title="Decrease Indent">
          <IndentDecrease size={14} />
        </ToolbarButton>
        <ToolbarDivider />

        {/* Insert */}
        <ToolbarButton onClick={() => setShowLinkDialog(true)} active={editor.isActive("link")} title={editor.isActive("link") ? "Edit Link" : "Insert Link"}>
          <Link size={14} />
        </ToolbarButton>
        {editor.isActive("link") && (
          <ToolbarButton onClick={() => editor.chain().focus().unsetLink().run()} title="Remove Link">
            <Link2Off size={14} />
          </ToolbarButton>
        )}
        <ToolbarButton onClick={() => setShowImageDialog(true)} title="Insert Image">
          <Image size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">
          <Quote size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code Block">
          <Code2 size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => setShowTableMenu(true)} active={editor.isActive("table")} title="Table">
          <TableIcon size={14} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule">
          <Minus size={14} />
        </ToolbarButton>
      </div>

      <EditorContent editor={editor} />

      {showImageDialog && <ImageDialog editor={editor} onClose={() => setShowImageDialog(false)} />}
      {showLinkDialog && <LinkDialog editor={editor} onClose={() => setShowLinkDialog(false)} />}
      {showTableMenu && <TableMenu editor={editor} onClose={() => setShowTableMenu(false)} />}

      <style jsx global>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror h1 { font-size: 1.75rem; font-weight: 700; line-height: 1.2; margin: 1.5rem 0 0.75rem; }
        .ProseMirror h2 { font-size: 1.5rem; font-weight: 700; line-height: 1.25; margin: 1.25rem 0 0.5rem; }
        .ProseMirror h3 { font-size: 1.25rem; font-weight: 600; line-height: 1.3; margin: 1rem 0 0.5rem; }
        .ProseMirror h4 { font-size: 1.1rem; font-weight: 600; line-height: 1.35; margin: 0.75rem 0 0.5rem; }
        .ProseMirror p { margin: 0.5rem 0; line-height: 1.75; }
        .ProseMirror ul, .ProseMirror ol { padding-left: 1.5rem; margin: 0.5rem 0; }
        .ProseMirror li { margin: 0.25rem 0; }
        .ProseMirror ul[data-type="taskList"] { list-style: none; padding-left: 0; }
        .ProseMirror ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 0.5rem; }
        .ProseMirror ul[data-type="taskList"] li label { flex-shrink: 0; }
        .ProseMirror blockquote { border-left: 3px solid var(--color-dnews-accent, #1e3a5f); padding-left: 1rem; margin: 0.75rem 0; color: var(--dnews-gray, #4a4a4a); font-style: italic; }
        .ProseMirror pre { background: #1a1a2e; color: #e0e0e0; border-radius: 3px; padding: 0.75rem 1rem; margin: 0.75rem 0; overflow-x: auto; font-size: 0.85rem; }
        .ProseMirror pre code { background: none; color: inherit; padding: 0; font-size: inherit; }
        .ProseMirror code { background: #f0f0f0; border-radius: 2px; padding: 0.15rem 0.35rem; font-size: 0.85em; color: #d63384; }
        .ProseMirror img { max-width: 100%; height: auto; border-radius: 3px; margin: 0.75rem 0; }
        .ProseMirror a { color: var(--color-dnews-accent, #1e3a5f); text-decoration: underline; cursor: pointer; }
        .ProseMirror hr { border: none; border-top: 1px solid var(--dnews-border, #e0e0e0); margin: 1.5rem 0; }
        .ProseMirror table { width: 100%; border-collapse: collapse; margin: 0.75rem 0; }
        .ProseMirror th, .ProseMirror td { border: 1px solid var(--dnews-border, #e0e0e0); padding: 0.5rem 0.75rem; text-align: left; min-width: 60px; }
        .ProseMirror th { background: var(--dnews-light-gray, #f5f5f5); font-weight: 600; }
        .ProseMirror p[style*="text-align: center"] { text-align: center; }
        .ProseMirror p[style*="text-align: right"] { text-align: right; }
        .ProseMirror p[style*="text-align: justify"] { text-align: justify; }
        .dark .ProseMirror code { background: #2a2a3a; color: #e685b5; }
        .dark .ProseMirror pre { background: #0d0d1a; }
        .dark .ProseMirror th { background: #1a1a2a; }
        .dark .ProseMirror blockquote { color: #a0a0a0; }
        .ProseMirror:focus { outline: none; }
        .ProseMirror { min-height: 300px; padding: 0.75rem 1rem; }
      `}</style>
    </div>
  );
}
