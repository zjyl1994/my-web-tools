import { useRef } from 'react';
import { Button, Modal } from '@/components/ui';

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({ open, title, message, confirmLabel = '删除', onConfirm, onCancel }: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Modal show={open} onHide={onCancel} initialFocus={cancelRef}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p className="ui-dialog__message">{message}</p>
        <div className="ui-dialog__actions">
          <Button ref={cancelRef} onClick={onCancel}>取消</Button>
          <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
