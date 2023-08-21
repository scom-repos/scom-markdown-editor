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
        theme: this.theme
      })
      this.mdEditor.display = 'block'
      this.pnlEditor.clearInnerHTML()
      this.pnlEditor.appendChild(this.mdEditor)
    }
    this.mdEditor.value = this._data
    this.mdEditor.theme = this.theme
    this.updateMardown()
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
        <i-panel
          id={'pnlEditor'}
        >
          <i-markdown-editor
            id="mdEditor"
            width='100%'
            height='auto'
            mode='wysiwyg'
          ></i-markdown-editor>
        </i-panel>
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
