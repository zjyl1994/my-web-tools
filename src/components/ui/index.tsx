import * as React from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Menu } from '@base-ui/react/menu';

const cn = (...values: Array<string | false | null | undefined>) => values.filter(Boolean).join(' ');

type ButtonVariant = 'light' | 'danger';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = 'button', variant = 'light', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn('ui-button', variant === 'danger' && 'ui-button--danger', className)}
      {...props}
    />
  ),
);

Button.displayName = 'Button';

export const ButtonGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('ui-button-group', className)} {...props} />,
);

ButtonGroup.displayName = 'ButtonGroup';

export const ButtonToolbar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('ui-button-toolbar', className)} {...props} />,
);

ButtonToolbar.displayName = 'ButtonToolbar';

export const Container = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('ui-container', className)} {...props} />,
);

Container.displayName = 'Container';

const CardRoot = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => <section ref={ref} className={cn('ui-card', className)} {...props} />,
);

CardRoot.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('ui-card__header', className)} {...props} />,
);

CardHeader.displayName = 'Card.Header';

const CardBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('ui-card__body', className)} {...props} />,
);

CardBody.displayName = 'Card.Body';

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h2 ref={ref} className={cn('ui-card__title', className)} {...props} />,
);

CardTitle.displayName = 'Card.Title';

const CardText = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('ui-card__text', className)} {...props} />,
);

CardText.displayName = 'Card.Text';

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
  Title: CardTitle,
  Text: CardText,
});

const FormGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('ui-form-group', className)} {...props} />,
);

FormGroup.displayName = 'Form.Group';

const FormLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => <label ref={ref} className={cn('ui-label', className)} {...props} />,
);

FormLabel.displayName = 'Form.Label';

type InputControlProps = React.InputHTMLAttributes<HTMLInputElement> & {
  as?: undefined;
};

type TextareaControlProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  as: 'textarea';
};

type FormControlComponent = {
  (props: InputControlProps & { ref?: React.Ref<HTMLInputElement> }): React.ReactElement | null;
  (props: TextareaControlProps & { ref?: React.Ref<HTMLTextAreaElement> }): React.ReactElement | null;
  displayName?: string;
};

const FormControl = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputControlProps | TextareaControlProps>(
  ({ as, className, ...props }, ref) => {
    if (as === 'textarea') {
      return (
        <textarea
          ref={ref as React.Ref<HTMLTextAreaElement>}
          className={cn('ui-control', className)}
          {...(props as TextareaControlProps)}
        />
      );
    }

    return (
      <input
        ref={ref as React.Ref<HTMLInputElement>}
        className={cn('ui-control', className)}
        {...(props as InputControlProps)}
      />
    );
  },
) as FormControlComponent;

FormControl.displayName = 'Form.Control';

export const Form = {
  Group: FormGroup,
  Label: FormLabel,
  Control: FormControl,
};

const InputGroupRoot = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('ui-input-group', className)} {...props} />,
);

InputGroupRoot.displayName = 'InputGroup';

const InputGroupText = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => <span ref={ref} className={cn('ui-input-group__text', className)} {...props} />,
);

InputGroupText.displayName = 'InputGroup.Text';

export const InputGroup = Object.assign(InputGroupRoot, {
  Text: InputGroupText,
});

type TableProps = React.TableHTMLAttributes<HTMLTableElement> & {
  wrapperClassName?: string;
};

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, wrapperClassName, ...props }, ref) => (
    <div className={cn('ui-table-wrap', wrapperClassName)}>
      <table ref={ref} className={cn('ui-table', className)} {...props} />
    </div>
  ),
);

Table.displayName = 'Table';

type ListGroupRootProps = React.HTMLAttributes<HTMLUListElement> & {
  variant?: string;
};

const ListGroupRoot = React.forwardRef<HTMLUListElement, ListGroupRootProps>(
  ({ className, variant: _variant, ...props }, ref) => <ul ref={ref} className={cn('ui-list-group', className)} {...props} />,
);

ListGroupRoot.displayName = 'ListGroup';

const ListGroupItem = React.forwardRef<HTMLLIElement, React.LiHTMLAttributes<HTMLLIElement>>(
  ({ className, ...props }, ref) => <li ref={ref} className={cn('ui-list-group__item', className)} {...props} />,
);

ListGroupItem.displayName = 'ListGroup.Item';

export const ListGroup = Object.assign(ListGroupRoot, {
  Item: ListGroupItem,
});

const DropdownRoot = ({ children }: { children?: React.ReactNode }) => <Menu.Root modal={false}>{children}</Menu.Root>;

const DropdownToggle = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, type = 'button', variant = 'light', ...props }, ref) => (
    <Menu.Trigger
      ref={ref}
      type={type}
      className={cn('ui-button', variant === 'danger' && 'ui-button--danger', className)}
      {...props}
    />
  ),
);

DropdownToggle.displayName = 'Dropdown.Toggle';

const DropdownMenu = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <Menu.Portal>
      <Menu.Positioner align="start" sideOffset={8}>
        <Menu.Popup ref={ref} className={cn('ui-dropdown-menu', className)} {...props} />
      </Menu.Positioner>
    </Menu.Portal>
  ),
);

DropdownMenu.displayName = 'Dropdown.Menu';

type DropdownItemProps = React.HTMLAttributes<HTMLElement> & {
  disabled?: boolean;
};

const DropdownItem = React.forwardRef<HTMLElement, DropdownItemProps>(
  ({ className, ...props }, ref) => <Menu.Item ref={ref} className={cn('ui-dropdown-item', className)} {...props} />,
);

DropdownItem.displayName = 'Dropdown.Item';

export const Dropdown = Object.assign(DropdownRoot, {
  Toggle: DropdownToggle,
  Menu: DropdownMenu,
  Item: DropdownItem,
});

type ModalProps = {
  show: boolean;
  onHide: () => void;
  centered?: boolean;
  fullscreen?: boolean;
  children?: React.ReactNode;
};

const ModalRoot = ({ show, onHide, fullscreen, children }: ModalProps) => (
  <Dialog.Root
    open={show}
    onOpenChange={(open) => {
      if (!open) {
        onHide();
      }
    }}
  >
    <Dialog.Portal>
      <div className="ui-dialog-layer">
        <Dialog.Backdrop className="ui-dialog-backdrop" />
        <Dialog.Popup className={cn('ui-dialog-popup', fullscreen && 'ui-dialog-popup--fullscreen')}>
          {children}
        </Dialog.Popup>
      </div>
    </Dialog.Portal>
  </Dialog.Root>
);

const ModalHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { closeButton?: boolean }
>(({ className, closeButton, children, ...props }, ref) => (
  <div ref={ref} className={cn('ui-dialog__header', className)} {...props}>
    <div className="ui-dialog__header-content">{children}</div>
    {closeButton ? (
      <Dialog.Close className="ui-close-button" aria-label="关闭">
        <span aria-hidden="true">×</span>
      </Dialog.Close>
    ) : null}
  </div>
));

ModalHeader.displayName = 'Modal.Header';

const ModalTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <Dialog.Title ref={ref} className={cn('ui-dialog__title', className)} {...props} />,
);

ModalTitle.displayName = 'Modal.Title';

const ModalBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('ui-dialog__body', className)} {...props} />,
);

ModalBody.displayName = 'Modal.Body';

export const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Title: ModalTitle,
  Body: ModalBody,
});
