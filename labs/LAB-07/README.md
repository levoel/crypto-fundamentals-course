# LAB-07: Web3 Data Indexing

Инфраструктура для индексации данных блокчейна с помощью Subsquid и The Graph.
Два профиля Docker Compose позволяют запускать каждый стек независимо.

## Требования

- Docker и Docker Compose v2+
- Node.js 20+ и npx
- Foundry (forge, cast) -- для деплоя контракта

## Быстрый старт: Subsquid

```bash
# 1. Запуск Anvil + Subsquid стек
docker compose --profile subsquid up -d

# 2. Деплой SimpleToken контракта
chmod +x contracts/deploy.sh
./contracts/deploy.sh

# 3. Проверка GraphQL (http://localhost:4350/graphql)
curl -s http://localhost:4350/graphql -H 'Content-Type: application/json' \
  -d '{"query": "{ transfers(limit: 5) { from to value } }"}' | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin),indent=2))"
```

Subsquid стек:
- Anvil (RPC): http://localhost:8545
- PostgreSQL: localhost:5433
- GraphQL API: http://localhost:4350/graphql (с WebSocket подписками)

## Быстрый старт: The Graph

```bash
# 1. Запуск Anvil + Graph Node стек
docker compose --profile graph up -d

# 2. Деплой SimpleToken контракта
chmod +x contracts/deploy.sh
./contracts/deploy.sh

# 3. Деплой субграфа
cd subgraph
npm install
npx graph codegen
npx graph create --node http://localhost:8020 simple-token
npx graph deploy --node http://localhost:8020 --ipfs http://localhost:5001 simple-token --version-label v0.0.1
cd ..

# 4. Проверка GraphQL
curl -s http://localhost:8000/subgraphs/name/simple-token \
  -H 'Content-Type: application/json' \
  -d '{"query": "{ transfers(first: 5) { from to value } }"}' | python3 -c "import sys,json; print(json.dumps(json.load(sys.stdin),indent=2))"
```

Graph стек:
- Anvil (RPC): http://localhost:8545
- PostgreSQL: localhost:5434
- IPFS: http://localhost:5001
- GraphQL API: http://localhost:8000/subgraphs/name/simple-token
- GraphQL WS: ws://localhost:8001/subgraphs/name/simple-token
- Admin: http://localhost:8020

## Frontend Dashboard

```bash
cd frontend
npm install
npm run dev
# Открыть http://localhost:5173
```

Дашборд показывает:
- **Transfer History** -- таблица проиндексированных Transfer событий с пагинацией
- **Holder Rankings** -- топ-20 держателей токенов по балансу
- **Live Events** -- real-time лента событий через WebSocket подписки

По умолчанию подключается к Subsquid (`localhost:4350`).
Для переключения на Graph Node см. комментарии в `frontend/src/urql-client.ts`.

## Остановка

```bash
# Остановить Subsquid стек
docker compose --profile subsquid down

# Остановить Graph стек
docker compose --profile graph down

# Удалить данные (volumes)
docker compose --profile subsquid down -v
docker compose --profile graph down -v
```

## Ресурсы

| Профиль  | RAM       | Сервисы                                       |
|----------|-----------|-----------------------------------------------|
| subsquid | ~740 MB   | Anvil + PostgreSQL + Processor + GraphQL       |
| graph    | ~1.1-1.8 GB | Anvil + PostgreSQL + IPFS + Graph Node      |
| оба      | ~2-2.5 GB | Все сервисы                                   |

## Устранение неполадок

1. **Процессор зависает**: Убедитесь, что Anvil запущен с `--block-time 2`. Без автоматической генерации блоков индексаторы не получают новых данных.

2. **Graph Node не индексирует**: Проверьте что `network: localhost` в `subgraph.yaml` совпадает с `ethereum: 'localhost:http://anvil:8545'` в docker-compose.yml.

3. **Конфликт портов**: Subsquid PostgreSQL на 5433, Graph PostgreSQL на 5434. Убедитесь что порты свободны.

4. **IPFS ошибки**: Используется `ipfs/kubo:v0.17.0`. Более новые версии могут быть несовместимы с Graph Node.
