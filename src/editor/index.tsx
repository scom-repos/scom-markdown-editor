import {
  Module,
  customModule,
  customElements,
  ControlElement,
  Styles,
  Button,
  Panel,
  MarkdownEditor,
  Input,
  Container
} from '@ijstech/components'
import { fetchAIGeneratedText } from '../API'
import './index.css'
const Theme = Styles.Theme.ThemeVars

interface ScomEditorConfigElement extends ControlElement {
  content?: string
  theme?: string
  tag?: any
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      ['i-scom-markdown-editor-config']: ScomEditorConfigElement
    }
  }
}

type ThemeType = 'dark' | 'light'
const LARGE_SIZE = 24

@customModule
@customElements('i-scom-markdown-editor-config')
export default class Config extends Module {
  private pnlEditor: Panel
  private mdEditor: MarkdownEditor
  private inputAIPrompt: Input
  private btnStop: Button
  private btnSend: Button
  private pnlWaiting: Panel
  private wrapPnl: Panel

  private _data: string = ''
  private _theme: ThemeType = 'light'
  private isStopped: boolean = false
  tag: any = {};

  constructor(parent?: Container, options?: any) {
    super(parent, options);
    this.onParagraphClicked = this.onParagraphClicked.bind(this)
  }

  get content() {
    return this.mdEditor?.getMarkdownValue()
  }
  set content(value: string) {
    this._data = value
    if (this.mdEditor) this.mdEditor.value = value
  }

  get theme() {
    return this._theme
  }
  set theme(value: ThemeType) {
    this._theme = value
    if (this.mdEditor) this.mdEditor.theme = value
  }

  private get currentEditor() {
    return this.mdEditor.getEditorElm()
  }

  getTag() {
    return this.tag;
  }

  async setTag(value: any) {
    const { backgroundColor, textColor, textAlign } = value
    this.tag = { backgroundColor, textColor, textAlign }
    this.updateMardown()
  }

  private updateMardown() {
    if (this.wrapPnl) {
      const { backgroundColor, textColor, textAlign } = this.tag;
      this.wrapPnl.style.textAlign = textAlign || "left";
      this.wrapPnl.style.setProperty('--bg-container', backgroundColor || '');
      if (textColor)
        this.wrapPnl.style.setProperty('--text-primary', textColor);
      else this.wrapPnl.style.removeProperty('--text-primary');
    }
  }

  private async renderEditor() {
    if (!this.mdEditor) {
      this.mdEditor = await MarkdownEditor.create({
        value: this._data,
        mode: 'wysiwyg',
        width: '100%',
        height: 'auto',
        theme: this.theme,
        plugins: [this.paragraphPlugin.bind(this)]
      })
      this.mdEditor.display = 'block'
      this.pnlEditor.clearInnerHTML()
      this.pnlEditor.appendChild(this.mdEditor)
    }
    this.mdEditor.value = this._data
    this.mdEditor.theme = this.theme
    this.updateMardown()
  }

  private onParagraphClicked(level: number) {
    if (this.currentEditor) {
      this.currentEditor.exec('paragraph', { level })
      this.currentEditor.eventEmitter.emit('closePopup')
    }
  }

