import { Module, customModule, Container, VStack } from '@ijstech/components';
import ScomMarkdownEditor from '@scom/scom-markdown-editor'

@customModule
export default class Module1 extends Module {
    private editor: ScomMarkdownEditor;
    private mainStack: VStack;

    constructor(parent?: Container, options?: any) {
        super(parent, options);
    }

    async init() {
        super.init();
        this.editor = await ScomMarkdownEditor.create({
           width: 1170,
           height: 200,
           data: '<h3>New text</h3>',
           theme: "dark"
        });
        this.mainStack.appendChild(this.editor);
    }

    render() {
        return (
            <i-vstack id="mainStack" margin={{top: '1rem', left: '1rem'}} gap="2rem">
                <i-scom-markdown-editor
                    width={1180}
                    theme="light"
                    inline={true}
                ></i-scom-markdown-editor>
            </i-vstack>
        )
    }
}