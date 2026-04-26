/**
 * Base Service Class
 * Provides common functionality for all generation services
 */
export class BaseService {
    logger = console;
    async fetchWithRetry(url, options, maxRetries = 3, retryDelay = 2000) {
        for (let i = 0; i <= maxRetries; i++) {
            try {
                const res = await fetch(url, options);
                // Rate limit handling
                if (res.status === 429) {
                    const delay = retryDelay * Math.pow(2, i);
                    this.logger.warn(`Rate limited, retrying in ${delay}ms...`);
                    await this.sleep(delay);
                    continue;
                }
                if (!res.ok && i < maxRetries) {
                    this.logger.warn(`Request failed with ${res.status}, retrying...`);
                    await this.sleep(retryDelay);
                    continue;
                }
                return res;
            }
            catch (error) {
                if (i === maxRetries)
                    throw error;
                this.logger.warn(`Request error, retrying... Error: ${error}`);
                await this.sleep(retryDelay);
            }
        }
        throw new Error('Request failed after max retries');
    }
    async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async downloadToBuffer(url) {
        const response = await this.fetchWithRetry(url, {});
        if (!response.ok) {
            throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
    }
    async pollTaskStatus(taskUrl, headers, timeoutMs = 120000, pollInterval = 2000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeoutMs) {
            await this.sleep(pollInterval);
            const res = await fetch(taskUrl, { headers });
            if (!res.ok) {
                this.logger.warn(`Task poll failed: ${res.status}`);
                continue;
            }
            const data = (await res.json());
            const status = data.output?.task_status;
            if (status === 'SUCCEEDED') {
                return data;
            }
            if (status === 'FAILED') {
                throw new Error(`Task failed: ${data.output?.message || 'Unknown error'}`);
            }
        }
        throw new Error(`Task timed out after ${timeoutMs}ms`);
    }
    log(message, level = 'info') {
        const prefix = `[${this.constructor.name}]`;
        switch (level) {
            case 'warn':
                this.logger.warn(`${prefix} ${message}`);
                break;
            case 'error':
                this.logger.error(`${prefix} ${message}`);
                break;
            default:
                this.logger.log(`${prefix} ${message}`);
        }
    }
}
//# sourceMappingURL=assetBaseService.js.map