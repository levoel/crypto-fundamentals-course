/**
 * Reentrancy Diagrams (SEC-02)
 *
 * Exports:
 * - SingleReentrancyDiagram: 6-step step-through showing single-function reentrancy on VulnerableVault
 * - CrossFunctionReentrancyDiagram: 5-step step-through showing cross-function attack via withdraw() + transfer()
 * - ReadOnlyReentrancyDiagram: 5-step step-through showing read-only reentrancy via view function
 */

import { useState } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DataBox } from '@primitives/DataBox';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  Shared step-through navigation component                           */
/* ================================================================== */

interface StepValue {
  label: string;
  value: string;
  color: string;
}

interface ReentrancyStep {
  title: string;
  description: string;
  values: StepValue[];
  callStack: string[];
}

function StepNavigation({
  steps,
  stepIndex,
  setStepIndex,
  accentColor,
}: {
  steps: ReentrancyStep[];
  stepIndex: number;
  setStepIndex: (fn: (s: number) => number) => void;
  accentColor: string;
}) {
  const step = steps[stepIndex];

  return (
    <>
      {/* Step progress bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16 }}>
        {steps.map((_, i) => (
          <div
            key={i}
            onClick={() => setStepIndex(() => i)}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              cursor: 'pointer',
              background: i <= stepIndex ? accentColor : 'rgba(255,255,255,0.1)',
              transition: 'all 0.2s',
            }}
          />
        ))}
      </div>

      {/* Step title */}
      <div style={{
        fontSize: 14,
        fontWeight: 600,
        color: colors.text,
        marginBottom: 8,
        fontFamily: 'monospace',
      }}>
        {step.title}
      </div>

      {/* Description */}
      <div style={{
        fontSize: 13,
        color: colors.text,
        lineHeight: 1.6,
        marginBottom: 14,
      }}>
        {step.description}
      </div>

      {/* Values grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        marginBottom: 12,
      }}>
        {step.values.map((v, i) => (
          <div key={i} style={{ ...glassStyle, padding: 10 }}>
            <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 4 }}>
              {v.label}
            </div>
            <div style={{ fontSize: 13, color: v.color, fontFamily: 'monospace', fontWeight: 600 }}>
              {v.value}
            </div>
          </div>
        ))}
      </div>

      {/* Call stack visualization */}
      {step.callStack.length > 0 && (
        <div style={{ ...glassStyle, padding: 12, marginBottom: 14 }}>
          <div style={{ fontSize: 10, color: colors.textMuted, fontFamily: 'monospace', marginBottom: 6 }}>
            Call Stack (depth: {step.callStack.length})
          </div>
          {step.callStack.map((frame, i) => (
            <div key={i} style={{
              fontSize: 11,
              fontFamily: 'monospace',
              color: i === step.callStack.length - 1 ? accentColor : colors.text,
              paddingLeft: i * 12,
              marginBottom: 2,
            }}>
              {i > 0 ? '-> ' : ''}{frame}
            </div>
          ))}
        </div>
      )}

      {/* Navigation buttons */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          onClick={() => setStepIndex(() => 0)}
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
        <button
          onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
          disabled={stepIndex === 0}
          style={{
            ...glassStyle,
            padding: '8px 20px',
            cursor: stepIndex === 0 ? 'not-allowed' : 'pointer',
            color: stepIndex === 0 ? colors.textMuted : colors.text,
            fontSize: 13,
            opacity: stepIndex === 0 ? 0.5 : 1,
          }}
        >
          Назад
        </button>
        <button
          onClick={() => setStepIndex((s) => Math.min(steps.length - 1, s + 1))}
          disabled={stepIndex >= steps.length - 1}
          style={{
            ...glassStyle,
            padding: '8px 20px',
            cursor: stepIndex >= steps.length - 1 ? 'not-allowed' : 'pointer',
            color: stepIndex >= steps.length - 1 ? colors.textMuted : accentColor,
            fontSize: 13,
            opacity: stepIndex >= steps.length - 1 ? 0.5 : 1,
          }}
        >
          Далее
        </button>
      </div>
    </>
  );
}

/* ================================================================== */
/*  SingleReentrancyDiagram                                              */
/* ================================================================== */

const SINGLE_REENTRANCY_HISTORY: ReentrancyStep[] = [
  {
    title: 'Начальное состояние',
    description: 'VulnerableVault содержит 10 ETH от различных пользователей. Атакующий (Attacker) имеет 1 ETH депозит в контракте. У контракта-эксплойта есть fallback-функция, вызывающая withdraw().',
    values: [
      { label: 'Vault баланс', value: '10 ETH', color: colors.primary },
      { label: 'Attacker.balances', value: '1 ETH', color: colors.accent },
      { label: 'Attacker контракт ETH', value: '0 ETH', color: colors.textMuted },
      { label: 'Vault.balances[attacker]', value: '1 ETH (mapping)', color: colors.success },
    ],
    callStack: [],
  },
  {
    title: 'Шаг 1: Attacker вызывает withdraw()',
    description: 'Атакующий контракт вызывает vault.withdraw(). Vault проверяет require(balances[msg.sender] >= amount) -- проходит (1 >= 1). Vault выполняет msg.sender.call{value: 1 ether}("") -- ПЕРЕД обновлением состояния.',
    values: [
      { label: 'Проверка', value: 'require(1 >= 1) PASS', color: colors.success },
      { label: 'Действие', value: 'call{value: 1 ETH}', color: '#f43f5e' },
      { label: 'balances[attacker]', value: '1 ETH (НЕ обновлен!)', color: '#f43f5e' },
      { label: 'Паттерн CEI', value: 'НАРУШЕН: Effect ПОСЛЕ Interaction', color: '#f43f5e' },
    ],
    callStack: ['Attacker.attack()', 'Vault.withdraw()'],
  },
  {
    title: 'Шаг 2: Fallback -> повторный withdraw()',
    description: 'ETH поступает в контракт атакующего. Срабатывает receive()/fallback(), который снова вызывает vault.withdraw(). Баланс в mapping ВСЕ ЕЩЕ 1 ETH -- проверка снова проходит!',
    values: [
      { label: 'Проверка', value: 'require(1 >= 1) PASS снова!', color: '#f43f5e' },
      { label: 'Vault реальный баланс', value: '8 ETH (уже отправил 2)', color: '#f43f5e' },
      { label: 'balances[attacker]', value: '1 ETH (все еще!)', color: '#f43f5e' },
      { label: 'Call stack depth', value: '3', color: colors.accent },
    ],
    callStack: ['Attacker.attack()', 'Vault.withdraw()', 'Attacker.receive()', 'Vault.withdraw()'],
  },
  {
    title: 'Шаг 3: Повторные вызовы (drain)',
    description: 'Цикл повторяется: каждый receive() вызывает withdraw(), и каждый раз проверка проходит, потому что balances[attacker] никогда не обновлялся. Vault теряет ETH на каждом витке.',
    values: [
      { label: 'Итерация', value: '...повторяется до gas limit', color: '#f43f5e' },
      { label: 'Vault реальный баланс', value: 'уменьшается на 1 ETH за виток', color: '#f43f5e' },
      { label: 'balances[attacker]', value: '1 ETH (НЕИЗМЕНЕН!)', color: '#f43f5e' },
      { label: 'Ключевая проблема', value: 'State update ПОСЛЕ call', color: '#f43f5e' },
    ],
    callStack: ['Attacker.attack()', 'Vault.withdraw()', 'Attacker.receive()', 'Vault.withdraw()', 'Attacker.receive()', 'Vault.withdraw()'],
  },
  {
    title: 'Шаг 4: Gas limit / Vault пуст',
    description: 'Рекурсия останавливается когда: (а) Vault пуст (call возвращает false), или (б) gas закончился. Call stack разматывается. Только ТЕПЕРЬ выполняется balances[msg.sender] = 0.',
    values: [
      { label: 'Vault баланс', value: '0 ETH (полностью drained)', color: '#f43f5e' },
      { label: 'Attacker получил', value: '10 ETH', color: colors.success },
      { label: 'balances[attacker]', value: '0 (обновлен слишком поздно)', color: colors.textMuted },
      { label: 'Другие пользователи', value: 'Потеряли все средства', color: '#f43f5e' },
    ],
    callStack: ['Stack unwinding...'],
  },
  {
    title: 'Итог: CEI pattern предотвращает атаку',
    description: 'Если бы Vault следовал паттерну Check-Effects-Interactions (CEI): сначала обновить balances[msg.sender] = 0, ЗАТЕМ отправить ETH -- повторный вызов withdraw() провалится на require(), потому что баланс уже 0.',
    values: [
      { label: 'CEI: Check', value: 'require(balances >= amount)', color: colors.success },
      { label: 'CEI: Effect', value: 'balances[sender] -= amount', color: colors.success },
      { label: 'CEI: Interaction', value: 'sender.call{value}("")', color: colors.success },
      { label: 'Дополнительно', value: 'ReentrancyGuard (OZ)', color: colors.primary },
    ],
    callStack: [],
  },
];

/**
 * SingleReentrancyDiagram
 *
 * 6-step step-through showing classic single-function reentrancy
 * attack on VulnerableVault with call stack depth visualization.
 */
export function SingleReentrancyDiagram() {
  const [stepIndex, setStepIndex] = useState(0);

  return (
    <DiagramContainer title="Single-function Reentrancy: атака на VulnerableVault" color="rose">
      <StepNavigation
        steps={SINGLE_REENTRANCY_HISTORY}
        stepIndex={stepIndex}
        setStepIndex={setStepIndex}
        accentColor="#f43f5e"
      />
      {stepIndex >= SINGLE_REENTRANCY_HISTORY.length - 1 && (
        <div style={{ marginTop: 12 }}>
          <DataBox
            label="Защита"
            value="1) CEI pattern: обновляй состояние ДО внешнего вызова. 2) ReentrancyGuard: mutex-блокировка. 3) ReentrancyGuardTransient (EIP-1153): ~200 gas vs ~7100."
            variant="highlight"
          />
        </div>
      )}
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  CrossFunctionReentrancyDiagram                                       */
/* ================================================================== */

const CROSS_FUNCTION_HISTORY: ReentrancyStep[] = [
  {
    title: 'Начальное состояние',
    description: 'Контракт имеет withdraw() и transfer(). Обе функции используют один mapping balances. Атакующий A имеет 1 ETH в контракте и сообщника B.',
    values: [
      { label: 'Vault баланс', value: '10 ETH', color: colors.primary },
      { label: 'balances[A]', value: '1 ETH', color: colors.accent },
      { label: 'balances[B]', value: '0 ETH', color: colors.textMuted },
      { label: 'Уязвимость', value: 'Общий state между функциями', color: '#f43f5e' },
    ],
    callStack: [],
  },
  {
    title: 'Шаг 1: A вызывает withdraw()',
    description: 'A вызывает withdraw(1 ether). Проверка проходит (1 >= 1). Vault отправляет 1 ETH на A через call{}. Баланс A в mapping НЕ обновлен (Interaction перед Effect).',
    values: [
      { label: 'Действие', value: 'vault.withdraw(1 ether)', color: colors.accent },
      { label: 'Проверка', value: 'require(1 >= 1) PASS', color: colors.success },
      { label: 'ETH отправлен', value: '1 ETH -> A', color: '#f43f5e' },
      { label: 'balances[A]', value: '1 ETH (НЕ обновлен)', color: '#f43f5e' },
    ],
    callStack: ['A.attack()', 'Vault.withdraw()'],
  },
  {
    title: 'Шаг 2: Fallback -> transfer() вместо withdraw()',
    description: 'В receive() атакующий вызывает НЕ withdraw(), а transfer(B, 1 ether). Поскольку balances[A] все еще 1 ETH, проверка в transfer() проходит. Баланс B становится 1 ETH.',
    values: [
      { label: 'Действие', value: 'vault.transfer(B, 1 ether)', color: '#f43f5e' },
      { label: 'balances[A]', value: '1 -> 0 (обновлен в transfer)', color: colors.accent },
      { label: 'balances[B]', value: '0 -> 1 ETH', color: '#f43f5e' },
      { label: 'Проблема', value: 'A уже получил 1 ETH + перевел 1 ETH на B', color: '#f43f5e' },
    ],
    callStack: ['A.attack()', 'Vault.withdraw()', 'A.receive()', 'Vault.transfer()'],
  },
  {
    title: 'Шаг 3: B выводит средства',
    description: 'B вызывает vault.withdraw(1 ether). Баланс B = 1 ETH в mapping -- проверка проходит. B получает 1 ETH. В итоге атакующие получили 2 ETH при депозите 1 ETH.',
    values: [
      { label: 'B вызывает', value: 'vault.withdraw(1 ether)', color: colors.accent },
      { label: 'A получил', value: '1 ETH (из withdraw)', color: '#f43f5e' },
      { label: 'B получил', value: '1 ETH (из transfer + withdraw)', color: '#f43f5e' },
      { label: 'Итого потери Vault', value: '1 ETH дополнительно', color: '#f43f5e' },
    ],
    callStack: ['B.withdraw()'],
  },
  {
    title: 'Защита: ReentrancyGuard на ОБЕ функции',
    description: 'CEI pattern в withdraw() НЕ защищает от cross-function reentrancy, если transfer() не следует тому же паттерну. Решение: ReentrancyGuard (nonReentrant modifier) на ВСЕ функции, изменяющие состояние.',
    values: [
      { label: 'CEI', value: 'Недостаточно для cross-function', color: '#f43f5e' },
      { label: 'ReentrancyGuard', value: 'nonReentrant на withdraw() И transfer()', color: colors.success },
      { label: 'Mutex-блокировка', value: 'Общий lock для всех функций', color: colors.success },
      { label: 'Transient Storage', value: 'EIP-1153: дешевле (~200 vs ~7100 gas)', color: colors.primary },
    ],
    callStack: [],
  },
];

/**
 * CrossFunctionReentrancyDiagram
 *
 * 5-step step-through showing cross-function reentrancy
 * using withdraw() + transfer() to double-spend.
 */
export function CrossFunctionReentrancyDiagram() {
  const [stepIndex, setStepIndex] = useState(0);

  return (
    <DiagramContainer title="Cross-function Reentrancy: withdraw() + transfer()" color="amber">
      <StepNavigation
        steps={CROSS_FUNCTION_HISTORY}
        stepIndex={stepIndex}
        setStepIndex={setStepIndex}
        accentColor="#f59e0b"
      />
      {stepIndex >= CROSS_FUNCTION_HISTORY.length - 1 && (
        <div style={{ marginTop: 12 }}>
          <DataBox
            label="Ключевой вывод"
            value="Cross-function reentrancy использует общий state между разными функциями. CEI в одной функции недостаточно -- нужен ReentrancyGuard на всех функциях, работающих с общим state."
            variant="highlight"
          />
        </div>
      )}
    </DiagramContainer>
  );
}

/* ================================================================== */
/*  ReadOnlyReentrancyDiagram                                            */
/* ================================================================== */

const READ_ONLY_HISTORY: ReentrancyStep[] = [
  {
    title: 'Начальное состояние',
    description: 'Pool содержит ликвидность. Lending Protocol использует pool.getPrice() (view-функцию) для определения цены залога. Атакующий имеет позицию в Lending Protocol.',
    values: [
      { label: 'Pool ликвидность', value: '1000 ETH + 2M USDC', color: colors.primary },
      { label: 'pool.getPrice()', value: '$2000 / ETH', color: colors.accent },
      { label: 'Lending позиция', value: '10 ETH залог, 15000 USDC долг', color: colors.success },
      { label: 'Health Factor', value: '1.33 (здоровая)', color: colors.success },
    ],
    callStack: [],
  },
  {
    title: 'Шаг 1: Атакующий вызывает pool.withdraw()',
    description: 'Атакующий вызывает withdraw() в Pool. Pool начинает отправку ETH атакующему через call{}. Внутреннее состояние Pool ВРЕМЕННО неконсистентно: ETH ушли, но LP shares не сожжены.',
    values: [
      { label: 'Pool ETH', value: '990 ETH (10 отправляются)', color: '#f43f5e' },
      { label: 'Pool LP supply', value: 'НЕ обновлен (shares не сожжены)', color: '#f43f5e' },
      { label: 'pool.getPrice()', value: 'Неконсистентная цена!', color: '#f43f5e' },
      { label: 'Reentrancy', value: 'view-функция читает stale state', color: '#f43f5e' },
    ],
    callStack: ['Attacker.attack()', 'Pool.withdraw()', '-> ETH transfer'],
  },
  {
    title: 'Шаг 2: Fallback -> borrow() в Lending Protocol',
    description: 'В receive() атакующий вызывает Lending Protocol. Protocol вызывает pool.getPrice() -- view-функция возвращает ЗАВЫШЕННУЮ цену (ETH ушли из пула, но LP supply не уменьшен). Залог атакующего "стоит" больше.',
    values: [
      { label: 'pool.getPrice()', value: '$2020 (завышена, stale LP)', color: '#f43f5e' },
      { label: 'Залог (fake)', value: '10 ETH * $2020 = $20,200', color: '#f43f5e' },
      { label: 'Доступно для займа', value: 'Больше, чем должно быть', color: '#f43f5e' },
      { label: 'Тип reentrancy', value: 'Read-only (view function)', color: colors.accent },
    ],
    callStack: ['Attacker.attack()', 'Pool.withdraw()', 'Attacker.receive()', 'Lending.borrow()'],
  },
  {
    title: 'Шаг 3: Избыточный займ',
    description: 'Lending Protocol разрешает займ на основе завышенной оценки залога. Атакующий получает больше USDC, чем его залог реально стоит. После размотки call stack, Pool обновляет LP supply -- но займ уже выдан.',
    values: [
      { label: 'Займ', value: '16,100 USDC (вместо max 15,000)', color: '#f43f5e' },
      { label: 'Реальная стоимость залога', value: '$20,000', color: colors.accent },
      { label: 'Избыточный займ', value: '+$1,100 (bad debt)', color: '#f43f5e' },
      { label: 'Pool после unwind', value: 'Цена нормализуется', color: colors.success },
    ],
    callStack: ['Stack unwinding...'],
  },
  {
    title: 'Защита от read-only reentrancy',
    description: 'View-функции не изменяют состояние, поэтому nonReentrant modifier на них не работает. Решения: 1) Reentrancy lock check в view-функциях, 2) TWAP оракулы вместо spot price, 3) Atomic state updates в Pool.',
    values: [
      { label: 'Lock check', value: 'require(!_locked) в view()', color: colors.success },
      { label: 'TWAP', value: 'Средневзвешенная цена за период', color: colors.success },
      { label: 'OZ v5', value: 'ReentrancyGuardTransient (EIP-1153)', color: colors.primary },
      { label: 'Atomic updates', value: 'Обновлять LP supply ДО call', color: colors.success },
    ],
    callStack: [],
  },
];

/**
 * ReadOnlyReentrancyDiagram
 *
 * 5-step step-through showing read-only reentrancy:
 * view function returns stale state during external call.
 */
export function ReadOnlyReentrancyDiagram() {
  const [stepIndex, setStepIndex] = useState(0);

  return (
    <DiagramContainer title="Read-only Reentrancy: view-функция и stale state" color="purple">
      <StepNavigation
        steps={READ_ONLY_HISTORY}
        stepIndex={stepIndex}
        setStepIndex={setStepIndex}
        accentColor="#a78bfa"
      />
      {stepIndex >= READ_ONLY_HISTORY.length - 1 && (
        <div style={{ marginTop: 12 }}>
          <DataBox
            label="Ключевой вывод"
            value="Read-only reentrancy -- самый коварный вариант: nonReentrant на view-функциях не работает. Решение: проверка lock-флага в view-функциях или использование TWAP вместо spot price."
            variant="highlight"
          />
        </div>
      )}
    </DiagramContainer>
  );
}
