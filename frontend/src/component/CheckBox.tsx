import React, { useMemo, useState } from 'react';
import {
  IOCheckboxOutline,
  IOSquareOutline,
  ISize,
  cnx,
} from '@grandlinex/react-components';

export default function CheckBox(props: {
  checked: boolean;
  value?: boolean;
  large?: boolean;
  disabled?: boolean;
  onChange: (ev: boolean) => void;
  className?: string;
}) {
  const { onChange, checked, className, large, value, disabled } = props;
  const [ck, setChecked] = useState(checked);
  const v = useMemo(() => {
    if (value !== undefined) {
      return value;
    }
    return ck;
  }, [ck, value]);
  return (
    <span
      role="button"
      className={cnx(className)}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      onClick={() => {
        if (!disabled) {
          onChange(!v);
          setChecked(!v);
        }
      }}
    >
      {v ? (
        <IOCheckboxOutline size={large ? ISize.MD : ISize.SM} />
      ) : (
        <IOSquareOutline size={large ? ISize.MD : ISize.SM} />
      )}
    </span>
  );
}
CheckBox.defaultProps = {
  className: undefined,
  large: false,
  disabled: false,
  value: undefined,
};
