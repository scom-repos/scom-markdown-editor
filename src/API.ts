import { getAIAPIKey, getAIAPIUrl } from "./store";

async function fetchAIGeneratedText(prompt: string) {
    const APIUrl = getAIAPIUrl();
    const APIKey = getAIAPIKey();
    const response = await fetch(APIUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'OpenAI/NodeJS/3.1.0',
            Authorization: `Bearer ${APIKey}`  
        },
        body: JSON.stringify({
            "model":"text-davinci-003",
            "prompt": prompt,
            "temperature":0.7,
            "max_tokens":3000,
            "top_p":1,
            "frequency_penalty":0,
            "presence_penalty":0,
            "stream":true
        })
    })
    // const result = await response.json();
    // const answer: string = result.choices[0]?.text?.replaceAll('\n', '');
    return response.body;
}

export {
    fetchAIGeneratedText
}