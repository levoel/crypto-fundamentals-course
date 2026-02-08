#!/bin/bash
# LAB-02: Bitcoin Script and Transaction Types
# Run: docker exec bitcoin-regtest bash /scripts/lab-02-script.sh
#
# Этот скрипт демонстрирует:
# 1. Создание адресов разных типов (P2WPKH, P2TR, P2SH-SegWit, legacy)
# 2. Отправку на каждый тип адреса и сравнение транзакций
# 3. Декодирование scriptPubKey для каждого типа
# 4. Декодирование скриптов (decodescript)
# 5. Сравнение размеров транзакций
# 6. Descriptor wallet информация
#
# ВАЖНО: Bitcoin Core v30.2 -- только descriptor wallets.
# Команды dumpprivkey / importprivkey НЕ поддерживаются.

set -e

RPC_USER="${BITCOIN_RPC_USER:-student}"
RPC_PASS="${BITCOIN_RPC_PASSWORD:-learn}"
CLI="bitcoin-cli -regtest -rpcuser=$RPC_USER -rpcpassword=$RPC_PASS"

echo "============================================"
echo "  LAB-02: Bitcoin Script и типы транзакций"
echo "============================================"
echo ""

# ------------------------------------------
# Раздел 1: Проверка кошелька и баланса
# ------------------------------------------
echo "=== 1. Проверка кошелька ==="

# Проверяем, что кошелек существует
WALLET_INFO=$($CLI getwalletinfo 2>/dev/null) || {
    echo "Кошелек не найден. Создаём..."
    $CLI createwallet "course"
    WALLET_INFO=$($CLI getwalletinfo)
}

BALANCE=$($CLI getbalance)
echo "Баланс: $BALANCE BTC"

# Если баланс 0, нужно намайнить блоки
if [ "$(echo "$BALANCE == 0" | bc -l)" = "1" ]; then
    echo "Баланс нулевой. Генерируем 101 блок..."
    ADDR=$($CLI getnewaddress)
    $CLI generatetoaddress 101 "$ADDR" > /dev/null
    BALANCE=$($CLI getbalance)
    echo "Новый баланс: $BALANCE BTC"
fi

echo ""

# ------------------------------------------
# Раздел 2: Создание адресов разных типов
# ------------------------------------------
echo "=== 2. Создание адресов разных типов ==="
echo ""

# P2WPKH (bech32) -- SegWit v0
ADDR_WPKH=$($CLI getnewaddress "lab-p2wpkh" "bech32")
echo "P2WPKH (bech32):     $ADDR_WPKH"

# P2TR (bech32m) -- Taproot
ADDR_TR=$($CLI getnewaddress "lab-p2tr" "bech32m")
echo "P2TR (bech32m):      $ADDR_TR"

# P2SH-SegWit (p2sh-segwit)
ADDR_P2SH=$($CLI getnewaddress "lab-p2sh" "p2sh-segwit")
echo "P2SH-SegWit:         $ADDR_P2SH"

# Legacy P2PKH
ADDR_LEGACY=$($CLI getnewaddress "lab-legacy" "legacy")
echo "Legacy (P2PKH):      $ADDR_LEGACY"

echo ""
echo "--- Инспекция адресов ---"
echo ""

# Получаем информацию о каждом адресе
for LABEL in "lab-p2wpkh" "lab-p2tr" "lab-p2sh" "lab-legacy"; do
    ADDR=$($CLI getaddressesbylabel "$LABEL" | python3 -c "import sys,json; print(list(json.load(sys.stdin).keys())[0])")
    INFO=$($CLI getaddressinfo "$ADDR")
    SCRIPT_PK=$(echo "$INFO" | python3 -c "import sys,json; print(json.load(sys.stdin).get('scriptPubKey', 'N/A'))")
    DESC=$(echo "$INFO" | python3 -c "import sys,json; print(json.load(sys.stdin).get('desc', 'N/A')[:60])")
    echo "$LABEL:"
    echo "  scriptPubKey: $SCRIPT_PK"
    echo "  descriptor:   $DESC..."
    echo ""
done

# ------------------------------------------
# Раздел 3: Отправка на каждый тип адреса
# ------------------------------------------
echo "=== 3. Отправка на разные типы адресов ==="
echo ""

TXID_WPKH=$($CLI sendtoaddress "$ADDR_WPKH" 0.01)
echo "Отправлено 0.01 BTC на P2WPKH:  txid=$TXID_WPKH"

TXID_TR=$($CLI sendtoaddress "$ADDR_TR" 0.01)
echo "Отправлено 0.01 BTC на P2TR:    txid=$TXID_TR"

TXID_P2SH=$($CLI sendtoaddress "$ADDR_P2SH" 0.01)
echo "Отправлено 0.01 BTC на P2SH:    txid=$TXID_P2SH"

TXID_LEGACY=$($CLI sendtoaddress "$ADDR_LEGACY" 0.01)
echo "Отправлено 0.01 BTC на Legacy:  txid=$TXID_LEGACY"

echo ""
echo "Подтверждаем: генерируем 1 блок..."
MINE_ADDR=$($CLI getnewaddress)
$CLI generatetoaddress 1 "$MINE_ADDR" > /dev/null
echo "Блок создан."
echo ""

# ------------------------------------------
# Раздел 4: Декодирование транзакций
# ------------------------------------------
echo "=== 4. Декодирование транзакций ==="
echo ""

