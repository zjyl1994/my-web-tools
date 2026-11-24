import * as React from 'react';

import { MergeView, type Chunk } from '@codemirror/merge';
import { Annotation, type Extension, type Text } from '@codemirror/state';
import { EditorView, lineNumbers } from '@codemirror/view';

const cn = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ');

const externalChangeAnnotation = Annotation.define<boolean>();

const createEditorExtensions = (
  label: string,
  onChange: ((value: string) => void) | undefined,
  onEdit: () => void,
) => {
  const extensions: Extension[] = [
    lineNumbers(),
    EditorView.contentAttributes.of({ 'aria-label': label }),
    EditorView.lineWrapping,
    EditorView.updateListener.of((update) => {
      if (update.docChanged && !update.transactions.some((transaction) => transaction.annotation(externalChangeAnnotation))) {
        onEdit();
        onChange?.(update.state.doc.toString());
      }
    }),
  ];

  return extensions;
};

type CodeMergeViewProps = {
  documents: { leftValue: string; rightValue: string };
  onLeftChange?: (value: string) => void;
  onRightChange?: (value: string) => void;
  onDifferenceCountChange?: (count: number) => void;
  leftTitle?: string;
  rightTitle?: string;
  rows: number;
  resizeRef?: React.MutableRefObject<HTMLElement | null>;
  className?: string;
};

export const CodeMergeView = ({
  documents,
  onLeftChange,
  onRightChange,
  onDifferenceCountChange,
  leftTitle = '左侧内容',
  rightTitle = '右侧内容',
  rows,
  resizeRef,
  className,
}: CodeMergeViewProps) => {
  const shellRef = React.useRef<HTMLDivElement | null>(null);
  const mergeHostRef = React.useRef<HTMLDivElement | null>(null);
  const mergeViewRef = React.useRef<MergeView | null>(null);

  const setShellNode = React.useCallback((node: HTMLDivElement | null) => {
    shellRef.current = node;
    if (resizeRef) {
      resizeRef.current = node;
    }
  }, [resizeRef]);

  const reportDifferenceCount = React.useCallback((mergeView: MergeView) => {
    if (!onDifferenceCountChange) return;
    const left = mergeView.a.state.doc;
    const right = mergeView.b.state.doc;
    const count = mergeView.chunks.reduce((total, chunk) => total + countChunkLines(chunk, left, right), 0);
    onDifferenceCountChange(count);
  }, [onDifferenceCountChange]);

  const initialContent = React.useRef(documents);

  React.useEffect(() => {
    if (!mergeHostRef.current) {
      return;
    }

    mergeHostRef.current.replaceChildren();

    const reportEdit = () => {
      if (mergeViewRef.current) reportDifferenceCount(mergeViewRef.current);
    };
    const mergeView = new MergeView({
      parent: mergeHostRef.current,
      a: {
        doc: initialContent.current.leftValue,
        extensions: createEditorExtensions(leftTitle, onLeftChange, reportEdit),
      },
      b: {
        doc: initialContent.current.rightValue,
        extensions: createEditorExtensions(rightTitle, onRightChange, reportEdit),
      },
      gutter: true,
      highlightChanges: true,
    });

    mergeViewRef.current = mergeView;

    return () => {
      mergeView.destroy();
      mergeViewRef.current = null;
    };
  }, [leftTitle, rightTitle, onLeftChange, onRightChange, reportDifferenceCount]);

  React.useEffect(() => {
    const mergeView = mergeViewRef.current;
    if (!mergeView) {
      return;
    }

    updateViewDoc(mergeView.a, documents.leftValue);
    updateViewDoc(mergeView.b, documents.rightValue);
    reportDifferenceCount(mergeView);
  }, [documents, leftTitle, rightTitle, onLeftChange, onRightChange, reportDifferenceCount]);

  return (
    <div
      ref={setShellNode}
      className={cn('ui-code-merge-shell', className)}
      style={{ height: `${rows * 1.5}rem` }}
    >
      <div className="ui-code-merge-frame">
        <div className="ui-code-merge-header" aria-hidden="true">
          <div className="ui-code-merge-header__item">{leftTitle}</div>
          <div className="ui-code-merge-header__item">{rightTitle}</div>
        </div>
        <div className="ui-code-merge-body">
          <div ref={mergeHostRef} className="ui-code-merge-view" />
        </div>
      </div>
    </div>
  );
};

const changedLines = (doc: Text, from: number, to: number, end: number) =>
  from === to ? 0 : doc.lineAt(end).number - doc.lineAt(from).number + 1;

const countChunkLines = (chunk: Chunk, left: Text, right: Text) => {
  const leftLines = changedLines(left, chunk.fromA, chunk.toA, chunk.endA);
  const rightLines = changedLines(right, chunk.fromB, chunk.toB, chunk.endB);
  const [change] = chunk.changes;
  if (leftLines && rightLines && chunk.changes.length === 1) {
    const leftStart = chunk.fromA + change.fromA;
    const rightStart = chunk.fromB + change.fromB;
    // A line appended at EOF can include the preceding unchanged line in the chunk.
    const appended = change.fromA === change.toA && leftStart === left.length
      && right.sliceString(rightStart, rightStart + 1) === '\n';
    const removed = change.fromB === change.toB && rightStart === right.length
      && left.sliceString(leftStart, leftStart + 1) === '\n';
    if (appended || removed) return Math.max(1, Math.max(leftLines, rightLines) - 1);
  }
  return Math.max(leftLines, rightLines);
};

const updateViewDoc = (view: EditorView, nextValue: string) => {
  const currentValue = view.state.doc.toString();
  if (currentValue === nextValue) {
    return;
  }

  view.dispatch({
    changes: { from: 0, to: currentValue.length, insert: nextValue },
    annotations: externalChangeAnnotation.of(true),
  });
};

export default CodeMergeView;
