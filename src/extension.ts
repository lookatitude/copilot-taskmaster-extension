import * as vscode from 'vscode';
import TaskmasterClient from './taskmaster/client';
import TaskmasterParticipant from './chat/TaskmasterParticipant';
import { CopilotAdapter } from './copilotAdapter';

export function activate(context: vscode.ExtensionContext) {
    // Instantiate the CopilotAdapter
    const copilotAdapter = new CopilotAdapter(/* pass dependencies if needed */);

    // Dynamically determine the MCP server URL from user settings
    const config = vscode.workspace.getConfiguration('mcp');
    let serverUrl = 'ws://localhost:8080';
    try {
        const servers = config.get<any>('servers');
        const taskmaster = servers && servers['taskmaster-ai'];
        if (taskmaster && Array.isArray(taskmaster.args)) {
            // Try to find a --port or -p argument
            let port: string | undefined;
            for (let i = 0; i < taskmaster.args.length; i++) {
                if (taskmaster.args[i] === '--port' || taskmaster.args[i] === '-p') {
                    port = taskmaster.args[i + 1];
                    break;
                }
            }
            if (port) {
                serverUrl = `ws://localhost:${port}`;
            }
        }
    } catch (e) {
        // fallback to default
    }
    const taskmasterClient = new TaskmasterClient(serverUrl, copilotAdapter);

    const participant = new TaskmasterParticipant(serverUrl);

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