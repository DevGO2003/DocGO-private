#!/usr/bin/env python3
import re
import os
from pathlib import Path

def fix_style_attributes(content):
    """Fix JSX style={ } to style={{ }}"""
    original = content
    
    # Pattern 1: style={ property: value } -> style={{ property: value }}
    # Match style={ followed by word characters (property name)
    content = re.sub(
        r'style=\{\s+([a-zA-Z])',
        r'style={{ \1',
        content
    )
    
    # Pattern 2: Merge duplicate styles: } style={{ -> ,
    content = re.sub(
        r'\}\s+style=\{\{',
        ', ',
        content
    )
    
    return content, content != original

def process_files(root_dir):
    """Process all .tsx and .ts files"""
    fixed_count = 0
    total_changes = 0
    
    for file_path in Path(root_dir).rglob('*.tsx'):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content, changed = fix_style_attributes(content)
            
            if changed:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                
                print(f"✓ Fixed: {file_path.name}")
                fixed_count += 1
                
        except Exception as e:
            print(f"✗ Error processing {file_path}: {e}")
    
    print(f"\n✓ Total files fixed: {fixed_count}")
    return fixed_count

if __name__ == '__main__':
    root = Path('frontend/webapp/src')
    if root.exists():
        process_files(root)
    else:
        print(f"Directory not found: {root}")
