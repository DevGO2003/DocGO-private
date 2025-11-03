#!/usr/bin/env python3
"""
Script to automatically fix Tailwind color violations by replacing with inline styles.
Converts className="bg-blue-50" to style={{ backgroundColor: '#eff6ff' }}
"""

import os
import re
from pathlib import Path
from typing import Dict, Tuple

# Tailwind color mapping to inline styles
TAILWIND_COLOR_MAP = {
    # Backgrounds
    'bg-white': 'backgroundColor: \'#ffffff\'',
    'bg-gray-50': 'backgroundColor: \'#f9fafb\'',
    'bg-gray-100': 'backgroundColor: \'#f3f4f6\'',
    'bg-gray-200': 'backgroundColor: \'#e5e7eb\'',
    'bg-gray-300': 'backgroundColor: \'#d1d5db\'',
    'bg-gray-400': 'backgroundColor: \'#9ca3af\'',
    'bg-gray-500': 'backgroundColor: \'#6b7280\'',
    'bg-gray-600': 'backgroundColor: \'#4b5563\'',
    'bg-gray-700': 'backgroundColor: \'#374151\'',
    'bg-gray-900': 'backgroundColor: \'#111827\'',
    'bg-blue-50': 'backgroundColor: \'#eff6ff\'',
    'bg-blue-100': 'backgroundColor: \'#dbeafe\'',
    'bg-blue-200': 'backgroundColor: \'#bfdbfe\'',
    'bg-blue-500': 'backgroundColor: \'#3b82f6\'',
    'bg-blue-600': 'backgroundColor: \'#2563eb\'',
    'bg-red-50': 'backgroundColor: \'#fef2f2\'',
    'bg-red-100': 'backgroundColor: \'#fee2e2\'',
    'bg-red-600': 'backgroundColor: \'#dc2626\'',
    'bg-green-50': 'backgroundColor: \'#f0fdf4\'',
    'bg-green-100': 'backgroundColor: \'#dcfce7\'',
    'bg-green-600': 'backgroundColor: \'#16a34a\'',
    'bg-yellow-50': 'backgroundColor: \'#fefce8\'',
    'bg-yellow-100': 'backgroundColor: \'#fef3c7\'',
    'bg-yellow-600': 'backgroundColor: \'#ca8a04\'',
    'bg-purple-50': 'backgroundColor: \'#faf5ff\'',
    'bg-purple-100': 'backgroundColor: \'#f3e8ff\'',
    'bg-purple-600': 'backgroundColor: \'#9333ea\'',
    'bg-indigo-50': 'backgroundColor: \'#eef2ff\'',
    'bg-indigo-100': 'backgroundColor: \'#e0e7ff\'',
    'bg-indigo-600': 'backgroundColor: \'#4f46e5\'',
    'bg-gradient-to-br': 'backgroundImage: \'linear-gradient(to bottom right, ...)\' /* MANUAL FIX NEEDED */',
    
    # Text colors
    'text-white': 'color: \'#ffffff\'',
    'text-gray-400': 'color: \'#9ca3af\'',
    'text-gray-500': 'color: \'#6b7280\'',
    'text-gray-600': 'color: \'#4b5563\'',
    'text-gray-700': 'color: \'#374151\'',
    'text-gray-900': 'color: \'#111827\'',
    'text-blue-500': 'color: \'#3b82f6\'',
    'text-blue-600': 'color: \'#2563eb\'',
    'text-blue-700': 'color: \'#1d4ed8\'',
    'text-red-600': 'color: \'#dc2626\'',
    'text-green-600': 'color: \'#16a34a\'',
    'text-yellow-600': 'color: \'#ca8a04\'',
    'text-yellow-700': 'color: \'#b45309\'',
    'text-purple-700': 'color: \'#7e22ce\'',
    'text-purple-800': 'color: \'#6b21a8\'',
    
    # Border colors
    'border-gray-100': 'borderColor: \'#f3f4f6\'',
    'border-gray-200': 'borderColor: \'#e5e7eb\'',
    'border-gray-300': 'borderColor: \'#d1d5db\'',
    'border-gray-400': 'borderColor: \'#9ca3af\'',
    'border-blue-200': 'borderColor: \'#bfdbfe\'',
    'border-blue-500': 'borderColor: \'#3b82f6\'',
    'border-purple-200': 'borderColor: \'#e9d5ff\'',
    'border-purple-300': 'borderColor: \'#d8b4fe\'',
    'border-red-100': 'borderColor: \'#fee2e2\'',
    'border-yellow-200': 'borderColor: \'#fef08a\'',
    'border-green-200': 'borderColor: \'#bbf7d0\'',
    
    # Shadows
    'shadow-lg': 'boxShadow: \'0 10px 15px -3px rgba(0, 0, 0, 0.1)\'',
    'shadow-md': 'boxShadow: \'0 4px 6px -1px rgba(0, 0, 0, 0.1)\'',
    'shadow-sm': 'boxShadow: \'0 1px 2px 0 rgba(0, 0, 0, 0.05)\'',
}

