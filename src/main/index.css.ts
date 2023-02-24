import {Styles} from '@ijstech/components';

const Theme = Styles.Theme.ThemeVars;

Styles.cssRule('#pnlMarkdownEditor', {
    $nest: {
        'i-panel.container': {
            width: Theme.layout.container.width,
            maxWidth: Theme.layout.container.maxWidth,
            overflow: Theme.layout.container.overflow,
            textAlign: (Theme.layout.container.textAlign as any),
            margin: '0 auto'
        },
        '#inputAIPrompt': {
            width: '90% !important' 
        },        
        '#inputAIPrompt > input': {
            width: '100% !important'
        }
    }
});
