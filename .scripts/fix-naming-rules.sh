#!/bin/bash
# Fix Naming Violations

echo "=== Fixing Naming Violations ==="
echo ""

# Count before
h2_num=$(grep -rn '^##\s\+[0-9]\+\.[0-9]\+\s\+' docs/ 2>/dev/null | wc -l)
h2_chap=$(grep -rn '^##\s\+第[0-9]\+\s*章' docs/ 2>/dev/null | wc -l)
h3_num=$(grep -rn '^###\s\+[0-9]\+\.[0-9]\+\.[0-9]\+\s\+' docs/ 2>/dev/null | wc -l)
h3_chap=$(grep -rn '^###\s\+第[0-9]\+\s*章' docs/ 2>/dev/null | wc -l)
h4_num=$(grep -rn '^####\s\+[0-9]\+\.[0-9]\+\.[0-9]\+\.[0-9]\+\s\+' docs/ 2>/dev/null | wc -l)
h4_chap=$(grep -rn '^####\s\+第[0-9]\+\s*章' docs/ 2>/dev/null | wc -l)
h1_num=$(grep -rn '^#\s\+[0-9]\+\.[0-9]\+\s\+' docs/ 2>/dev/null | wc -l)
h1_chap=$(grep -rn '^#\s\+第[0-9]\+\s*章' docs/ 2>/dev/null | wc -l)

echo "Before:"
echo "  H2 Numbered: $h2_num, Chapter: $h2_chap"
echo "  H3 Numbered: $h3_num, Chapter: $h3_chap"
echo "  H4 Numbered: $h4_num, Chapter: $h4_chap"
echo "  H1 Numbered: $h1_num, Chapter: $h1_chap"
echo ""

# Fix
find docs/ -name "*.md" -type f -exec sed -i 's/^##\s\+[0-9]\+\.[0-9]\+\s\+/## /g' {} \;
find docs/ -name "*.md" -type f -exec sed -i 's/^##\s\+第[0-9]\+\s*章\s*/## /g' {} \;
find docs/ -name "*.md" -type f -exec sed -i 's/^###\s\+[0-9]\+\.[0-9]\+\.[0-9]\+\s\+/### /g' {} \;
find docs/ -name "*.md" -type f -exec sed -i 's/^###\s\+第[0-9]\+\s*章\s*/### /g' {} \;
find docs/ -name "*.md" -type f -exec sed -i 's/^####\s\+[0-9]\+\.[0-9]\+\.[0-9]\+\.[0-9]\+\s\+/#### /g' {} \;
find docs/ -name "*.md" -type f -exec sed -i 's/^####\s\+第[0-9]\+\s*章\s*/#### /g' {} \;
find docs/ -name "*.md" -type f -exec sed -i 's/^#\s\+[0-9]\+\.[0-9]\+\s\+/# /g' {} \;
find docs/ -name "*.md" -type f -exec sed -i 's/^#\s\+第[0-9]\+\s*章\s*/# /g' {} \;

echo "Done! Run check-naming-rules.sh to verify."
echo ""
read -p "Press Enter to exit..."
