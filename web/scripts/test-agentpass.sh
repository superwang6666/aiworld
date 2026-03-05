#!/bin/bash

# AgentPass 集成测试脚本
# 用于测试 Agent 握手和 LLM 调用功能

BASE_URL="http://localhost:3000"
AGENT_KEY="${OPENAI_API_KEY:-sk-test-key}"

echo "🧪 AgentPass 集成测试"
echo "========================"
echo ""

# 测试 1: 发现协议
echo "📍 测试 1: 发现协议"
echo "GET /.well-known/ai-agent.json"
DISCOVER_RESPONSE=$(curl -s -X GET "$BASE_URL/.well-known/ai-agent.json")
echo "✓ 响应: $DISCOVER_RESPONSE"
echo ""

# 测试 2: 获取发现文档（通过 /api/agent/entry）
echo "📍 测试 2: 获取发现文档"
echo "GET /api/agent/entry"
DISCOVER_RESPONSE2=$(curl -s -X GET "$BASE_URL/api/agent/entry")
echo "✓ 响应: $DISCOVER_RESPONSE2"
echo ""

# 测试 3: 无效 auth_type
echo "📍 测试 3: 无效 auth_type (应该返回 400)"
INVALID_AUTH=$(curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "$BASE_URL/api/agent/entry" \
  -H "Content-Type: application/json" \
  -d '{
    "auth_type": "JWT",
    "credentials": {"api_key": "sk-test"},
    "task": {"action": "rule-generation", "params": {}}
  }')
echo "✓ 响应: $INVALID_AUTH"
echo ""

# 测试 4: 缺失凭证
echo "📍 测试 4: 缺失凭证 (应该返回 400)"
MISSING_CREDS=$(curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "$BASE_URL/api/agent/entry" \
  -H "Content-Type: application/json" \
  -d '{
    "auth_type": "BYOK",
    "task": {"action": "rule-generation", "params": {}}
  }')
echo "✓ 响应: $MISSING_CREDS"
echo ""

# 测试 5: 有效的规则生成请求
echo "📍 测试 5: 有效的规则生成请求"
echo "需要有效的 API Key（设置 OPENAI_API_KEY 环境变量）"
if [ "$AGENT_KEY" != "sk-test-key" ]; then
  VALID_REQUEST=$(curl -s -X POST "$BASE_URL/api/agent/entry" \
    -H "Content-Type: application/json" \
    -d "{
      \"auth_type\": \"BYOK\",
      \"identity\": \"test-agent-v1\",
      \"credentials\": {\"api_key\": \"$AGENT_KEY\"},
      \"task\": {
        \"action\": \"rule-generation\",
        \"params\": {
          \"premise\": \"一个魔法世界\",
          \"laws\": [\"Space\", \"Time\"]
        }
      }
    }")
  echo "✓ 响应: $VALID_REQUEST"
else
  echo "⚠️  跳过此测试（设置 OPENAI_API_KEY...）"
fi
echo ""

# 测试 6: 未知任务类型
echo "📍 测试 6: 未知任务类型 (应该返回 400)"
UNKNOWN_ACTION=$(curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "$BASE_URL/api/agent/entry" \
  -H "Content-Type: application/json" \
  -d '{
    "auth_type": "BYOK",
    "credentials": {"api_key": "sk-test"},
    "task": {"action": "unknown-action", "params": {}}
  }')
echo "✓ 响应: $UNKNOWN_ACTION"
echo ""

echo "========================"
echo "✅ 集成测试完成"
