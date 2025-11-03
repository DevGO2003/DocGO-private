#!/usr/bin/env python3
"""
Script to fix remaining Tailwind color violations - text-*-900, text-*-800, etc.
"""

import os
import re
from pathlib import Path

# Additional color mappings for remaining violations
REMAINING_COLOR_MAP = {
    # Text colors (900, 800, 700, 600, 500, 400, 300, 200, 100)
    'text-blue-900': 'color: \'#1e3a8a\'',
    'text-blue-800': 'color: \'#1e40af\'',
    'text-blue-700': 'color: \'#1d4ed8\'',
    'text-blue-600': 'color: \'#2563eb\'',
    'text-blue-500': 'color: \'#3b82f6\'',
    
    'text-yellow-900': 'color: \'#713f12\'',
    'text-yellow-800': 'color: \'#854d0e\'',
    'text-yellow-700': 'color: \'#a16207\'',
    'text-yellow-600': 'color: \'#ca8a04\'',
    'text-yellow-500': 'color: \'#eab308\'',
    
    'text-green-900': 'color: \'#14532d\'',
    'text-green-800': 'color: \'#166534\'',
    'text-green-700': 'color: \'#15803d\'',
    'text-green-600': 'color: \'#16a34a\'',
    'text-green-500': 'color: \'#22c55e\'',
    
    'text-red-900': 'color: \'#7f1d1d\'',
    'text-red-800': 'color: \'#991b1b\'',
    'text-red-700': 'color: \'#b91c1c\'',
    'text-red-600': 'color: \'#dc2626\'',
    'text-red-500': 'color: \'#ef4444\'',
    
    'text-purple-900': 'color: \'#4c1d95\'',
    'text-purple-800': 'color: \'#6b21a8\'',
    'text-purple-700': 'color: \'#7e22ce\'',
    'text-purple-600': 'color: \'#9333ea\'',
    'text-purple-500': 'color: \'#a855f7\'',
    
    'text-indigo-900': 'color: \'#312e81\'',
    'text-indigo-800': 'color: \'#3730a3\'',
    'text-indigo-700': 'color: \'#4338ca\'',
    'text-indigo-600': 'color: \'#4f46e5\'',
    'text-indigo-500': 'color: \'#6366f1\'',
    
    'text-gray-900': 'color: \'#111827\'',
    'text-gray-800': 'color: \'#1f2937\'',
    'text-gray-700': 'color: \'#374151\'',
    'text-gray-600': 'color: \'#4b5563\'',
    'text-gray-500': 'color: \'#6b7280\'',
    'text-gray-400': 'color: \'#9ca3af\'',
    
    # Border colors
    'border-blue-900': 'borderColor: \'#1e3a8a\'',
    'border-blue-800': 'borderColor: \'#1e40af\'',
    'border-blue-700': 'borderColor: \'#1d4ed8\'',
    'border-blue-600': 'borderColor: \'#2563eb\'',
    'border-blue-500': 'borderColor: \'#3b82f6\'',
    'border-blue-400': 'borderColor: \'#60a5fa\'',
    'border-blue-300': 'borderColor: \'#93c5fd\'',
    'border-blue-200': 'borderColor: \'#bfdbfe\'',
    'border-blue-100': 'borderColor: \'#dbeafe\'',
    
    'border-red-900': 'borderColor: \'#7f1d1d\'',
    'border-red-800': 'borderColor: \'#991b1b\'',
    'border-red-700': 'borderColor: \'#b91c1c\'',
    'border-red-600': 'borderColor: \'#dc2626\'',
    'border-red-500': 'borderColor: \'#ef4444\'',
    'border-red-400': 'borderColor: \'#f87171\'',
    'border-red-300': 'borderColor: \'#fca5a5\'',
    'border-red-200': 'borderColor: \'#fecaca\'',
    'border-red-100': 'borderColor: \'#fee2e2\'',
    
    'border-green-900': 'borderColor: \'#14532d\'',
    'border-green-800': 'borderColor: \'#166534\'',
    'border-green-700': 'borderColor: \'#15803d\'',
    'border-green-600': 'borderColor: \'#16a34a\'',
    'border-green-500': 'borderColor: \'#22c55e\'',
    'border-green-400': 'borderColor: \'#4ade80\'',
    'border-green-300': 'borderColor: \'#86efac\'',
    'border-green-200': 'borderColor: \'#bbf7d0\'',
    'border-green-100': 'borderColor: \'#dcfce7\'',
    
    'border-yellow-900': 'borderColor: \'#713f12\'',
    'border-yellow-800': 'borderColor: \'#854d0e\'',
    'border-yellow-700': 'borderColor: \'#a16207\'',
    'border-yellow-600': 'borderColor: \'#ca8a04\'',
    'border-yellow-500': 'borderColor: \'#eab308\'',
    'border-yellow-400': 'borderColor: \'#facc15\'',
    'border-yellow-300': 'borderColor: \'#fde047\'',
    'border-yellow-200': 'borderColor: \'#fef08a\'',
    'border-yellow-100': 'borderColor: \'#fef3c7\'',
    
    'border-purple-900': 'borderColor: \'#4c1d95\'',
    'border-purple-800': 'borderColor: \'#6b21a8\'',
    'border-purple-700': 'borderColor: \'#7e22ce\'',
    'border-purple-600': 'borderColor: \'#9333ea\'',
    'border-purple-500': 'borderColor: \'#a855f7\'',
    'border-purple-400': 'borderColor: \'#c084fc\'',
    'border-purple-300': 'borderColor: \'#d8b4fe\'',
    'border-purple-200': 'borderColor: \'#e9d5ff\'',
    'border-purple-100': 'borderColor: \'#f3e8ff\'',
    
    'border-gray-900': 'borderColor: \'#111827\'',
    'border-gray-800': 'borderColor: \'#1f2937\'',
    'border-gray-700': 'borderColor: \'#374151\'',
    'border-gray-600': 'borderColor: \'#4b5563\'',
    'border-gray-500': 'borderColor: \'#6b7280\'',
    'border-gray-400': 'borderColor: \'#9ca3af\'',
    'border-gray-300': 'borderColor: \'#d1d5db\'',
    'border-gray-200': 'borderColor: \'#e5e7eb\'',
    'border-gray-100': 'borderColor: \'#f3f4f6\'',
}

