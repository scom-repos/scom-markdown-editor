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
  private levelMapper: {[key: number]: number} = {}
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
    const { backgroundColor, customBackgroundColor, textColor, customTextColor, textAlign } = value
    this.tag = { backgroundColor, customBackgroundColor, textColor, customTextColor, textAlign }
    this.updateMardown()
  }

  private updateMardown() {
    if (this.wrapPnl) {
      const { backgroundColor, customBackgroundColor, textColor, customTextColor, textAlign } = this.tag;
      this.wrapPnl.style.textAlign = textAlign || "left";
      if (backgroundColor && customBackgroundColor)
        this.style.setProperty('--custom-background-color', backgroundColor || '')
      else 
        this.style.removeProperty('--custom-background-color');
      if (textColor && customTextColor)
        this.style.setProperty('--custom-text-color', textColor);
      else 
        this.style.removeProperty('--custom-text-color');
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
      this.currentEditor.exec('customParagraph', { level })
      this.currentEditor.eventEmitter.emit('closePopup')
    }
  }

  private paragraphPlugin(context: any, options: any) {
    const container = document.createElement('div')
    this.createPDropdown(container)
    context.eventEmitter.listen('command', (type: string, params: any, options: any) => {
      if (type === 'color') {
        console.log('set colors', params)
        this.currentEditor.exec('color', params)
        this.currentEditor.exec('customParagraph', { level: -1 })
      }
    })
    return {
      markdownCommands: {
        customParagraph: ({ level }, state: any, dispatch: any) => {
          if (level === -1) return false
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
                } else if ((/class=\"p[1-6]\"/g).test(content)) {
                  const newText = content.replace(/class=\"p[1-6]\"/g, `class="p${level + 1}"`)
                  tr.replaceWith(pos - headingLength, pos + node.nodeSize - headingLength, schema.text(newText))
                  hasSet = true
                }
              }
            }
          })
          const mainNode = doc.child(pNode)
          if (!mainNode) return false
          if (!hasSet) {
            const textContent = mainNode.content.textBetween(0, mainNode.content.size, '\n').replace(/^\#+/g, '')
            const newContent = `${openTag}${textContent}${closeTag}`
            tr.replaceWith(fromPos, fromPos + mainNode.content.size, schema.text(newContent))
          }
          dispatch!(tr)
          return true
        }
      },
      wysiwygCommands: {
        customParagraph: ({ level }, state: any, dispatch: any) => {
          const { tr, selection, doc, schema } = state
          const nodeIndex = selection.$head.path[1]
          const nodePos = selection.$head.path[2]
          const currentLevel = level !== -1 ? level : this.levelMapper[nodeIndex]
          if (currentLevel === undefined || currentLevel === -1) return false
          this.levelMapper[nodeIndex] = level
          let node = doc.child(nodeIndex)
          if (node) {
            const attrs = { ...node.attrs, htmlAttrs: {class: `p${currentLevel + 1}`} }
            const pNode = schema.nodes.paragraph.create(attrs, node.content, node.marks)
            tr.replaceWith(nodePos, nodePos + node.nodeSize, pNode)
            const pMark = schema.marks.span.create(attrs)
            tr.addMark(nodePos, nodePos + pNode.nodeSize, pMark)
            node = doc.child(nodeIndex)
            node.descendants((childNode: any, childPos: number) => {
              if (childNode.marks.length) {
                for (let mark of childNode.marks) {
                  const htmlAttrs = {...(mark.attrs?.htmlAttrs || {}), class: `p${currentLevel + 1}`}
                  const newMark = schema.marks.span.create({...mark.attrs, htmlAttrs})
                  tr.addMark(nodePos + childPos + 1, nodePos + childPos + childNode.nodeSize + 1, newMark)
                }
              }
            })
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
        paragraph(node: any, context: any) {
          return context.entering
          ? { type: 'openTag', tagName: 'div', attributes: node.attrs!, classNames: ['custom-p'], outerNewLine: true, innerNewLine: true }
          : { type: 'closeTag', tagName: 'div', outerNewLine: true, innerNewLine: true }
        },
        htmlInline: {
          span(node: any, { entering }) {
            let attributes = {...node.attrs}
            if (!attributes.class && node.literal !== '</span>') {
              const firstChild = node.parent?.firstChild || null
              let className = ''
              if (firstChild) {
                const execData = (/^\<span class=\"(p[1-6])\"\>/g).exec(firstChild.literal || '')
                className = execData ? execData[1] : ''
                attributes.class = className
              }
            }
            const classNames = attributes.classNames || []
            if (attributes.class) classNames.push(attributes.class)
            return entering
              ? { type: 'openTag', tagName: 'span', attributes, classNames}
              : { type: 'closeTag', tagName: 'span' };
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
