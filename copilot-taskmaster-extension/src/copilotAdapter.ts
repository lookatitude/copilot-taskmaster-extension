import * as vscode from 'vscode';

// Adapter for sending prompts to Copilot Chat and receiving completions
// This is a code outline. Implementation will depend on Copilot Chat API availability.

export class CopilotAdapter {
    constructor() {}

    async sendPrompt(prompt: string): Promise<string> {
        // Try to use VS Code's chat API to send a prompt to Copilot Chat
        // This is a best-effort implementation; command may change in the future
        try {
            // The following command is not officially documented and may not be stable
            // 'github.copilotChat.send' is used in some Copilot Chat extension versions
            const response = await vscode.commands.executeCommand<any>(
                'github.copilotChat.send',
                { prompt }
            );
            // Try to extract the completion from the response
            if (response && typeof response === 'object' && response.text) {
                return response.text;
            } else if (typeof response === 'string') {
                return response;
            }
            // Fallback: stringify response
            return JSON.stringify(response);
        } catch (err) {
            // If the command is not available, return an error message
            return '[CopilotAdapter] Unable to get completion from Copilot Chat: ' + (err instanceof Error ? err.message : String(err));
        }
    }
}
