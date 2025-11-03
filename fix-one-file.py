import re
import sys

# Fix OrganizationWorkspace.tsx
file_path = r'frontend\webapp\src\features\organizations\views\pages\OrganizationWorkspace\OrganizationWorkspace.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace style={ [space] [letter] with style={{ [space] [letter]
original_count = len(re.findall(r'style=\{\s+[a-zA-Z]', content))
content = re.sub(r'style=\{\s+([a-zA-Z])', r'style={{ \1', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f'✓ Fixed {original_count} occurrences in OrganizationWorkspace.tsx')
