export const panelStyles = {
  base: 'relative overflow-hidden rounded-2xl',
  header: 'px-6 py-6',
  content: 'relative z-10',
  title: 'text-2xl md:text-3xl font-extrabold mb-1',
  subtitle: 'text-gray-500 text-xs font-medium mb-1',
  description: 'text-gray-600 text-sm mb-2',
  breadcrumb: {
    nav: 'flex mb-2',
    list: 'flex items-center space-x-1 text-sm',
    item: 'flex items-center',
    link: 'text-indigo-600 hover:text-indigo-700 font-medium',
    current: 'text-gray-500 font-medium',
  },
  background: 'linear-gradient(to bottom right, #eef2ff, #ffffff, #faf5ff)',
  decorative: {
    blob1: 'pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-indigo-200/30 blur-3xl',
    blob2: 'pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-purple-200/30 blur-3xl',
  },
};
