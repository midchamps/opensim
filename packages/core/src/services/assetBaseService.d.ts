/**
 * Base Service Class
 * Provides common functionality for all generation services
 */
/** Loose shape returned by Tongyi/Doubao async-task polling endpoints. */
export interface TaskPollResult {
    output?: {
        task_status?: string;
        message?: string;
        task_id?: string;
        results?: Array<{
            url?: string;
            [key: string]: unknown;
        }>;
        choices?: Array<{
            message?: {
                content?: unknown;
            };
            [key: string]: unknown;
        }>;
        video_url?: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}
export declare abstract class BaseService {
    protected logger: Console;
    protected fetchWithRetry(url: string, options: RequestInit, maxRetries?: number, retryDelay?: number): Promise<Response>;
    protected sleep(ms: number): Promise<void>;
    protected downloadToBuffer(url: string): Promise<Buffer>;
    protected pollTaskStatus(taskUrl: string, headers: Record<string, string>, timeoutMs?: number, pollInterval?: number): Promise<TaskPollResult>;
    protected log(message: string, level?: 'info' | 'warn' | 'error'): void;
}