def fix_remaining_colors(file_path: str) -> int:
    """Fix remaining color violations in a single file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        fixed_count = 0
        
        # Pattern to find className with remaining color classes
        pattern = r'className="([^"]*(?:text-|border-)[a-z]+-(?:900|800|700|600|500|400|300|200|100)[^"]*)"'
        
        def replace_func(match):
            nonlocal fixed_count
            class_string = match.group(1)
            
            # Extract color classes
            color_classes = re.findall(r'((?:text-|border-)[a-z]+-(?:900|800|700|600|500|400|300|200|100))', class_string)
            
            if not color_classes:
                return match.group(0)
            
            # Build inline styles
            styles = []
            for color_class in color_classes:
                if color_class in REMAINING_COLOR_MAP:
                    styles.append(REMAINING_COLOR_MAP[color_class])
                    fixed_count += 1
            
            if not styles:
                return match.group(0)
            
            # Remove color classes from className
            new_class = class_string
            for color_class in color_classes:
                new_class = new_class.replace(color_class, '').strip()
            
            # Clean up multiple spaces
            new_class = re.sub(r'\s+', ' ', new_class).strip()
            
            if new_class:
                return f'className="{new_class}" style={{ {", ".join(styles)} }}'
            else:
                return f'style={{ {", ".join(styles)} }}'
        
        # Replace all remaining colors
        new_content = re.sub(pattern, replace_func, content)
        
        # Write back if changes made
        if new_content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            if fixed_count > 0:
                print(f'✅ {file_path}: {fixed_count} colors fixed')
        
        return fixed_count
    
    except Exception as e:
        print(f'❌ Error processing {file_path}: {e}')
        return 0

def main():
    """Main function to fix all remaining color violations."""
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
        fixed = fix_remaining_colors(str(tsx_file))
        total_fixed += fixed
    
    print(f'\n📊 SUMMARY')
    print(f'Total remaining colors fixed: {total_fixed}')

if __name__ == '__main__':
    main()
