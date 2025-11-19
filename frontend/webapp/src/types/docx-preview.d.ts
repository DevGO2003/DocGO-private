declare module 'docx-preview' {
  export interface DocxRenderOptions {
    className?: string
    inWrapper?: boolean
    hideWrapperOnPrint?: boolean
    ignoreWidth?: boolean
    ignoreHeight?: boolean
    ignoreFonts?: boolean
    breakPages?: boolean
    ignoreLastRenderedPageBreak?: boolean
    experimental?: boolean
    trimXmlDeclaration?: boolean
    useBase64URL?: boolean
    renderChanges?: boolean
    renderHeaders?: boolean
    renderFooters?: boolean
    renderFootnotes?: boolean
    renderEndnotes?: boolean
    renderComments?: boolean
    renderAltChunks?: boolean
    debug?: boolean
  }

  export function renderAsync(
    document: Blob | ArrayBuffer | Uint8Array,
    bodyContainer: HTMLElement,
    styleContainer?: HTMLElement | null,
    options?: DocxRenderOptions
  ): Promise<unknown>
}

