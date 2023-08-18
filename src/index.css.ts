import {Styles} from '@ijstech/components';

const Theme = Styles.Theme.ThemeVars;

Styles.cssRule('i-scom-markdown-editor', {
    overflow: 'hidden',
    outline: 'none',
    $nest: {
        'i-panel.container': {
            width: Theme.layout.container.width,
            maxWidth: Theme.layout.container.maxWidth,
            overflow: Theme.layout.container.overflow,
            textAlign: (Theme.layout.container.textAlign as any),
            margin: '0 auto'
        },
        'a': {
            display: 'initial'
        },
        // '.toastui-editor-dropdown-toolbar': {
        //     maxWidth: '100%',
        //     flexWrap: 'wrap',
        //     height: 'auto'
        // },
        ".toastui-editor-contents ul:has(li input[type='checkbox'])": {
            paddingLeft: 0,
        },
        ".toastui-editor-contents ul li:has(input[type='checkbox']):before": {
            content: "none",
        },
        '.toastui-editor-contents p': {
            color: Theme.text.primary
        },
        '#pnlEditorWrap': {
            $nest: {
                '.toastui-editor-defaultUI-toolbar': {
                    display: 'none'
                },
                '.toastui-editor-toolbar': {
                    display: 'none'
                },
                '.toastui-editor-defaultUI .ProseMirror': {
                    padding: '0.5rem'
                },
                '.toastui-editor-mode-switch': {
                    background: 'transparent'
                },
                ".toastui-editor-md-container": {
                    backgroundColor: "transparent"
                },
                ".toastui-editor-ww-container": {
                    backgroundColor: "transparent"
                },
                '.toastui-editor-contents': {
                    transition: 'all 125ms cubic-bezier(0.4,0,0.2,1)'
                },
                '.toastui-editor .ww-mode': {
                    transition: 'all 125ms cubic-bezier(0.4,0,0.2,1)'
                }
            }
        }
    }
});