# Layout classes to keep (do NOT convert)
LAYOUT_CLASSES = {
    'flex', 'grid', 'inline-flex', 'inline-grid', 'block', 'inline-block',
    'gap', 'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-6', 'gap-8',
    'p', 'px', 'py', 'pt', 'pb', 'pl', 'pr', 'p-1', 'p-2', 'p-3', 'p-4', 'p-6', 'p-8',
    'px-1', 'px-2', 'px-3', 'px-4', 'px-6', 'px-8',
    'py-1', 'py-2', 'py-3', 'py-4', 'py-6', 'py-8',
    'pt-1', 'pt-2', 'pt-3', 'pt-4', 'pb-1', 'pb-2', 'pb-3', 'pb-4',
    'pl-1', 'pl-2', 'pl-3', 'pl-4', 'pr-1', 'pr-2', 'pr-3', 'pr-4',
    'm', 'mx', 'my', 'mt', 'mb', 'ml', 'mr', 'm-1', 'm-2', 'm-3', 'm-4', 'm-6', 'm-8',
    'mx-1', 'mx-2', 'mx-3', 'mx-4', 'mx-6', 'mx-8',
    'my-1', 'my-2', 'my-3', 'my-4', 'my-6', 'my-8',
    'mt-1', 'mt-2', 'mt-3', 'mt-4', 'mb-1', 'mb-2', 'mb-3', 'mb-4',
    'ml-1', 'ml-2', 'ml-3', 'ml-4', 'mr-1', 'mr-2', 'mr-3', 'mr-4',
    'w-full', 'w-1/2', 'w-1/3', 'w-1/4', 'w-auto', 'w-screen',
    'h-full', 'h-screen', 'h-auto', 'h-8', 'h-10', 'h-12', 'h-16',
    'min-w', 'max-w', 'min-h', 'max-h',
    'items-center', 'items-start', 'items-end', 'items-baseline',
    'justify-center', 'justify-start', 'justify-end', 'justify-between',
    'rounded', 'rounded-lg', 'rounded-full', 'rounded-md', 'rounded-sm',
    'border', 'border-2', 'border-l', 'border-r', 'border-t', 'border-b',
    'space-x', 'space-y', 'space-x-1', 'space-x-2', 'space-x-3', 'space-x-4',
    'space-y-1', 'space-y-2', 'space-y-3', 'space-y-4', 'space-y-6',
    'absolute', 'relative', 'fixed', 'sticky', 'top', 'bottom', 'left', 'right',
    'top-0', 'bottom-0', 'left-0', 'right-0', 'top-1', 'bottom-1', 'left-1', 'right-1',
    'z-0', 'z-10', 'z-20', 'z-30', 'z-40', 'z-50',
    'opacity', 'opacity-50', 'opacity-75', 'opacity-100',
    'overflow-auto', 'overflow-hidden', 'overflow-visible', 'overflow-scroll',
    'font-bold', 'font-semibold', 'font-medium', 'font-normal', 'font-light',
    'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl',
    'leading-tight', 'leading-normal', 'leading-loose',
    'tracking-tight', 'tracking-normal', 'tracking-wide',
    'truncate', 'line-clamp', 'line-clamp-1', 'line-clamp-2', 'line-clamp-3',
    'uppercase', 'lowercase', 'capitalize', 'normal-case',
    'underline', 'no-underline', 'line-through',
    'hover:', 'focus:', 'active:', 'disabled:', 'group-hover:',
    'md:', 'lg:', 'xl:', 'sm:', 'dark:',
    'transition', 'transition-all', 'transition-colors', 'duration-200', 'duration-300',
    'cursor-pointer', 'cursor-default', 'cursor-not-allowed',
    'pointer-events-none', 'pointer-events-auto',
}

