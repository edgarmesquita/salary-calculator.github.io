import * as React from 'react';
import { NumericFormat, InputAttributes } from 'react-number-format';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}
const CurrencyFormat = React.forwardRef<typeof NumericFormat<InputAttributes>, CustomProps>(function NumberFormatCustom(props, ref) {
  const { onChange, ...other } = props;

  return (
    <NumericFormat
      {...other}
      getInputRef={ref}
      onValueChange={(values) => {
        onChange({
          target: {
            name: props.name,
            value: values.value,
          },
        });
      }}
      decimalScale={2}
      decimalSeparator=","
      thousandSeparator="."
      suffix=" €"
      valueIsNumericString 
    />
  );
});

export default CurrencyFormat;