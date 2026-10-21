import { toast } from 'react-toastify';

export function showUndoToast(message: string, onUndo: () => void) {
  toast.info(({ closeToast }) => (
    <div className="undo-toast">
      <span>{message}</span>
      <button type="button" className="undo-toast__action" onClick={() => { onUndo(); closeToast?.(); }}>
        撤销
      </button>
    </div>
  ), { autoClose: 6000 });
}
