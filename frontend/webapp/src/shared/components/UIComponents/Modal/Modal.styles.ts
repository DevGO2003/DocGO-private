export const modalStyles = {
  overlay: 'fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4',
  container: 'relative bg-white rounded-lg shadow-xl overflow-hidden',
  header: 'px-6 py-4 border-b border-gray-200 flex items-center justify-between',
  title: 'text-lg font-semibold text-gray-900',
  closeButton: 'text-gray-400 hover:text-gray-600 transition-colors',
  body: 'p-6',
  footer: 'px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-2',
  sizes: {
    sm: 'max-w-sm w-full',
    md: 'max-w-md w-full',
    lg: 'max-w-lg w-full',
    xl: 'max-w-xl w-full',
  },
};
