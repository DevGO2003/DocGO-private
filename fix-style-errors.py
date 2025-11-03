#!/usr/bin/env python3
import re

files = [
    'frontend/webapp/src/shared/layouts/MainLayout/ControlMainLayout.tsx',
    'frontend/webapp/src/shared/layouts/MainLayout/MainLayout.tsx',
    'frontend/webapp/src/shared/layouts/MainLayout/Sidebar.tsx',
    'frontend/webapp/src/shared/layouts/MainLayout/Header.tsx',
    'frontend/webapp/src/shared/layouts/HeaderLayouts/BaseHeaderLayout/BaseHeaderLayout.tsx',
]

for filepath in files:
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Step 1: Fix style={ to style={{
    content = content.replace('style={ ', 'style={{ ')
    
    # Step 2: Fix closing } to }}
    content = re.sub(r"style=\{\{([^}]+)\}", r"style={{\1}}", content)
    
    # Step 3: Merge duplicate style attributes on same line
    # Pattern: style={{ ... } style={{ ... }
    content = re.sub(r'style=\{\{([^}]+)\}\s+style=\{\{([^}]+)\}', r'style={{ \1, \2 }', content)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'✓ Fixed: {filepath}')
    else:
        print(f'- No changes: {filepath}')

print('\nDone!')
