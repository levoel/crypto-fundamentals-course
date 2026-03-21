/**
 * Modular Arithmetic Diagrams
 *
 * Exports:
 * - ClockDiagram: Interactive mod-N clock face visualization
 * - ModularCalculator: Calculator for modular operations
 * - ModularExponentiationSteps: Step-through of square-and-multiply algorithm
 */

import { useState, useCallback } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { DiagramTooltip } from '@primitives/Tooltip';
import { InteractiveValue } from '@primitives/InteractiveValue';
import { colors, glassStyle } from '@primitives/shared';

/* ------------------------------------------------------------------ */
/*  ClockDiagram                                                       */
/* ------------------------------------------------------------------ */

/**
 * ClockDiagram - Interactive mod-N clock face.
 * User selects N (2-24) and clicks two numbers to see their sum mod N.
 */
export function ClockDiagram() {
  const [n, setN] = useState(12);
  const [selectedA, setSelectedA] = useState<number | null>(null);
  const [selectedB, setSelectedB] = useState<number | null>(null);

  const handleClick = useCallback(
    (value: number) => {
      if (selectedA === null) {
        setSelectedA(value);
        setSelectedB(null);
      } else if (selectedB === null) {
        setSelectedB(value);
      } else {
        setSelectedA(value);
        setSelectedB(null);
      }
    },
    [selectedA, selectedB]
  );

  const result =
    selectedA !== null && selectedB !== null
      ? (selectedA + selectedB) % n
      : null;

  const cx = 140;
  const cy = 140;
  const radius = 110;

  return (
    <DiagramContainer
      title="Модулярная арифметика: часы"
      color="blue"
    >
      <InteractiveValue
        value={n}
        onChange={(v) => {
          setN(v);
          setSelectedA(null);
          setSelectedB(null);
        }}
        min={2}
        max={24}
        label="Модуль N"
      />

      <DiagramTooltip content="Модулярная арифметика: числа 'оборачиваются' после достижения модуля, как часы после 12. Операция a mod n даёт остаток от деления a на n. Нажмите на два числа, чтобы увидеть их сумму по модулю N.">
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
        <svg width={280} height={280} viewBox="0 0 280 280">
          {/* Outer circle */}
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke={colors.border}
            strokeWidth={2}
          />

          {/* Number positions */}
          {Array.from({ length: n }, (_, i) => {
            const angle = (2 * Math.PI * i) / n - Math.PI / 2;
            const x = cx + radius * Math.cos(angle);
            const y = cy + radius * Math.sin(angle);
            const innerX = cx + (radius - 30) * Math.cos(angle);
            const innerY = cy + (radius - 30) * Math.sin(angle);

            const isA = selectedA === i;
            const isB = selectedB === i;
            const isResult = result !== null && result === i;

            let fillColor = 'rgba(255,255,255,0.05)';
            if (isResult) fillColor = colors.success + '60';
            else if (isA) fillColor = colors.primary + '60';
            else if (isB) fillColor = colors.accent + '60';

            let strokeColor = colors.border;
            if (isResult) strokeColor = colors.success;
            else if (isA) strokeColor = colors.primary;
            else if (isB) strokeColor = colors.accent;

            return (
              <g
                key={i}
                onClick={() => handleClick(i)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={n <= 12 ? 18 : 14}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={1.5}
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={colors.text}
                  fontSize={n <= 12 ? 13 : 10}
                  fontFamily="monospace"
                >
                  {i}
                </text>
                {/* Tick mark toward center */}
                <line
                  x1={x}
                  y1={y}
                  x2={innerX}
                  y2={innerY}
                  stroke={colors.border}
                  strokeWidth={0.5}
                  opacity={0.3}
                />
              </g>
            );
          })}

          {/* Center label */}
          <text
            x={cx}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fill={colors.textMuted}
            fontSize={14}
            fontFamily="monospace"
          >
            mod {n}
          </text>
        </svg>
      </div>
      </DiagramTooltip>

      <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: colors.textMuted }}>
        {selectedA === null && 'Нажмите на число, чтобы выбрать a'}
        {selectedA !== null && selectedB === null && `a = ${selectedA}. Теперь выберите b`}
        {selectedA !== null && selectedB !== null && result !== null && (
          <DiagramTooltip content="Результат сложения по модулю N: сумма 'оборачивается' если превышает N. Этот принцип лежит в основе конечных полей и криптографических групп.">
          <DataBox
            label="Результат"
            value={`${selectedA} + ${selectedB} = ${selectedA + selectedB} = ${result} (mod ${n})`}
            variant="highlight"
          />
          </DiagramTooltip>
        )}
      </div>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  ModularCalculator                                                   */
/* ------------------------------------------------------------------ */

type Operation = '+' | '-' | '*' | 'pow' | 'inverse';

function modInverse(a: number, n: number): number | null {
  // Extended Euclidean algorithm
  let [old_r, r] = [a % n, n];
  let [old_s, s] = [1, 0];
  while (r !== 0) {
    const q = Math.floor(old_r / r);
    [old_r, r] = [r, old_r - q * r];
    [old_s, s] = [s, old_s - q * s];
  }
  if (old_r !== 1) return null; // no inverse
  return ((old_s % n) + n) % n;
}

function modPow(base: number, exp: number, mod: number): number {
  if (mod === 1) return 0;
  let result = 1;
  base = ((base % mod) + mod) % mod;
  while (exp > 0) {
    if (exp % 2 === 1) {
      result = (result * base) % mod;
    }
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
}

/**
 * ModularCalculator - Input a, b, n; shows a op b mod n.
 */
export function ModularCalculator() {
  const [a, setA] = useState(7);
  const [b, setB] = useState(5);
  const [n, setN] = useState(13);
  const [op, setOp] = useState<Operation>('+');

  const compute = (): { intermediate: string; result: string; error?: string } => {
    if (n <= 0) return { intermediate: '-', result: '-', error: 'n должно быть > 0' };
    switch (op) {
      case '+': {
        const raw = a + b;
        const r = ((raw % n) + n) % n;
        return { intermediate: `${raw}`, result: `${r}` };
      }
      case '-': {
        const raw = a - b;
        const r = ((raw % n) + n) % n;
        return { intermediate: `${raw}`, result: `${r}` };
      }
      case '*': {
        const raw = a * b;
        const r = ((raw % n) + n) % n;
        return { intermediate: `${raw}`, result: `${r}` };
      }
      case 'pow': {
        const r = modPow(a, b, n);
        return { intermediate: `${a}^${b}`, result: `${r}` };
      }
      case 'inverse': {
        const inv = modInverse(a, n);
        if (inv === null) {
          return { intermediate: '-', result: '-', error: `Обратного элемента ${a}^(-1) mod ${n} не существует` };
        }
        return { intermediate: `${a}^(-1)`, result: `${inv}` };
      }
    }
  };

  const { intermediate, result, error } = compute();
  const opLabels: Record<Operation, string> = {
    '+': '+',
    '-': '-',
    '*': '*',
    pow: '^',
    inverse: '^ (-1)',
  };

  const opTooltips: Record<Operation, string> = {
    '+': 'Сложение по модулю: (a + b) mod n. Результат всегда в диапазоне [0, n-1]. Основа групповых операций в криптографии.',
    '-': 'Вычитание по модулю: (a - b) mod n. Отрицательные результаты корректируются прибавлением n. Эквивалент сложения с обратным элементом.',
    '*': 'Умножение по модулю: (a * b) mod n. Коммутативно и ассоциативно. Основа RSA и протокола Диффи-Хеллмана.',
    pow: 'Возведение в степень по модулю: a^b mod n. Вычисляется за O(log b) через fast exponentiation. Основа RSA и дискретного логарифма.',
    inverse: 'Мультипликативный обратный: a^(-1) mod n. Существует только если gcd(a, n) = 1. Вычисляется расширенным алгоритмом Евклида.',
  };

  return (
    <DiagramContainer
      title="Модулярный калькулятор"
      color="purple"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <InteractiveValue value={a} onChange={setA} min={0} max={100} label="a" />
        {op !== 'inverse' && (
          <InteractiveValue value={b} onChange={setB} min={0} max={100} label="b" />
        )}
        <InteractiveValue value={n} onChange={setN} min={1} max={100} label="n (модуль)" />

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {(['+'  , '-', '*', 'pow', 'inverse'] as Operation[]).map((o) => (
            <DiagramTooltip key={o} content={opTooltips[o]}>
            <div style={{ display: 'inline-block' }}>
            <button
              onClick={() => setOp(o)}
              style={{
                ...glassStyle,
                padding: '6px 14px',
                cursor: 'pointer',
                background: op === o ? `${colors.primary}30` : 'rgba(255,255,255,0.05)',
                border: `1px solid ${op === o ? colors.primary : 'rgba(255,255,255,0.1)'}`,
                color: op === o ? colors.primary : colors.text,
                fontSize: 13,
                fontFamily: 'monospace',
              }}
            >
              {o}
            </button>
            </div>
            </DiagramTooltip>
          ))}
        </div>

        {error ? (
          <DiagramTooltip content="Ошибка вычисления: обратный элемент не существует, если gcd(a, n) != 1. Проверьте, что a и n взаимно просты.">
          <DataBox label="Ошибка" value={error} variant="default" />
          </DiagramTooltip>
        ) : (
          <DiagramTooltip content={`Результат операции ${opLabels[op]} по модулю ${n}. Все вычисления выполняются в кольце целых чисел по модулю n -- фундамент асимметричной криптографии.`}>
          <DataBox
            label="Вычисление"
            value={
              op === 'inverse'
                ? `${a}${opLabels[op]} = ${result} (mod ${n})`
                : `${a} ${opLabels[op]} ${b} = ${intermediate} = ${result} (mod ${n})`
            }
            variant="highlight"
          />
          </DiagramTooltip>
        )}
      </div>
    </DiagramContainer>
  );
}

/* ------------------------------------------------------------------ */
/*  ModularExponentiationSteps                                          */
/* ------------------------------------------------------------------ */

interface ExpStep {
  bitIndex: number;
  bit: number;
  action: string;
  value: number;
}

function computeExpSteps(base: number, exp: number, mod: number): ExpStep[] {
  if (mod === 1) return [{ bitIndex: 0, bit: 0, action: 'mod 1 = 0', value: 0 }];
  const bits = exp > 0 ? exp.toString(2).split('').map(Number) : [0];
  const steps: ExpStep[] = [];
  let result = 1;
  for (let i = 0; i < bits.length; i++) {
    result = (result * result) % mod;
    let action = `Квадрат: ${Math.floor(Math.sqrt(result))}^2 mod ${mod}`;
    if (i === 0) {
      result = 1;
      if (bits[i] === 1) {
        result = base % mod;
        action = `Начало: ${base} mod ${mod} = ${result}`;
      } else {
        action = `Начало: 1`;
      }
    } else {
      // recalculate properly
      const prev = steps[i - 1].value;
      result = (prev * prev) % mod;
      action = `Квадрат: ${prev}^2 mod ${mod} = ${result}`;
      if (bits[i] === 1) {
        result = (result * base) % mod;
        action += `, * ${base} mod ${mod} = ${result}`;
      }
    }
    steps.push({ bitIndex: i, bit: bits[i], action, value: result });
  }
  return steps;
}

/**
 * ModularExponentiationSteps - Step-through of square-and-multiply.
 */
export function ModularExponentiationSteps() {
  const [base, setBase] = useState(3);
  const [exp, setExp] = useState(13);
  const [mod, setMod] = useState(17);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = computeExpSteps(base, exp, mod);
  const bits = exp > 0 ? exp.toString(2) : '0';

  const visibleSteps = steps.slice(0, currentStep + 1);

  return (
    <DiagramContainer
      title="Быстрое модулярное возведение в степень"
      color="emerald"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <InteractiveValue value={base} onChange={(v) => { setBase(v); setCurrentStep(0); }} min={2} max={50} label="Основание" />
        <InteractiveValue value={exp} onChange={(v) => { setExp(v); setCurrentStep(0); }} min={1} max={63} label="Показатель" />
        <InteractiveValue value={mod} onChange={(v) => { setMod(v); setCurrentStep(0); }} min={2} max={100} label="Модуль" />

        {/* Binary representation */}
        <DiagramTooltip content="Square-and-multiply: алгоритм быстрого возведения в степень. Разбивает экспоненту на биты и выполняет O(log n) умножений вместо O(n). Каждый бит определяет: квадрат (всегда) + умножение (если бит = 1).">
        <div style={{ ...glassStyle, padding: 12 }}>
          <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 6 }}>
            Двоичное представление показателя {exp}:
          </div>
          <div style={{ display: 'flex', gap: 4, fontFamily: 'monospace', fontSize: 16 }}>
            {bits.split('').map((bit, i) => (
              <span
                key={i}
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  background: i <= currentStep ? `${colors.primary}30` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${i === currentStep ? colors.primary : 'rgba(255,255,255,0.1)'}`,
                  color: i <= currentStep ? colors.primary : colors.textMuted,
                }}
              >
                {bit}
              </span>
            ))}
          </div>
        </div>
        </DiagramTooltip>

        {/* Steps display */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {visibleSteps.map((step, i) => (
            <div
              key={i}
              style={{
                ...glassStyle,
                padding: '8px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: i === currentStep ? `${colors.primary}15` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${i === currentStep ? colors.primary + '40' : 'rgba(255,255,255,0.08)'}`,
              }}
            >
              <span style={{ fontSize: 12, color: colors.textMuted, fontFamily: 'monospace' }}>
                Бит {step.bitIndex}: {step.bit}
              </span>
              <span style={{ fontSize: 12, color: colors.text, fontFamily: 'monospace' }}>
                {step.action}
              </span>
              <span style={{ fontSize: 13, color: colors.primary, fontFamily: 'monospace', fontWeight: 600 }}>
                = {step.value}
              </span>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <DiagramTooltip content="Сброс: вернуться к первому биту экспоненты и начать вычисление заново.">
          <div style={{ display: 'inline-block' }}>
          <button
            onClick={() => setCurrentStep(0)}
            style={{
              ...glassStyle,
              padding: '8px 16px',
              cursor: 'pointer',
              color: colors.text,
              fontSize: 13,
            }}
          >
            Сброс
          </button>
          </div>
          </DiagramTooltip>
          <DiagramTooltip content="Назад: вернуться к предыдущему биту. Отменяет последнюю операцию квадрата/умножения.">
          <div style={{ display: 'inline-block' }}>
          <button
            onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            style={{
              ...glassStyle,
              padding: '8px 16px',
              cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
              color: currentStep === 0 ? colors.textMuted : colors.text,
              fontSize: 13,
              opacity: currentStep === 0 ? 0.5 : 1,
            }}
          >
            Назад
          </button>
          </div>
          </DiagramTooltip>
          <DiagramTooltip content="Далее: обработать следующий бит экспоненты. Выполняется квадрат текущего значения, и если бит = 1 -- дополнительное умножение на основание.">
          <div style={{ display: 'inline-block' }}>
          <button
            onClick={() => setCurrentStep((s) => Math.min(steps.length - 1, s + 1))}
            disabled={currentStep >= steps.length - 1}
            style={{
              ...glassStyle,
              padding: '8px 16px',
              cursor: currentStep >= steps.length - 1 ? 'not-allowed' : 'pointer',
              color: currentStep >= steps.length - 1 ? colors.textMuted : colors.primary,
              fontSize: 13,
              opacity: currentStep >= steps.length - 1 ? 0.5 : 1,
            }}
          >
            Далее
          </button>
          </div>
          </DiagramTooltip>
        </div>

        {/* Final result */}
        {currentStep >= steps.length - 1 && (
          <DiagramTooltip content={`Быстрое возведение в степень: ${base}^${exp} mod ${mod} вычислено за ${steps.length} шагов вместо ${exp}. Этот алгоритм используется в RSA, Диффи-Хеллмане и протоколах на эллиптических кривых.`}>
          <DataBox
            label="Финальный результат"
            value={`${base}^${exp} mod ${mod} = ${steps[steps.length - 1].value}`}
            variant="highlight"
          />
          </DiagramTooltip>
        )}
      </div>
    </DiagramContainer>
  );
}
