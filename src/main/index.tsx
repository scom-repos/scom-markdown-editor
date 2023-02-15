import {
    Module,
    Panel,
    customModule,
    MarkdownEditor
} from '@ijstech/components';
import './index.css';
import { IConfigSchema, PageBlock } from '@markdown-editor/global';

export interface IConfigData {
    width?: string;
    height?: string;
    background?: string;
}

const configSchema: IConfigSchema = {
    type: 'object',
    properties: {
        width: {
            type: 'string',
        },
        height: {
            type: 'string',
        },
        background: {
            type: 'string',
        }
    }
}

@customModule
export class MarkdownBlock extends Module implements PageBlock {
    private data: any;
    private pnlMarkdownEditor: Panel;
    private pnlEditor: Panel;
    private pnlViewer: Panel;
    private mdEditor: MarkdownEditor;
    private mdViewer: MarkdownEditor;
    tag: any;
    defaultEdit: boolean = true;
    private isEditing: boolean = false;

    readonly onEdit: () => Promise<void>;
    readonly onConfirm: () => Promise<void>;
    readonly onDiscard: () => Promise<void>;

    async init() {
        super.init();
        if (!this.data) {
            await this.renderEditor();
            this.renderEmptyPnl();
        }
    }

    getConfigSchema() {
        return configSchema;
    }

    getActions() {
        const actions = [
            {
                name: 'Edit',
                icon: 'edit',
                visible: () => !this.isEditing,
                command: (builder: any, userInputData: any) => {
                    return {
                        execute: () => {
                            this.edit();
                            if (builder) {
                                builder.classList.add('is-editing');
                                const section = builder.closest('ide-section');
                                section && (section.style.height = 'auto');
                            }
                        },
                        undo: () => {
                        },
                        redo: () => {}
                    }
                },
                userInputDataSchema: {}
            },
            {
                name: 'Confirm',
                icon: 'check',
                visible: () => this.isEditing,
                command: (builder: any, userInputData: any) => {
                    return {
                        execute: () => {
                            this.confirm();
                            if (builder) {
                                builder.classList.remove('is-editing');
                                const section = builder.closest('ide-section');
                                section && (section.style.height = 'auto');
                            }
                        },
                        undo: () => {
                        },
                        redo: () => {}
                    }
                },
                userInputDataSchema: {}
            }
        ];
        return actions;
    }

    async onConfigSave(config: IConfigData) {
        this.tag = config;
        this.updateMarkdown(config);
    }

    updateMarkdown(config: IConfigData) {
        if (!config) return;
        const { width, height, background } = config;
        if (this.pnlMarkdownEditor) {
            this.pnlMarkdownEditor.background.color = background;
        }
        if (this.mdEditor) {
            if (width) this.mdEditor.width = width;
            if (height) this.mdEditor.height = height;
        }
        if (this.mdViewer) {
            if (width) this.mdViewer.width = width;
            // Using style because mode view doesnt have height attribute
            if (height) this.mdViewer.style.height = height;
        }
    }

    getData() {
        return {
            content: this.data
        };
    }

    private renderEmptyPnl() {
        this.pnlViewer.clearInnerHTML();
        if (this.pnlViewer.visible)
            this.pnlViewer.appendChild(
                <i-label
                    caption="Click to edit text"
                    opacity={0.5} display="block"
                    padding={{top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem'}}
                ></i-label>
            );
    }

    async setData(value: any) {
        this.data = value.content || '';
        this.tag = {...this.tag, width: value.width, height: value.height};
        this.pnlEditor.visible = this.isEditing;
        this.pnlViewer.visible = !this.isEditing;
        if (!this.data) {
            this.renderEmptyPnl();
            return;
        };
        const { width, height } = this.tag || {};
        if (!this.mdViewer) {
            this.mdViewer = await MarkdownEditor.create({
                viewer: true,
                value: this.data,
                width,
                height
            });
            this.mdViewer.display = 'block';
            if (height) this.mdViewer.style.height = height;
            this.pnlViewer.clearInnerHTML();
            this.pnlViewer.appendChild(this.mdViewer);
        } else {
            this.pnlViewer.clearInnerHTML();
            this.pnlViewer.appendChild(this.mdViewer);
            this.mdViewer.value = this.data;
        }
    }

    getTag() {
        return this.tag;
    }

    async setTag(value: any) {
        this.tag = value;
        this.updateMarkdown(value);
    }

    async edit() {
        // this.pnlEditor.visible = true;
        // this.pnlViewer.visible = false;
        this.isEditing = true;
        this.renderEditor();
    }

    async confirm() {
        // this.pnlEditor.visible = false;
        // this.pnlViewer.visible = true;
        this.isEditing = false;
        await this.setData({
            content: this.mdEditor?.getMarkdownValue() || ''
        });
        const builder = this.parent.closest('ide-toolbar') as any;
        builder && builder.setData({content: this.data});
    }

    async discard() {
        // this.pnlEditor.visible = false;
        // this.pnlViewer.visible = true;
        this.isEditing = false;
        await this.setData({
            content: this.data
        });
        const builder = this.parent.closest('ide-toolbar') as any;
        builder && builder.setData({content: this.data});
    }

    validate() {
        if (this.mdEditor && this.mdEditor.getMarkdownValue()) {
            return true;
        }
        return false;
    }

    async renderEditor() {
        const { width, height } = this.tag || {};
        if (!this.mdEditor) {
            this.mdEditor = await MarkdownEditor.create({
                value: this.data,
                mode: 'wysiwyg',
                width,
                height
            });
            this.mdEditor.display = 'block';
            this.pnlEditor.clearInnerHTML();
            this.pnlEditor.appendChild(this.mdEditor);
        } else {
            this.mdEditor.value = this.data;
        }
        this.pnlEditor.visible = this.isEditing;
        this.pnlViewer.visible = !this.isEditing;
    }

    render() {
        return (
            <i-panel id="pnlMarkdownEditor">
                <i-panel id={'pnlEditor'} padding={{ top: 15, bottom: 15, left: 30, right: 30 }} />
                <i-panel id={'pnlViewer'} minHeight={20}/>
            </i-panel>
        );
    }
}
