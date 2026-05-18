import * as React from 'react';
import { json } from '@codemirror/lang-json';
import { foldGutter, HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { Annotation, EditorState, StateEffect } from '@codemirror/state';
import { EditorView, lineNumbers } from '@codemirror/view';
import { tags } from '@lezer/highlight';

const codeEditorHighlightStyle = HighlightStyle.define([
  { tag: tags.propertyName, color: '#0f766e' },
  { tag: tags.string, color: '#1d4ed8' },
  { tag: tags.number, color: '#b45309' },
  { tag: [tags.bool, tags.null], color: '#7c3aed' },
]);

const externalChangeAnnotation = Annotation.define<boolean>();

const cn = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ');

export type CodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  rows: number;
  resizeRef?: React.MutableRefObject<HTMLElement | null>;
  spellCheck?: boolean;
  className?: string;
  lineWrapping?: boolean;
  language?: 'plain' | 'json';
  enableLanguageHighlight?: boolean;
  enableLanguageFolding?: boolean;
  readOnly?: boolean;
};

export const CodeEditor = ({
  value,
  onChange,
  rows,
  resizeRef,
  spellCheck = false,
  className,
  lineWrapping = false,
  language = 'plain',
  enableLanguageHighlight = false,
  enableLanguageFolding = false,
  readOnly = false,
}: CodeEditorProps) => {
  const shellRef = React.useRef<HTMLDivElement | null>(null);
  const editorHostRef = React.useRef<HTMLDivElement | null>(null);
  const editorViewRef = React.useRef<EditorView | null>(null);

  const setShellNode = React.useCallback((node: HTMLDivElement | null) => {
    shellRef.current = node;
    if (resizeRef) {
      resizeRef.current = node;
    }
  }, [resizeRef]);

  const extensions = React.useMemo(() => {
    const next = [
      lineNumbers(),
      EditorState.readOnly.of(readOnly),
      EditorView.editable.of(!readOnly),
      EditorView.contentAttributes.of({ spellcheck: spellCheck ? 'true' : 'false' }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && !update.transactions.some((transaction) => transaction.annotation(externalChangeAnnotation))) {
          onChange(update.state.doc.toString());
        }
      }),
    ];

    if (lineWrapping) {
      next.push(EditorView.lineWrapping);
    }

    if (language === 'json') {
      next.push(json());

      if (enableLanguageHighlight) {
        next.push(syntaxHighlighting(codeEditorHighlightStyle));
      }

      if (enableLanguageFolding) {
        next.push(foldGutter());
      }
    }

    return next;
  }, [enableLanguageFolding, enableLanguageHighlight, language, lineWrapping, onChange, readOnly, spellCheck]);

  React.useEffect(() => {
    if (!editorHostRef.current || editorViewRef.current) {
      return;
    }

    const view = new EditorView({
      state: EditorState.create({
        doc: value,
        extensions,
      }),
      parent: editorHostRef.current,
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
      editorViewRef.current = null;
    };
  }, []);

  React.useEffect(() => {
    if (!editorViewRef.current) {
      return;
    }

    editorViewRef.current.dispatch({
      effects: StateEffect.reconfigure.of(extensions),
    });
  }, [extensions]);

  React.useEffect(() => {
    const view = editorViewRef.current;
    if (!view) {
      return;
    }

    const currentValue = view.state.doc.toString();
    if (value === currentValue) {
      return;
    }

    view.dispatch({
      changes: { from: 0, to: currentValue.length, insert: value },
      annotations: externalChangeAnnotation.of(true),
    });
  }, [value]);

  return (
    <div
      ref={setShellNode}
      className={cn('ui-code-editor-shell', 'textarea-font', readOnly && 'is-readonly', className)}
      style={{ height: `${rows * 1.5}rem` }}
    >
      <div ref={editorHostRef} className="ui-code-editor" />
    </div>
  );
};

export default CodeEditor;