def extract_layout_classes(class_string: str) -> Tuple[str, list]:
    """Extract layout classes and color classes from className string."""
    classes = class_string.split()
    layout_classes = []
    color_classes = []
    
    for cls in classes:
        # Check if it's a layout class or color class
        is_layout = False
        for layout_cls in LAYOUT_CLASSES:
            if cls.startswith(layout_cls):
                is_layout = True
                break
        
        if is_layout:
            layout_classes.append(cls)
        else:
            color_classes.append(cls)
    
    return ' '.join(layout_classes), color_classes

def convert_colors_to_inline(color_classes: list) -> str:
    """Convert color classes to inline style string."""
    styles = []
    for cls in color_classes:
        if cls in TAILWIND_COLOR_MAP:
            styles.append(TAILWIND_COLOR_MAP[cls])
    return ', '.join(styles)

def fix_file(file_path: str) -> Tuple[int, int]:
    """Fix Tailwind violations in a single file. Returns (violations_found, violations_fixed)."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        violations_found = 0
        violations_fixed = 0
        
        # Pattern to find className attributes with color violations
        # This is a simplified pattern - may need refinement
        pattern = r'className="([^"]*(?:bg-|text-|border-|shadow-)[^"]*)"'
        
        def replace_func(match):
            nonlocal violations_found, violations_fixed
            class_string = match.group(1)
            violations_found += 1
            
            layout_classes, color_classes = extract_layout_classes(class_string)
            
            if not color_classes:
                return match.group(0)  # No color classes, keep as is
            
            inline_styles = convert_colors_to_inline(color_classes)
            
            if not inline_styles:
                return match.group(0)  # No mappings found
            
            violations_fixed += 1
            
            # Build new className and style attributes
            if layout_classes:
                return f'className="{layout_classes}" style={{ {inline_styles} }}'
            else:
                return f'style={{ {inline_styles} }}'
        
        # Replace all violations
        new_content = re.sub(pattern, replace_func, content)
        
        # Write back if changes made
        if new_content != original_content:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f'✅ {file_path}: {violations_fixed}/{violations_found} fixed')
        else:
            print(f'⏭️  {file_path}: No changes needed')
        
        return violations_found, violations_fixed
    
    except Exception as e:
        print(f'❌ Error processing {file_path}: {e}')
        return 0, 0

def main():
    """Main function to fix all Tailwind violations."""
    src_dir = Path('P:/DevGO2003/DocGO-private-new/frontend/webapp/src')
    
    if not src_dir.exists():
        print(f'❌ Directory not found: {src_dir}')
        return
    
    # Find all TSX files
    tsx_files = list(src_dir.rglob('*.tsx'))
    print(f'📁 Found {len(tsx_files)} TSX files')
    
    total_violations_found = 0
    total_violations_fixed = 0
    
    # Process each file
    for tsx_file in tsx_files:
        found, fixed = fix_file(str(tsx_file))
        total_violations_found += found
        total_violations_fixed += fixed
    
    print(f'\n📊 SUMMARY')
    print(f'Total violations found: {total_violations_found}')
    print(f'Total violations fixed: {total_violations_fixed}')
    print(f'Success rate: {total_violations_fixed}/{total_violations_found} ({100*total_violations_fixed//max(total_violations_found,1)}%)')

if __name__ == '__main__':
    main()
