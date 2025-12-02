declare module 'mammoth/mammoth.browser' {
  export function convertToHtml(options: { arrayBuffer: ArrayBuffer }): Promise<{ value: string }>
}

declare module 'mammoth/mammoth.browser.js' {
  interface MammothResult {
    value: string
    messages?: Array<{ message?: string; type?: string }>
  }

  type ConvertToHtml = (input: { arrayBuffer: ArrayBuffer }) => Promise<MammothResult>

  export const convertToHtml: ConvertToHtml

  const mammoth: {
    convertToHtml: ConvertToHtml
  }

  export default mammoth
}







