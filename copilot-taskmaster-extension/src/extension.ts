import * as vscode from 'vscode';
import { TaskmasterClient } from './taskmaster/client';
import { TaskmasterParticipant } from './chat/TaskmasterParticipant';
import { CopilotAdapter } from './copilotAdapter';

export function activate(context: vscode.ExtensionContext) {
    // Instantiate the CopilotAdapter
    const copilotAdapter = new CopilotAdapter(/* pass dependencies if needed */);

    // Provide your MCP server URL here
    const serverUrl = 'ws://localhost:8080'; // TODO: Replace with actual MCP server URL
    const taskmasterClient = new TaskmasterClient(serverUrl, copilotAdapter);

    const participant = new TaskmasterParticipant(taskmasterClient);

    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-taskmaster.start', () => {
            taskmasterClient.connect();
            vscode.window.showInformationMessage('Connected to Taskmaster-AI MCP server.');
        }),

        vscode.commands.registerCommand('copilot-taskmaster.sendMessage', async () => {
            const message = await vscode.window.showInputBox({ prompt: 'Enter your message' });
            if (message) {
                participant.sendMessage(message);
            }
        }),

        vscode.commands.registerCommand('copilot-taskmaster.disconnect', () => {
            taskmasterClient.disconnect();
            vscode.window.showInformationMessage('Disconnected from Taskmaster-AI MCP server.');
        })
    );

    // Additional event listeners can be set up here
}

export function deactivate() {
    // Clean up resources if necessary
}