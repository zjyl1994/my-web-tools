import { Button } from '@/components/ui';
import { useCopy } from '@/hooks/use-basic';

type CopyButtonProps = {
  text: string;
  label?: string;
  copiedLabel?: string;
  ariaLabel?: string;
  className?: string;
  variant?: 'light' | 'primary' | 'danger';
  disabled?: boolean;
};

export default function CopyButton({
  text,
  label = '复制',
  copiedLabel = '已复制',
  ariaLabel,
  className,
  variant,
  disabled,
}: CopyButtonProps) {
  const { copy, copied } = useCopy(text);
  const name = ariaLabel ? (copied ? `${ariaLabel}，已复制` : ariaLabel) : undefined;

  return (
    <>
      <Button className={className} variant={variant} disabled={disabled} onClick={copy} aria-label={name}>
        {copied ? copiedLabel : label}
      </Button>
      <span className="app-visually-hidden" role="status">{copied ? `${label}成功，已复制到剪贴板` : ''}</span>
    </>
  );
}
