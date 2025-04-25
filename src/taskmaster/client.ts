import { CopilotAdapter } from '../copilotAdapter';
import { formatMCPRequest, parseMCPResponse, formatMCPCompletionResponse, isLLMRequest } from '../mcp/protocol';

class TaskmasterClient {
    private serverUrl: string;
    private connection: WebSocket | null;
    private copilotAdapter: CopilotAdapter;

    constructor(serverUrl: string, copilotAdapter: CopilotAdapter) {
        this.serverUrl = serverUrl;
        this.connection = null;
        this.copilotAdapter = copilotAdapter;
    }

    connect(): void {
        this.connection = new WebSocket(this.serverUrl);

        this.connection.onopen = () => {
            console.log('Connected to Taskmaster-AI MCP server');
        };

        this.connection.onmessage = (event) => {
            this.handleMessage(event.data);
        };

        this.connection.onclose = () => {
            console.log('Disconnected from Taskmaster-AI MCP server');
        };

        this.connection.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    }

    disconnect(): void {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
    }

    sendRequest(request: any): void {
        if (this.connection && this.connection.readyState === WebSocket.OPEN) {
            this.connection.send(JSON.stringify(request));
        } else {
            console.error('Connection is not open. Unable to send request.');
        }
    }

    private async handleMessage(message: string): Promise<void> {
        const data = JSON.parse(message);
        if (isLLMRequest(data)) {
            const prompt = data.prompt;
            const requestId = data.requestId || '';
            try {
                const completion = await this.copilotAdapter.sendPrompt(prompt);
                const response = formatMCPCompletionResponse(requestId, completion);
                this.sendRequest(response);
            } catch (err) {
                const errorResponse = formatMCPCompletionResponse(requestId, '[Error] Copilot LLM failed: ' + (err instanceof Error ? err.message : String(err)));
                this.sendRequest(errorResponse);
            }
        } else {
            console.log('Received message:', data);
        }
    }
}

export default TaskmasterClient;