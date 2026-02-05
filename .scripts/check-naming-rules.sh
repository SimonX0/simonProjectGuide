#!/bin/bash
# Check Naming Rules

echo "=== Check Naming Rules ==="
echo ""

echo "[1] H2 Numbered (1.1):"
grep -rn '^##\s\+[0-9]\+\.[0-9]\+\s\+' docs/ 2>/dev/null | wc -l

echo "[2] H2 Chapter (Chapter X):"
grep -rn '^##\s\+第[0-9]\+\s*章' docs/ 2>/dev/null | wc -l

echo "[3] H3 Numbered (1.1.1):"
grep -rn '^###\s\+[0-9]\+\.[0-9]\+\.[0-9]\+\s\+' docs/ 2>/dev/null | wc -l

echo "[4] H3 Chapter (Chapter X):"
grep -rn '^###\s\+第[0-9]\+\s*章' docs/ 2>/dev/null | wc -l

echo "[5] H4 Numbered (1.1.1.1):"
grep -rn '^####\s\+[0-9]\+\.[0-9]\+\.[0-9]\+\.[0-9]\+\s\+' docs/ 2>/dev/null | wc -l

echo "[6] H4 Chapter (Chapter X):"
grep -rn '^####\s\+第[0-9]\+\s*章' docs/ 2>/dev/null | wc -l

echo "[7] H1 Numbered:"
grep -rn '^#\s\+[0-9]\+\.[0-9]\+\s\+' docs/ 2>/dev/null | wc -l

echo "[8] H1 Chapter (Chapter X):"
grep -rn '^#\s\+第[0-9]\+\s*章' docs/ 2>/dev/null | wc -l

echo ""
echo "================================"

# Count total violations
VIOLATIONS=0
VIOLATIONS=$((VIOLATIONS + $(grep -rn '^##\s\+[0-9]\+\.[0-9]\+\s\+' docs/ 2>/dev/null | wc -l)))
VIOLATIONS=$((VIOLATIONS + $(grep -rn '^##\s\+第[0-9]\+\s*章' docs/ 2>/dev/null | wc -l)))
VIOLATIONS=$((VIOLATIONS + $(grep -rn '^###\s\+[0-9]\+\.[0-9]\+\.[0-9]\+\s\+' docs/ 2>/dev/null | wc -l)))
VIOLATIONS=$((VIOLATIONS + $(grep -rn '^###\s\+第[0-9]\+\s*章' docs/ 2>/dev/null | wc -l)))
VIOLATIONS=$((VIOLATIONS + $(grep -rn '^####\s\+[0-9]\+\.[0-9]\+\.[0-9]\+\.[0-9]\+\s\+' docs/ 2>/dev/null | wc -l)))
VIOLATIONS=$((VIOLATIONS + $(grep -rn '^####\s\+第[0-9]\+\s*章' docs/ 2>/dev/null | wc -l)))
VIOLATIONS=$((VIOLATIONS + $(grep -rn '^#\s\+[0-9]\+\.[0-9]\+\s\+' docs/ 2>/dev/null | wc -l)))
VIOLATIONS=$((VIOLATIONS + $(grep -rn '^#\s\+第[0-9]\+\s*章' docs/ 2>/dev/null | wc -l)))

if [ $VIOLATIONS -eq 0 ]; then
    echo "✅ No naming rule violations found!"
    exit 0
else
    echo "⚠️  Found $VIOLATIONS naming rule violation(s)"
    echo "💡 Run fix-naming-rules.sh to auto-fix"
    exit 1
fi
