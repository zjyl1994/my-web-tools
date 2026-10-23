import ControlGroup from '@/components/ui/control-group';
import { useState } from 'react';
import { Form } from '@/components/ui';
import { numericInput } from '@/utils/numeric-input';

export default function KcalPage() {
  const [partEnergy, setPartEnergy] = useState('0');
  const [partWeight, setPartWeight] = useState('100');
  const [totalWeight, setTotalWeight] = useState('100');
  const energy = numericInput(partEnergy, '每份能量');
  const portion = numericInput(partWeight, '每份重量', { positive: true });
  const weight = numericInput(totalWeight, '总重量');
  const raw = energy.value !== null && portion.value !== null && weight.value !== null
    ? weight.value / portion.value * energy.value * 0.239006 : null;
  const totalEnergy = raw !== null && Number.isFinite(raw) ? Math.round(raw) : null;
  const fields = [
    { id: 'kcal-energy', label: '每份能量', unit: '千焦', value: partEnergy, setValue: setPartEnergy, error: energy.error },
    { id: 'kcal-portion', label: '每份重量', unit: 'g', value: partWeight, setValue: setPartWeight, error: portion.error },
    { id: 'kcal-weight', label: '总重量', unit: 'g', value: totalWeight, setValue: setTotalWeight, error: weight.error },
  ];

  return (
    <div className="calculator-grid">
      {fields.map((field) => <Form.Group key={field.id}>
        <Form.Label htmlFor={field.id}>{field.label}</Form.Label>
        <ControlGroup suffix={field.unit} suffixId={`${field.id}-unit`}>
          <Form.Control id={field.id} type="number" min="0" step="any" value={field.value} onChange={(event) => field.setValue(event.target.value)} aria-invalid={Boolean(field.error)} aria-describedby={`${field.id}-unit${field.error ? ` ${field.id}-error` : ''}`} />
        </ControlGroup>
        {field.error && <p id={`${field.id}-error`} className="ui-field-error" aria-live="polite">{field.error}</p>}
      </Form.Group>)}
      <Form.Group>
        <Form.Label htmlFor="kcal-result">总能量</Form.Label>
        <ControlGroup suffix="大卡" suffixId="kcal-result-unit">
          <Form.Control id="kcal-result" className="ui-result-field ui-result-field--single" value={totalEnergy === null ? '' : String(totalEnergy)} placeholder="等待有效输入" readOnly aria-describedby={`kcal-result-unit${raw !== null && totalEnergy === null ? ' kcal-overflow' : ''}`} />
        </ControlGroup>
        {raw !== null && totalEnergy === null && <p id="kcal-overflow" className="ui-field-error" role="alert">数值超出可计算范围，请减小输入值。</p>}
      </Form.Group>
    </div>
  );
}
