import toolCall from "./tool-call";

type RawEvent = {
    body: string;
}

type ParsedEvent = {
    args: {
        scrapegraph_function: string;
        link: string;
        optional_argument?: string;
    };
    secrets: {
        SGAI_API_KEY: string;
    };
}

export async function handler(event: RawEvent) {
    const {
        args: {
            scrapegraph_function,
            link,
            optional_argument
        },
        secrets: {
            SGAI_API_KEY
        }
    } = JSON.parse(event.body) as ParsedEvent;

    try {
        const result = await toolCall(scrapegraph_function, link, SGAI_API_KEY, optional_argument)

        return {
            statusCode: 200,
            body: JSON.stringify(result),
        };
    } catch (error: unknown) {
        let message = '';

        if (error instanceof Error) {
            message = error.message;
        } else {
            message = 'Unknown error';
        }

        return {
            statusCode: 500,
            body: JSON.stringify(message),
        };
    }
}
