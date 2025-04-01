import type React from 'react';
import { Button } from './Button';

export interface ModalProps extends React.ComponentProps<'div'> {
  header?: string;
  long?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const Modal = ({ children, header, long, onSuccess, onCancel, ...props }: ModalProps) => {
  return (
    <div
      block fixed
      top-0 left-0
      overflow-auto
      z-100
      line-height='1.5'
      {...props}
    >
      {/* background of the modal */}
      <div absolute top-0 left-0 bg='#0000004d' />
      {/* main containers of the modal */}
      <div
        absolute
        overflow-y-auto
        max-w-full w='700px'
        max-h='90vh'
        p-5
        mb-5
        rounded-1
        bg-white
        text-black
        shadow='sm #1a1a1a1a'
        style={{
          // I don't know why but TS won't let me do this using UnoCSS
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          ...long ? { height: '600px' } : {},
        }}
      >
        <div flex='~ col [&>*]:[0_0_auto]' h-full items-stretch>
          <h3 className='lfe-h3'>{header}</h3>
          <div mt-2 flex-auto overflow-y-auto p='[&_select]:[.3rem_.6rem]'>{children}</div>
          <div>
            <Button float-right theme='primary' onClick={() => { onSuccess?.(); }}>
              确认
            </Button>
            {onCancel && <Button float-right onClick={() => { onCancel(); }}>取消</Button>}
          </div>
        </div>
      </div>
    </div>
  );
};
