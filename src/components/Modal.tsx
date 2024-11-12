import clsx from 'clsx';
import { forwardRef } from 'react';
import { LegacyButton } from './LegacyButton';

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: string;
  long?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className, children, header, long, onSuccess, onCancel, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('pa-modal', 'pa-fadein', long && 'long', className)}
        {...props}
      >
        <div className='pa-modal-background' />
        <div className='pa-modal-outer-container'>
          <div className='pa-modal-inner-container'>
            <h3 className='pa-modal-header lfe-h3'>{header}</h3>
            <div className='pa-modal-main'>{children}</div>
            <div className='pa-modal-actions'>
              <LegacyButton theme='primary' onClick={() => onSuccess?.()}>
                确认
              </LegacyButton>
              {onCancel && <LegacyButton onClick={() => onCancel()}>取消</LegacyButton>}
            </div>
          </div>
        </div>
      </div>
    );
  }
);
