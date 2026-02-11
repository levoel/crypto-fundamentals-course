/**
 * Account Abstraction Diagrams (ETH-12)
 *
 * Exports:
 * - UserOperationFlowDiagram: ERC-4337 flow step-through (INTERACTIVE, history array, 8 steps)
 *   Covers: problem, UserOp creation, alt-mempool, bundler, EntryPoint, validateUserOp, Paymaster, execute + EIP-7702 comparison
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { DiagramContainer } from '@primitives/DiagramContainer';
import { DiagramTooltip } from '@primitives/Tooltip';
import { DataBox } from '@primitives/DataBox';
import { Grid } from '@primitives/Grid';
import { colors, glassStyle } from '@primitives/shared';

/* ================================================================== */
/*  UserOperationFlowDiagram (INTERACTIVE, step-through, 8 steps)       */
/* ================================================================== */

interface AAStep {
  title: string;
  description: string;
  activeComponent: string;
  detail: string;
  color: string;
  comparison?: string;
}

const AA_STEPS: AAStep[] = [
  {
    title: 'Шаг 1: Проблема EOA',
    description: 'Externally Owned Accounts (EOA) имеют фундаментальные ограничения: только ECDSA подписи, пользователь обязан иметь ETH для газа, одна подпись = одна операция, нет social recovery.',
    activeComponent: 'user',
    detail: 'EOA ограничения:\n- Единственная схема подписи (ECDSA secp256k1)\n- Нет батч-транзакций\n- Потеря приватного ключа = потеря средств навсегда\n- Новый пользователь должен сначала получить ETH для газа\n- Нет программируемой логики аутентификации',
    color: colors.warning,
  },
  {
    title: 'Шаг 2: Создание UserOperation',
    description: 'Пользователь создает UserOperation -- структуру данных, описывающую желаемое действие. Вместо обычной транзакции, UserOp содержит sender (smart account), callData, и произвольную signature.',
    activeComponent: 'userop',
    detail: 'UserOperation {\n  sender: 0xSmartAccount...\n  nonce: 5\n  callData: transfer(to, amount)\n  callGasLimit: 100000\n  verificationGasLimit: 50000\n  preVerificationGas: 21000\n  maxFeePerGas: 20 gwei\n  maxPriorityFeePerGas: 2 gwei\n  signature: <custom signature>\n  paymasterAndData: <optional>\n}',
    color: colors.primary,
  },
  {
    title: 'Шаг 3: Alt-Mempool',
    description: 'UserOperation отправляется не в обычный мемпул Ethereum, а в отдельный alt-mempool. Бандлеры подключены к этому мемпулу и собирают UserOps.',
    activeComponent: 'mempool',
    detail: 'Alt-mempool -- отдельная P2P сеть для UserOperations. Стандартные Ethereum-ноды не видят UserOps до включения в блок. Бандлеры выступают посредниками между пользователями и блокчейном.',
    color: colors.accent,
  },
  {
    title: 'Шаг 4: Bundler агрегирует UserOps',
    description: 'Бандлер собирает несколько UserOperations в одну обычную транзакцию. Это экономит газ за счет амортизации базовых затрат (21000 gas) между несколькими UserOps.',
    activeComponent: 'bundler',
    detail: 'Bundler:\n1. Собирает UserOps из alt-mempool\n2. Симулирует каждый UserOp (валидация + исполнение)\n3. Отклоняет невалидные UserOps\n4. Упаковывает валидные в bundle\n5. Отправляет bundle как вызов EntryPoint.handleOps()\n6. Зарабатывает на разнице газа (MEV)',
    color: '#8b5cf6',
  },
  {
    title: 'Шаг 5: EntryPoint.handleOps()',
    description: 'EntryPoint -- синглтон-контракт (один на всю сеть), который обрабатывает bundle. Он вызывает validateUserOp() на каждом smart account, затем исполняет операции.',
    activeComponent: 'entrypoint',
    detail: 'EntryPoint (0x0000000071727De22E5E9d8BAf0edAc6f37da032):\n\nPhase 1 -- Validation Loop:\n  for each userOp:\n    account.validateUserOp(userOp, missingFunds)\n    paymaster.validatePaymasterUserOp() // if has paymaster\n\nPhase 2 -- Execution Loop:\n  for each userOp:\n    account.execute(dest, value, callData)\n    paymaster.postOp() // if has paymaster',
    color: colors.secondary,
  },
  {
    title: 'Шаг 6: validateUserOp()',
    description: 'Smart Account реализует IAccount.validateUserOp() -- любую логику проверки подписи. Можно использовать ECDSA, multisig, passkeys (WebAuthn), BLS или любую другую схему.',
    activeComponent: 'smartaccount',
    detail: 'function validateUserOp(\n  PackedUserOperation calldata userOp,\n  bytes32 userOpHash,\n  uint256 missingAccountFunds\n) external returns (uint256 validationData)\n\nВозвращает:\n- 0: валидация пройдена\n- 1: валидация не пройдена\n- sigTimeRange: временные ограничения подписи',
    color: '#4ade80',
  },
  {
    title: 'Шаг 7: Paymaster (опционально)',
    description: 'Paymaster -- контракт, который может оплатить газ за пользователя. Бизнес оплачивает газ за своих клиентов, или пользователь платит ERC-20 токенами вместо ETH.',
    activeComponent: 'paymaster',
    detail: 'Paymaster use cases:\n- Спонсирование газа (dApp платит за пользователя)\n- Оплата газа ERC-20 токенами (USDC, DAI)\n- Подписочная модель (оплата за месяц)\n- Условное спонсирование (только для NFT mint)\n\nPaymaster валидирует в Phase 1, получает обратный вызов postOp() в Phase 2 для учета расходов.',
    color: '#f59e0b',
  },
  {
    title: 'Шаг 8: Исполнение + EIP-7702',
    description: 'Smart account исполняет callData. Результат записывается в блокчейн. Для сравнения: EIP-7702 позволяет EOA временно делегировать код контракту -- более легковесная альтернатива.',
    activeComponent: 'execute',
    detail: 'ERC-4337 vs EIP-7702:\n\n  ERC-4337:\n  + Постоянный smart account\n  + Любая схема подписей\n  + Полная кастомизация\n  - Требует развертывания контракта\n  - Более высокий газ\n\n  EIP-7702 (Pectra):\n  + EOA временно получает код контракта\n  + Batch транзакции для EOA\n  + Спонсирование газа\n  + Не нужен deploy\n  - Временное (на одну транзакцию type 0x04)\n  - Ограниченная кастомизация',
    color: colors.success,
    comparison: 'ERC-4337 = перманентный апгрейд (smart account навсегда)\nEIP-7702 = временная суперсила (EOA на одну транзакцию)',
  },
];

