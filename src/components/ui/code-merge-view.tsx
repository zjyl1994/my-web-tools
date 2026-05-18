import * as React from 'react';

import { MergeView } from '@codemirror/merge';
import { Annotation, type Extension } from '@codemirror/state';
import { EditorView, lineNumbers } from '@codemirror/view';

const cn = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ');

const externalChangeAnnotation = Annotation.define<boolean>();

const createEditorExtensions = (onChange?: (value: string) => void) => {
  const extensions: Extension[] = [
    lineNumbers(),
    EditorView.lineWrapping,
    EditorView.updateListener.of((update) => {
      if (update.docChanged && !update.transactions.some((transaction) => transaction.annotation(externalChangeAnnotation))) {
        onChange?.(update.state.doc.toString());
      }
    }),
  ];

  return extensions;
};

type CodeMergeViewProps = {
  leftValue: string;
  rightValue: string;
  onLeftChange?: (value: string) => void;
  onRightChange?: (value: string) => void;
  leftTitle?: string;
  rightTitle?: string;
  rows: number;
  resizeRef?: React.MutableRefObject<HTMLElement | null>;
  className?: string;
};

export const CodeMergeView = ({
  leftValue,
  rightValue,
  onLeftChange,
  onRightChange,
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

  const leftExtensions = React.useMemo(() => createEditorExtensions(onLeftChange), [onLeftChange]);
  const rightExtensions = React.useMemo(() => createEditorExtensions(onRightChange), [onRightChange]);

  React.useEffect(() => {
    if (!mergeHostRef.current) {
      return;
    }

    mergeHostRef.current.replaceChildren();

    const mergeView = new MergeView({
      parent: mergeHostRef.current,
      a: {
        doc: leftValue,
        extensions: leftExtensions,
      },
      b: {
        doc: rightValue,
        extensions: rightExtensions,
      },
      gutter: true,
      highlightChanges: true,
    });

    mergeViewRef.current = mergeView;

    return () => {
      mergeView.destroy();
      mergeViewRef.current = null;
    };
  }, [leftExtensions, rightExtensions]);

  React.useEffect(() => {
    const mergeView = mergeViewRef.current;
    if (!mergeView) {
      return;
    }

    updateViewDoc(mergeView.a, leftValue);
    updateViewDoc(mergeView.b, rightValue);
    mergeView.reconfigure({
      gutter: true,
      highlightChanges: true,
    });
  }, [leftValue, rightValue]);

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
