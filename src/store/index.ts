const state = {
    aiAPIUrl: '', 
    aiAPIKey: '' //FIXME: for demo only, to be removed later
}

export const setDataFromSCConfig = (options: any) => {
    if (options.aiAPIUrl) {
        state.aiAPIUrl = options.aiAPIUrl;
    }
    if (options.aiAPIUrl) {
        state.aiAPIKey = options.aiAPIKey;
    }
}

export const getAIAPIUrl = () => {
    return state.aiAPIUrl;
}

export const getAIAPIKey = () => {
    return state.aiAPIKey;
}