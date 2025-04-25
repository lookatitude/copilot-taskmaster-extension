import { CopilotAdapter } from '../copilotAdapter';
import { formatMCPRequest, parseMCPResponse } from '../mcp/protocol';

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
        // Example: Intercept LLM request type
        if (data.type === 'llm_request') {
            const prompt = data.prompt;
            const completion = await this.copilotAdapter.sendPrompt(prompt);
            const response = formatMCPRequest(completion);
            this.sendRequest(response);
        } else {
            console.log('Received message:', data);
        }
    }
}

export default TaskmasterClient;