for TXID_VAR in "$TXID_WPKH" "$TXID_TR" "$TXID_P2SH" "$TXID_LEGACY"; do
    RAW_HEX=$($CLI getrawtransaction "$TXID_VAR")
    echo "--- TXID: ${TXID_VAR:0:16}... ---"

    # Декодируем и выводим scriptPubKey каждого выхода
    $CLI decoderawtransaction "$RAW_HEX" | python3 -c "
import sys, json
tx = json.load(sys.stdin)
for i, out in enumerate(tx['vout']):
    spk = out['scriptPubKey']
    print(f\"  Выход {i}: {out['value']:.8f} BTC\")
    print(f\"    Тип: {spk.get('type', 'unknown')}\")
    print(f\"    ASM: {spk.get('asm', 'N/A')[:80]}\")
    print(f\"    Адрес: {spk.get('address', 'N/A')}\")
    print()
"
done

# ------------------------------------------
# Раздел 5: Декодирование скриптов
# ------------------------------------------
echo "=== 5. Декодирование скриптов (decodescript) ==="
echo ""

# Получаем scriptPubKey для P2WPKH адреса
SPK_HEX=$($CLI getaddressinfo "$ADDR_WPKH" | python3 -c "import sys,json; print(json.load(sys.stdin)['scriptPubKey'])")
echo "P2WPKH scriptPubKey: $SPK_HEX"
echo "Декодирование:"
$CLI decodescript "$SPK_HEX" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f\"  ASM:  {d.get('asm', 'N/A')}\")
print(f\"  Тип:  {d.get('type', 'N/A')}\")
print(f\"  Desc: {d.get('desc', 'N/A')[:60]}\")
"
echo ""

# P2TR
SPK_TR=$($CLI getaddressinfo "$ADDR_TR" | python3 -c "import sys,json; print(json.load(sys.stdin)['scriptPubKey'])")
echo "P2TR scriptPubKey: $SPK_TR"
echo "Декодирование:"
$CLI decodescript "$SPK_TR" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f\"  ASM:  {d.get('asm', 'N/A')}\")
print(f\"  Тип:  {d.get('type', 'N/A')}\")
"
echo ""

# Legacy P2PKH
SPK_LEG=$($CLI getaddressinfo "$ADDR_LEGACY" | python3 -c "import sys,json; print(json.load(sys.stdin)['scriptPubKey'])")
echo "P2PKH scriptPubKey: $SPK_LEG"
echo "Декодирование:"
$CLI decodescript "$SPK_LEG" | python3 -c "
import sys, json
d = json.load(sys.stdin)
print(f\"  ASM:  {d.get('asm', 'N/A')}\")
print(f\"  Тип:  {d.get('type', 'N/A')}\")
"
echo ""

# ------------------------------------------
# Раздел 6: Сравнение размеров транзакций
# ------------------------------------------
echo "=== 6. Сравнение размеров транзакций ==="
echo ""

echo "Формула: weight = non_witness * 4 + witness * 1"
echo "         vB = weight / 4"
echo ""

for TXID_INFO in "P2WPKH:$TXID_WPKH" "P2TR:$TXID_TR" "P2SH:$TXID_P2SH" "Legacy:$TXID_LEGACY"; do
    LABEL="${TXID_INFO%%:*}"
    TXID="${TXID_INFO##*:}"

    TX_JSON=$($CLI gettransaction "$TXID")
    echo "$TX_JSON" | python3 -c "
import sys, json
tx = json.load(sys.stdin)
# gettransaction не возвращает vsize/weight напрямую для всех версий
# Используем getrawtransaction verbose
" 2>/dev/null

    TX_VERBOSE=$($CLI getrawtransaction "$TXID" true)
    echo "$TX_VERBOSE" | python3 -c "
import sys, json
tx = json.load(sys.stdin)
label = '$LABEL'
size = tx.get('size', 'N/A')
vsize = tx.get('vsize', 'N/A')
weight = tx.get('weight', 'N/A')
print(f'{label:<10} size={size}B  vsize={vsize}vB  weight={weight}WU')
"
done

echo ""

# ------------------------------------------
# Раздел 7: Descriptor wallet
# ------------------------------------------
echo "=== 7. Descriptor Wallet ==="
echo ""
echo "Bitcoin Core v30.2 использует ТОЛЬКО descriptor wallets."
echo "Команды dumpprivkey / importprivkey НЕ поддерживаются."
echo ""
echo "Дескрипторы кошелька (первые 5):"
$CLI listdescriptors | python3 -c "
import sys, json
data = json.load(sys.stdin)
for i, desc in enumerate(data['descriptors'][:5]):
    d = desc['desc']
    # Обрезаем длинные дескрипторы
    if len(d) > 80:
        d = d[:77] + '...'
    print(f'  [{i+1}] {d}')
print(f'  ... всего {len(data[\"descriptors\"])} дескрипторов')
"

echo ""
echo "============================================"
echo "  LAB-02 завершён!"
echo "============================================"
echo ""
echo "Что мы сделали:"
echo "  1. Создали адреса 4 разных типов"
echo "  2. Отправили BTC на каждый тип"
echo "  3. Декодировали scriptPubKey каждой транзакции"
echo "  4. Использовали decodescript для анализа скриптов"
echo "  5. Сравнили размеры транзакций (bytes, vB, WU)"
echo "  6. Исследовали descriptor wallet"
