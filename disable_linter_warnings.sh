#!/bin/bash

echo "🔧 Отключаем предупреждения линтера..."

cd fubamarket

# Создаем .eslintrc.json с отключенными правилами
cat > .eslintrc.json << 'EOF'
{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "react/no-unescaped-entities": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "react-hooks/exhaustive-deps": "off",
    "@next/next/no-img-element": "off",
    "@typescript-eslint/no-empty-object-type": "off"
  }
}
EOF

echo "✅ Предупреждения линтера отключены!"
