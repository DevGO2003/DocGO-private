#!/usr/bin/env python3
"""
Script to fix remaining gradient violations.
Converts bg-gradient-to-br from-color-X to-color-Y to inline styles.
"""

import os
import re
from pathlib import Path

# Gradient mappings
GRADIENT_MAP = {
    # Blue gradients
    'from-blue-50 to-blue-100': "backgroundImage: 'linear-gradient(to bottom right, #eff6ff, #dbeafe)'",
    'from-blue-50 to-blue-50': "backgroundColor: '#eff6ff'",
    'from-blue-500 to-purple-500': "backgroundImage: 'linear-gradient(to bottom right, #3b82f6, #a855f7)'",
    
    # Yellow gradients
    'from-yellow-50 to-yellow-100': "backgroundImage: 'linear-gradient(to bottom right, #fefce8, #fef3c7)'",
    
    # Green gradients
    'from-green-50 to-green-100': "backgroundImage: 'linear-gradient(to bottom right, #f0fdf4, #dcfce7)'",
    
    # Red gradients
    'from-red-50 to-red-100': "backgroundImage: 'linear-gradient(to bottom right, #fef2f2, #fee2e2)'",
    
    # Purple gradients
    'from-purple-50 to-purple-100': "backgroundImage: 'linear-gradient(to bottom right, #faf5ff, #f3e8ff)'",
    'from-purple-500 to-blue-500': "backgroundImage: 'linear-gradient(to bottom right, #a855f7, #3b82f6)'",
    
    # Indigo gradients
    'from-indigo-50 to-indigo-100': "backgroundImage: 'linear-gradient(to bottom right, #eef2ff, #e0e7ff)'",
    
    # Gray gradients
    'from-gray-50 to-white': "backgroundImage: 'linear-gradient(to bottom right, #f9fafb, #ffffff)'",
}

def fix_gradients(file_path: str) -> int:
    """Fix gradient violations in a single file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        fixed_count = 0
        
        # Pattern to find className with bg-gradient-to-br
        # This pattern captures: className="...bg-gradient-to-br from-X-Y to-Z-W..."
        pattern = r'className="([^"]*bg-gradient-to-br[^"]*)"'
        
        def replace_func(match):
            nonlocal fixed_count
            class_string = match.group(1)
            
            # Extract gradient colors
            gradient_match = re.search(r'from-(\w+-\d+)\s+to-(\w+-\d+)', class_string)
            if not gradient_match:
                return match.group(0)
            
            from_color = gradient_match.group(1)
            to_color = gradient_match.group(2)
            gradient_key = f'from-{from_color} to-{to_color}'
            
            if gradient_key not in GRADIENT_MAP:
                # Try to find in map
                for key, value in GRADIENT_MAP.items():
                    if from_color in key and to_color in key:
                        gradient_key = key
                        break
                else:
                    # Not found, skip
                    return match.group(0)
            
            # Remove gradient classes from className
            new_class = re.sub(r'bg-gradient-to-br\s+from-\w+-\d+\s+to-\w+-\d+', '', class_string).strip()
            
            fixed_count += 1
            
            if new_class:
                return f'className="{new_class}" style={{ {GRADIENT_MAP[gradient_key]} }}'
            else:
                return f'style={{ {GRADIENT_MAP[gradient_key]} }}'
        
        # Replace all gradients
        new_content = re.sub(pattern, replace_func, content)
        
        # Write back if changes made
        if new_content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'✅ {file_path}: {fixed_count} gradients fixed')
        else:
            print(f'⏭️  {file_path}: No gradients found')
        
        return fixed_count
    
    except Exception as e:
        print(f'❌ Error processing {file_path}: {e}')
        return 0

def main():
    """Main function to fix all gradient violations."""
    src_dir = Path('P:/DevGO2003/DocGO-private-new/frontend/webapp/src')
    
    if not src_dir.exists():
        print(f'❌ Directory not found: {src_dir}')
        return
    
    # Find all TSX files
    tsx_files = list(src_dir.rglob('*.tsx'))
    print(f'📁 Found {len(tsx_files)} TSX files')
    
    total_fixed = 0
    
    # Process each file
    for tsx_file in tsx_files:
        fixed = fix_gradients(str(tsx_file))
        total_fixed += fixed
    
    print(f'\n📊 SUMMARY')
    print(f'Total gradients fixed: {total_fixed}')

if __name__ == '__main__':
    main()
