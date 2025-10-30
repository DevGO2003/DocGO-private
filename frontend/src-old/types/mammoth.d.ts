declare module 'mammoth' {
  interface ConvertToHtmlOptions {
    arrayBuffer: ArrayBuffer;
    styleMap?: string[];
    includeEmbeddedStyleMap?: boolean;
    includeDefaultStyleMap?: boolean;
    convertImage?: (image: any) => any;
    ignoreEmptyParagraphs?: boolean;
    idPrefix?: string;
    transformDocument?: (document: any) => any;
  }

  interface ConvertToHtmlResult {
    value: string;
    messages: Message[];
  }

  interface Message {
    type: 'info' | 'warning' | 'error';
    message: string;
  }

  export function convertToHtml(options: ConvertToHtmlOptions): Promise<ConvertToHtmlResult>;
  export function convertToMarkdown(options: ConvertToHtmlOptions): Promise<ConvertToHtmlResult>;
  export function extractRawText(options: ConvertToHtmlOptions): Promise<{ value: string; messages: Message[] }>;
}