/* ================================================================== */
/*  Component architecture nodes for visual flow                        */
/* ================================================================== */

const FLOW_COMPONENTS = [
  { id: 'user', label: 'Пользователь', short: 'User', x: 0, tooltip: 'Пользователь: инициатор UserOperation. В ERC-4337 не нужен ETH для газа -- Paymaster может спонсировать транзакцию.' },
  { id: 'userop', label: 'UserOperation', short: 'UserOp', x: 1, tooltip: 'UserOperation: структура, заменяющая обычную транзакцию. Содержит sender, callData, signature, initCode и paymasterAndData.' },
  { id: 'mempool', label: 'Alt-Mempool', short: 'Mempool', x: 2, tooltip: 'Alt-Mempool: отдельная P2P сеть для UserOperations. Стандартные ноды не видят UserOps до включения в блок.' },
  { id: 'bundler', label: 'Bundler', short: 'Bundler', x: 3, tooltip: 'Bundler: off-chain агент, собирающий UserOps в bundle transaction. Отправляет bundle на EntryPoint. Зарабатывает на разнице gas fees.' },
  { id: 'entrypoint', label: 'EntryPoint', short: 'Entry', x: 4, tooltip: 'EntryPoint: singleton контракт (один на сеть). Валидирует UserOps, вызывает validateUserOp() на wallet контракте, исполняет callData.' },
  { id: 'smartaccount', label: 'Smart Account', short: 'Account', x: 5, tooltip: 'Smart Contract Wallet: вместо EOA. Поддерживает произвольную логику валидации (multisig, social recovery, session keys).' },
  { id: 'paymaster', label: 'Paymaster', short: 'Pay', x: 6, tooltip: 'Paymaster: контракт, оплачивающий gas за пользователя. Позволяет gasless transactions. Может принимать оплату в ERC-20 токенах.' },
  { id: 'execute', label: 'Execute', short: 'Exec', x: 7, tooltip: 'Execute: финальное исполнение callData на smart account. Результат записывается в блокчейн.' },
];

