import React from 'react';

export const Table = ({children, ...props}: React.HTMLAttributes<HTMLTableElement>) => (
  <table {...props}>{children}</table>
);

export const TableHeader = ({children, ...props}: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th {...props}>{children}</th>
);

export const TableCell = ({children, ...props}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td {...props}>{children}</td>
);

export const TableRow = ({children, ...props}: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr {...props}>{children}</tr>
);

export const TableContainer = ({children, ...props}: React.HTMLAttributes<HTMLDivElement>) => (
  <div style={{overflowX: 'auto'}} {...props}>{children}</div>
);
