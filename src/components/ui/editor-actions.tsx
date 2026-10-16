import type { ReactNode } from 'react';

export default function EditorActions({ children, editing }: { children: ReactNode; editing: ReactNode }) {
  return (
    <div className="editor-actions">
      <div className="editor-actions-main" role="group" aria-label="工具操作">{children}</div>
      <div className="editor-actions-edit" role="group" aria-label="编辑操作">{editing}</div>
    </div>
  );
}