export function UserOperationFlowDiagram() {
  const [step, setStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleNext = useCallback(() => {
    setStep((s) => Math.min(s + 1, AA_STEPS.length - 1));
  }, []);

  const handlePrev = useCallback(() => {
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const handleReset = useCallback(() => {
    setStep(0);
    setAutoPlay(false);
  }, []);

  useEffect(() => {
    if (autoPlay) {
      intervalRef.current = setInterval(() => {
        setStep((s) => {
          if (s >= AA_STEPS.length - 1) {
            setAutoPlay(false);
            return s;
          }
          return s + 1;
        });
      }, 3500);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoPlay]);

  const current = AA_STEPS[step];

  return (
    <DiagramContainer title="ERC-4337: путь UserOperation" color="purple">
      {/* Flow architecture -- horizontal node chain */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        flexWrap: 'wrap',
        marginBottom: 16,
        padding: '8px 0',
      }}>
        {FLOW_COMPONENTS.map((comp, i) => {
          const isActive = comp.id === current.activeComponent;
          const isPast = i < step;

          return (
            <div key={comp.id} style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <DiagramTooltip content={comp.tooltip}>
                <div
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    fontSize: 9,
                    fontWeight: isActive ? 700 : 500,
                    background: isActive ? `${current.color}20` : isPast ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
                    border: `1.5px solid ${isActive ? current.color : isPast ? colors.textMuted + '40' : 'rgba(255,255,255,0.08)'}`,
                    color: isActive ? current.color : isPast ? colors.textMuted : `${colors.textMuted}80`,
                    transition: 'all 0.3s',
                    minWidth: 44,
                    textAlign: 'center' as const,
                  }}
                >
                  {comp.short}
                </div>
              </DiagramTooltip>
              {i < FLOW_COMPONENTS.length - 1 && (
                <span style={{
                  color: isPast || isActive ? current.color + '60' : colors.border,
                  fontSize: 10,
                  transition: 'color 0.3s',
                }}>
                  →
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Step indicators */}
      <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        {AA_STEPS.map((s, i) => (
          <DiagramTooltip key={i} content={s.title}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 600,
                background: i <= step ? `${AA_STEPS[i].color}25` : 'rgba(255,255,255,0.05)',
                border: `2px solid ${i <= step ? AA_STEPS[i].color : 'rgba(255,255,255,0.1)'}`,
                color: i <= step ? AA_STEPS[i].color : colors.textMuted,
                transition: 'all 0.3s',
              }}
            >
              {i + 1}
            </div>
          </DiagramTooltip>
        ))}
      </div>

      {/* Current step content */}
      <div style={{
        ...glassStyle,
        padding: 16,
        borderColor: `${current.color}40`,
        marginBottom: 16,
        transition: 'border-color 0.3s',
      }}>
        <div style={{
          fontSize: 14,
          fontWeight: 700,
          color: current.color,
          marginBottom: 8,
        }}>
          {current.title}
        </div>
        <div style={{ fontSize: 12, color: colors.textMuted, marginBottom: 12, lineHeight: 1.6 }}>
          {current.description}
        </div>

        {/* Technical detail */}
        <div style={{
          padding: '10px 12px',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 6,
          fontFamily: 'monospace',
          fontSize: 11,
          color: colors.text,
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
        }}>
          {current.detail}
        </div>

        {/* EIP-7702 comparison (only on last step) */}
        {current.comparison && (
          <div style={{
            marginTop: 12,
            padding: '10px 12px',
            background: `${colors.accent}10`,
            border: `1px solid ${colors.accent}30`,
            borderRadius: 6,
            fontFamily: 'monospace',
            fontSize: 11,
            color: colors.accent,
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
          }}>
            {current.comparison}
          </div>
        )}
      </div>

      {/* Comparison table on last step */}
      {step === AA_STEPS.length - 1 && (
        <div style={{ marginBottom: 16 }}>
          <Grid columns={2} gap={8}>
            <DiagramTooltip content="ERC-4337: стандарт Account Abstraction без изменения протокола. Smart account -- постоянный контракт с произвольной логикой валидации, Paymaster спонсированием и session keys.">
              <div style={{
                ...glassStyle,
                padding: 12,
                borderColor: `${colors.primary}30`,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: colors.primary, marginBottom: 8 }}>
                  ERC-4337
                </div>
                <div style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.6 }}>
                  <div>Постоянный smart account</div>
                  <div>Любая схема подписей</div>
                  <div>Paymaster спонсирование</div>
                  <div>Требует deploy контракта</div>
                  <div>Session keys, social recovery</div>
                </div>
              </div>
            </DiagramTooltip>
            <DiagramTooltip content="EIP-7702 (Pectra): EOA временно делегирует код контракту на одну транзакцию (type 0x04). Batch операции и спонсирование газа без deploy контракта.">
              <div style={{
                ...glassStyle,
                padding: 12,
                borderColor: `${colors.accent}30`,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: colors.accent, marginBottom: 8 }}>
                  EIP-7702 (Pectra)
                </div>
                <div style={{ fontSize: 11, color: colors.textMuted, lineHeight: 1.6 }}>
                  <div>Временная делегация EOA</div>
                  <div>Batch транзакции</div>
                  <div>Спонсирование газа</div>
                  <div>Не нужен deploy</div>
                  <div>TX type 0x04, одноразовый</div>
                </div>
              </div>
            </DiagramTooltip>
          </Grid>
        </div>
      )}

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <button
          onClick={handleReset}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: 12,
            color: colors.textMuted,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
          }}
        >
          Сброс
        </button>
        <button
          onClick={handlePrev}
          disabled={step <= 0}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: step <= 0 ? 'default' : 'pointer',
            fontSize: 12,
            color: step <= 0 ? colors.textMuted : colors.accent,
            border: `1px solid ${step <= 0 ? 'rgba(255,255,255,0.1)' : colors.accent}`,
            background: step <= 0 ? 'rgba(255,255,255,0.03)' : `${colors.accent}15`,
            opacity: step <= 0 ? 0.5 : 1,
          }}
        >
          Назад
        </button>
        <button
          onClick={handleNext}
          disabled={step >= AA_STEPS.length - 1}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: step >= AA_STEPS.length - 1 ? 'default' : 'pointer',
            fontSize: 12,
            color: step >= AA_STEPS.length - 1 ? colors.textMuted : colors.primary,
            border: `1px solid ${step >= AA_STEPS.length - 1 ? 'rgba(255,255,255,0.1)' : colors.primary}`,
            background: step >= AA_STEPS.length - 1 ? 'rgba(255,255,255,0.03)' : `${colors.primary}15`,
            opacity: step >= AA_STEPS.length - 1 ? 0.5 : 1,
          }}
        >
          Далее
        </button>
        <button
          onClick={() => {
            if (step >= AA_STEPS.length - 1) setStep(0);
            setAutoPlay(!autoPlay);
          }}
          style={{
            ...glassStyle,
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: 12,
            color: autoPlay ? colors.warning : colors.success,
            border: `1px solid ${autoPlay ? colors.warning : colors.success}`,
            background: `${autoPlay ? colors.warning : colors.success}15`,
          }}
        >
          {autoPlay ? 'Стоп' : 'Авто'}
        </button>
      </div>

      {/* Reference note */}
      <DiagramTooltip content="OpenZeppelin Contracts 5.x: IAccount -- интерфейс ERC-4337, AccountCore -- базовая реализация с validateUserOp(), AccountERC7579 -- модульный стандарт. ERC7702Utils -- утилиты для EIP-7702 делегации.">
        <div style={{
          marginTop: 16,
          ...glassStyle,
          padding: '10px 14px',
          fontSize: 11,
          color: colors.textMuted,
          lineHeight: 1.6,
          textAlign: 'center',
        }}>
          <strong style={{ color: colors.primary }}>OpenZeppelin Contracts 5.x:</strong>{' '}
          предоставляет базовые реализации Account (IAccount, AccountCore, AccountERC7579) для создания совместимых smart accounts. EIP-7702 поддержка: ERC7702Utils.
        </div>
      </DiagramTooltip>
    </DiagramContainer>
  );
}
