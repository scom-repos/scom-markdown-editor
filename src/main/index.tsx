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

    readonly onEdit: () => Promise<void>;
    readonly onConfirm: () => Promise<void>;
    readonly onDiscard: () => Promise<void>;

    async init() {
        super.init();
        if (!this.data) {
            this.renderEditor();
        }
    }

    getConfigSchema() {
        return configSchema;
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
        return this.data;
    }

    async setData(value: any) {
        this.data = value || '';
        if (!this.data) {
            this.pnlEditor.visible = true;
            this.pnlViewer.visible = false;
            return;
        };
        this.pnlEditor.visible = false;
        this.pnlViewer.visible = true;
        const { width, height } = this.tag || {};
        if (!this.mdViewer) {
            this.mdViewer = await MarkdownEditor.create({
                viewer: true,
                value: this.data,
                width,
            });
            this.mdViewer.display = 'block';
            if (height) this.mdViewer.style.height = height;
            this.pnlViewer.clearInnerHTML();
            this.pnlViewer.appendChild(this.mdViewer);
        } else {
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
        this.pnlEditor.visible = true;
        this.pnlViewer.visible = false;
        this.renderEditor();
    }

    async confirm() {
        this.pnlEditor.visible = false;
        this.pnlViewer.visible = true;
        await this.setData(this.mdEditor?.getMarkdownValue() || '');
    }

    async discard() {
        this.pnlEditor.visible = false;
        this.pnlViewer.visible = true;
        await this.setData(this.data);
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
    }

    render() {
        return (
            <i-panel id="pnlMarkdownEditor">
                <i-panel id={'pnlEditor'} padding={{ top: 15, bottom: 15, left: 30, right: 30 }} />
                <i-panel id={'pnlViewer'} />
            </i-panel>
        );
    }
}
