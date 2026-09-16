"use client";

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, List, ListOrdered, Quote, Heading2, Heading3, Undo, Redo } from 'lucide-react'

interface TipTapEditorProps {
  content: string;
  onChange: (content: string) => void;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null
  }

  return (
    <div style={{ 
      padding: "8px", display: "flex", flexWrap: "wrap", gap: "8px", 
      borderBottom: "1px solid var(--border)", background: "var(--surface-2)" 
    }}>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        style={{ 
          background: editor.isActive('bold') ? "rgba(124,58,237,0.3)" : "transparent",
          color: editor.isActive('bold') ? "#c084fc" : "var(--text-3)",
          border: "none", borderRadius: 6, padding: 6, cursor: "pointer", display: "flex", alignItems: "center"
        }}
      >
        <Bold size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        style={{ 
          background: editor.isActive('italic') ? "rgba(124,58,237,0.3)" : "transparent",
          color: editor.isActive('italic') ? "#c084fc" : "var(--text-3)",
          border: "none", borderRadius: 6, padding: 6, cursor: "pointer", display: "flex", alignItems: "center"
        }}
      >
        <Italic size={16} />
      </button>

      <div style={{ width: 1, background: "var(--border)", margin: "0 4px" }} />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        style={{ 
          background: editor.isActive('heading', { level: 2 }) ? "rgba(124,58,237,0.3)" : "transparent",
          color: editor.isActive('heading', { level: 2 }) ? "#c084fc" : "var(--text-3)",
          border: "none", borderRadius: 6, padding: 6, cursor: "pointer", display: "flex", alignItems: "center"
        }}
      >
        <Heading2 size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        style={{ 
          background: editor.isActive('heading', { level: 3 }) ? "rgba(124,58,237,0.3)" : "transparent",
          color: editor.isActive('heading', { level: 3 }) ? "#c084fc" : "var(--text-3)",
          border: "none", borderRadius: 6, padding: 6, cursor: "pointer", display: "flex", alignItems: "center"
        }}
      >
        <Heading3 size={16} />
      </button>

      <div style={{ width: 1, background: "var(--border)", margin: "0 4px" }} />

      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        style={{ 
          background: editor.isActive('bulletList') ? "rgba(124,58,237,0.3)" : "transparent",
          color: editor.isActive('bulletList') ? "#c084fc" : "var(--text-3)",
          border: "none", borderRadius: 6, padding: 6, cursor: "pointer", display: "flex", alignItems: "center"
        }}
      >
        <List size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        style={{ 
          background: editor.isActive('orderedList') ? "rgba(124,58,237,0.3)" : "transparent",
          color: editor.isActive('orderedList') ? "#c084fc" : "var(--text-3)",
          border: "none", borderRadius: 6, padding: 6, cursor: "pointer", display: "flex", alignItems: "center"
        }}
      >
        <ListOrdered size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        style={{ 
          background: editor.isActive('blockquote') ? "rgba(124,58,237,0.3)" : "transparent",
          color: editor.isActive('blockquote') ? "#c084fc" : "var(--text-3)",
          border: "none", borderRadius: 6, padding: 6, cursor: "pointer", display: "flex", alignItems: "center"
        }}
      >
        <Quote size={16} />
      </button>

      <div style={{ width: 1, background: "var(--border)", margin: "0 4px", marginLeft: "auto" }} />

      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        style={{ background: "transparent", color: "var(--text-2)", border: "none", borderRadius: 6, padding: 6, cursor: "pointer", display: "flex", alignItems: "center" }}
      >
        <Undo size={16} />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        style={{ background: "transparent", color: "var(--text-2)", border: "none", borderRadius: 6, padding: 6, cursor: "pointer", display: "flex", alignItems: "center" }}
      >
        <Redo size={16} />
      </button>
    </div>
  )
}

export function TipTapEditor({ content, onChange }: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap-editor-content',
        style: 'padding: 16px; min-height: 200px; color: var(--text-1); font-size: 15px; outline: none; line-height: 1.6;'
      }
    }
  })

  return (
    <div style={{ 
      border: "1px solid var(--border)", 
      borderRadius: 12, 
      overflow: "hidden",
      background: "var(--surface)"
    }}>
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <style>{`
        .tiptap-editor-content h2 { font-size: 24px; font-weight: 700; margin: 24px 0 16px; }
        .tiptap-editor-content h3 { font-size: 20px; font-weight: 600; margin: 20px 0 12px; }
        .tiptap-editor-content p { margin-bottom: 16px; }
        .tiptap-editor-content ul { padding-left: 24px; margin-bottom: 16px; list-style-type: disc; }
        .tiptap-editor-content ol { padding-left: 24px; margin-bottom: 16px; list-style-type: decimal; }
        .tiptap-editor-content blockquote { border-left: 3px solid #c084fc; padding-left: 16px; margin: 16px 0; color: #cbd5e1; font-style: italic; background: rgba(192,132,252,0.05); padding: 12px 16px; border-radius: 0 8px 8px 0; }
        .tiptap-editor-content.ProseMirror-focused { border: none; outline: none; }
      `}</style>
    </div>
  )
}
