import clsx from 'clsx';
import { Button } from './Button';

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: string;
  long?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const Modal = ({ className, children, header, long, onSuccess, onCancel, ...props }: ModalProps) => {
  return (
    <div className={clsx('pa-modal', 'pa-fadein', long && 'long', className)} {...props}>
      <div className='pa-modal-background' />
      <div className='pa-modal-outer-container'>
        <div className='pa-modal-inner-container'>
          <h3 className='pa-modal-header lfe-h3'>{header}</h3>
          <div className='pa-modal-main'>{children}</div>
          <div className='pa-modal-actions'>
            <Button theme='primary' onClick={() => onSuccess?.()}>
              确认
            </Button>
            {onCancel && <Button onClick={() => onCancel()}>取消</Button>}
          </div>
        </div>
      </div>
    </div>
  );
};
