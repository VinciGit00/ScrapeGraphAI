interface ScrapeGraphResponse {
    success: boolean;
    data?: any;
    error?: string;
}

export default async function toolCall(
    scrapegraph_function: string, 
    link: string, 
    SGAI_API_KEY: string, 
    optional_argument?: string
): Promise<string> {
    console.log(`Calling ScrapeGraphAI function: ${scrapegraph_function} for URL: ${link}`);

    const baseUrl = 'https://api.scrapegraphai.com/v1';
    const headers = {
        'accept': 'application/json',
        'Content-Type': 'application/json',
        'sgai-apikey': SGAI_API_KEY
    };

    let endpoint: string;
    let payload: any = {};

    try {
        // Parse optional arguments if provided
        const optionalArgs = optional_argument ? JSON.parse(optional_argument) : {};

        switch (scrapegraph_function.toLowerCase()) {
            case 'smartscraper':
                endpoint = `${baseUrl}/smartscraper`;
                payload = {
                    website_url: link,
                    user_prompt: optionalArgs.user_prompt || optionalArgs.prompt || "Extract all relevant information from this webpage",
                    ...optionalArgs
                };
                break;

            case 'searchscraper':
                endpoint = `${baseUrl}/searchscraper`;
                payload = {
                    user_prompt: optionalArgs.user_prompt || optionalArgs.prompt || "Search and extract relevant information",
                    num_results: optionalArgs.num_results || 3,
                    ...optionalArgs
                };
                break;

            case 'crawl':
            case 'smartcrawler':
                endpoint = `${baseUrl}/crawl`;
                payload = {
                    url: link,
                    prompt: optionalArgs.prompt || optionalArgs.user_prompt || "Extract relevant information from this website",
                    extraction_mode: optionalArgs.extraction_mode !== undefined ? optionalArgs.extraction_mode : true,
                    cache_website: optionalArgs.cache_website !== undefined ? optionalArgs.cache_website : true,
                    depth: optionalArgs.depth || 2,
                    max_pages: optionalArgs.max_pages || 10,
                    same_domain_only: optionalArgs.same_domain_only !== undefined ? optionalArgs.same_domain_only : true,
                    ...optionalArgs
                };
                break;

            case 'agenticscraper':
                endpoint = `${baseUrl}/agenticscraper`;
                payload = {
                    url: link,
                    steps: optionalArgs.steps || [],
                    use_session: optionalArgs.use_session !== undefined ? optionalArgs.use_session : false,
                    ai_extraction: optionalArgs.ai_extraction !== undefined ? optionalArgs.ai_extraction : true,
                    user_prompt: optionalArgs.user_prompt || optionalArgs.prompt || "Extract relevant information",
                    ...optionalArgs
                };
                break;

            case 'markdownify':
                endpoint = `${baseUrl}/markdownify`;
                payload = {
                    website_url: link,
                    ...optionalArgs
                };
                break;

            case 'scrape':
                endpoint = `${baseUrl}/scrape`;
                payload = {
                    website_url: link,
                    render_heavy_js: optionalArgs.render_heavy_js !== undefined ? optionalArgs.render_heavy_js : false,
                    ...optionalArgs
                };
                break;

            default:
                throw new Error(`Unknown ScrapeGraphAI function: ${scrapegraph_function}`);
        }

        console.log(`Making request to: ${endpoint}`);
        console.log(`Payload:`, JSON.stringify(payload, null, 2));

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        return JSON.stringify(result, null, 2);

    } catch (error) {
        console.error('Error in ScrapeGraphAI call:', error);
        const errorResponse: ScrapeGraphResponse = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
        };
        return JSON.stringify(errorResponse, null, 2);
    }
}