  private paragraphPlugin(context: any, options: any) {
    const container = document.createElement('div')
    this.createPDropdown(container)
    return {
      markdownCommands: {
        paragraph: ({ level }, state: any, dispatch: any) => {
          const { tr, selection, doc, schema } = state
          const fromPos = selection.$head.path[2]
          const pNode = selection.$head.path[1]
          const openTag = `<span class="p${level + 1}">`
          const closeTag = `</span>`
          let hasSet = false
          let headingLength = 0
          doc.descendants((node: any, pos: number) => {
            if (pos >= fromPos && pos <= fromPos + doc.child(pNode).nodeSize) {
              const isText = node.type.name === 'text'
              if (isText) {
                const content = node.text || ''
                if (/^\#+/g.test(content)) {
                  headingLength += node.nodeSize
                  tr.delete(pos, pos + node.nodeSize)
                } else if ((/^\<span class=\"p[1-6]\"\>/g).test(content)) {
                  tr.replaceWith(pos - headingLength, pos + node.nodeSize - headingLength, schema.text(openTag))
                  dispatch!(tr)
                  hasSet = true
                }
              }
            }
          })
          if (!hasSet) {
            const mainNode = doc.child(pNode)
            const textContent = mainNode.content.textBetween(fromPos, mainNode.content.size, '\n')
            const newContent = `${openTag}${textContent}${closeTag}`
            tr.replaceWith(fromPos, fromPos + mainNode.nodeSize, schema.text(newContent))
            dispatch!(tr)
          }
          return true
        }
      },
      wysiwygCommands: {
        paragraph: ({ level }, state: any, dispatch: any) => {
          const { tr, selection, doc, schema } = state
          const pos = selection.$head.path[1]
          const nodePos = selection.$head.path[2]
          const node = doc.child(pos)
          if (node) {
            const attrs = { ...node.attrs, htmlAttrs: { class: `p${level + 1}` } }
            const pNode = schema.nodes.paragraph.create(attrs, node.content, node.marks)
            tr.replaceWith(nodePos, nodePos + node.nodeSize, pNode)
            const mark = schema.marks.span.create(attrs)
            tr.addMark(nodePos, nodePos + node.nodeSize, mark)
            dispatch!(tr)
            return true
          }
          return false
        }
      },
      toolbarItems: [
        {
          groupIndex: 0,
          itemIndex: 1,
          item: {
            name: 'paragraph',
            tooltip: 'Paragraph',
            text: 'P',
            className: 'toastui-editor-toolbar-icons paragraph',
            style: { backgroundImage: 'none' },
            popup: {
              className: 'toastui-editor-popup',
              body: container,
              style: { width: 'auto' }
            }
          }
        }
      ],
      toHTMLRenderers: {
        htmlInline: {
          span(node: any, { entering }: any) {
            return entering
              ? { type: 'openTag', attributes: node.attrs!, tagName: 'span', outerNewLine: true }
              : { type: 'closeTag', tagName: 'span', outerNewLine: true };
          }
        }
      }
    }
  }

  private async createPDropdown(parent: HTMLElement) {
    parent.innerHTML = ''
    for (let i = 0; i < 6; i++) {
      parent.appendChild(
        <i-hstack
          verticalAlignment="center"
          class="pointer p-item"
          padding={{top: 4, bottom: 4, left: 12, right: 12}}
          onClick={() => this.onParagraphClicked(i)}
        >
          <i-label caption={`Paragraph ${i + 1}`} font={{size: `${LARGE_SIZE - (i * 2)}px`}}></i-label>
        </i-hstack>
      )
    }
  }

  private toggleStopBtn(value: boolean) {
    this.btnStop.visible = value
    this.btnSend.visible = !value
    this.pnlWaiting.visible = value
    this.inputAIPrompt.visible = !value
  }

  private async readAllChunks(readableStream: ReadableStream) {
    const reader = readableStream.getReader()
    let done: boolean
    let value: Uint8Array
    while (!done) {
      ;({ value, done } = await reader.read())
      const valueString = new TextDecoder().decode(value)
      const lines = valueString.split('\n').filter((line) => line.trim() !== '')
      for (const line of lines) {
        if (this.isStopped) break
        const message = line.replace(/^data: /, '')
        if (message === '[DONE]') return
        try {
          const parsedMessage = JSON.parse(message)
          const text = parsedMessage.choices[0].text
          this.mdEditor.value = (this.mdEditor?.getMarkdownValue() || '') + text
        } catch (error) {
          console.error('Could not JSON parse stream message', message, error)
        }
      }
    }
  }

  private async sendAIPrompt() {
    this.isStopped = false
    if (!this.inputAIPrompt.value) return
    this.toggleStopBtn(true)
    try {
      const result = await fetchAIGeneratedText(this.inputAIPrompt.value)
      if (!this.isStopped) await this.readAllChunks(result)
    } catch {}
    this.inputAIPrompt.value = ''
    this.toggleStopBtn(false)
  }

  private async stopAPIPrompt() {
    this.isStopped = true
    this.inputAIPrompt.value = ''
    this.toggleStopBtn(false)
  }

  init() {
    super.init()
    this.content = this.getAttribute('content', true, '')
    const themeAttr = this.getAttribute('theme', true)
    if (themeAttr) this.theme = themeAttr
    const tag = this.getAttribute('tag', true)
    if (tag) this.setTag(tag)
    this.renderEditor()
  }

  render() {
    return (
      <i-panel
        id="wrapPnl"
      >
        <i-panel id={'pnlEditor'} />
        <i-hstack
          id={'pnlAIPrompt'}
          visible={false}
          width='100%'
          horizontalAlignment='space-between'
          verticalAlignment='center'
          padding={{
            top: '0.5rem',
            bottom: '0.5rem',
            left: '1rem',
            right: '1rem',
          }}
        >
          <i-vstack width='90%'>
            <i-hstack
              id='pnlWaiting'
              gap={4}
              verticalAlignment='center'
              minHeight={32}
              width='100%'
              height='auto'
              border={{
                width: '0.5px',
                style: 'solid',
                color: Theme.divider,
              }}
              background={{ color: Theme.input.background }}
              padding={{ left: '10px' }}
              visible={false}
            >
              <i-label
                font={{ size: '1.5rem', color: Theme.input.fontColor }}
                caption='AI is writing'
              ></i-label>
              <i-hstack gap={4} verticalAlignment='center' class='typing'>
                <i-icon
                  name='circle'
                  width={4}
                  height={4}
                  fill={Theme.input.fontColor}
                ></i-icon>
                <i-icon
                  name='circle'
                  width={4}
                  height={4}
                  fill={Theme.input.fontColor}
                ></i-icon>
                <i-icon
                  name='circle'
                  width={4}
                  height={4}
                  fill={Theme.input.fontColor}
                ></i-icon>
              </i-hstack>
            </i-hstack>
            <i-input
              id='inputAIPrompt'
              placeholder='Ask AI to edit or generate...'
              font={{ size: '1.5rem' }}
              height='auto'
              width='100%'
            ></i-input>
          </i-vstack>
          <i-button
            id='btnStop'
            caption='Stop'
            width='10%'
            visible={false}
            font={{ color: 'rgba(255,255,255)' }}
            padding={{
              top: '0.5rem',
              bottom: '0.5rem',
              left: '1rem',
              right: '1rem',
            }}
            onClick={this.stopAPIPrompt}
          ></i-button>
          <i-button
            id='btnSend'
            caption='Send'
            width='10%'
            font={{ color: 'rgba(255,255,255)' }}
            padding={{
              top: '0.5rem',
              bottom: '0.5rem',
              left: '1rem',
              right: '1rem',
            }}
            onClick={this.sendAIPrompt}
          ></i-button>
        </i-hstack>
      </i-panel>
    )
  }
}
