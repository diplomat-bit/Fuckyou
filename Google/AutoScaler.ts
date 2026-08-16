import os from 'os';
import v8 from 'v8';
import { EventEmitter } from 'events';
import { monitor } from './MonitoringService';
import { pubSub } from './PubSubLocal';
import { computeOrchestrator } from './ComputeOrchestrator';

/**
 * AutoScaler.ts
 * 
 * A local, high-performance resource monitoring and scaling engine designed 
 * to replace Google Cloud Auto Scaling. This module manages local process 
 * orchestration, memory pressure, and CPU affinity to ensure the Oko-main 
 * infrastructure remains performant without external cloud dependencies.
 */

interface ScalingMetrics {
    cpuUsage: number;
    memoryUsage: number;
    activeThreads: number;
    loadAverage: number[];
}

class AutoScaler extends EventEmitter {
    private static instance: AutoScaler;
    private thresholds = {
        cpu: 0.85,
        memory: 0.90,
        load: 4.0
    };

    private constructor() {
        super();
        this.initializeMonitoring();
    }

    public static getInstance(): AutoScaler {
        if (!AutoScaler.instance) {
            AutoScaler.instance = new AutoScaler();
        }
        return AutoScaler.instance;
    }

    private async getSystemMetrics(): Promise<ScalingMetrics> {
        const load = os.loadavg();
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const memoryUsage = (totalMem - freeMem) / totalMem;
        const activeThreads = os.cpus().length;
        
        return {
            cpuUsage: load[0] / activeThreads, // Normalized load average
            memoryUsage,
            activeThreads,
            loadAverage: load
        };
    }

    private async scaleResources(metrics: ScalingMetrics): Promise<void> {
        // Log metrics to the central monitoring service
        monitor.log('info', 'AutoScaler', 'System metrics collected', { metrics });

        // Publish metrics to local PubSub for other services to consume
        pubSub.publish('metrics/system', metrics);

        if (metrics.memoryUsage > this.thresholds.memory) {
            this.emit('pressure', 'MEMORY_CRITICAL');
            monitor.log('warn', 'AutoScaler', `Memory pressure critical: ${(metrics.memoryUsage * 100).toFixed(2)}%`, { metrics });
            pubSub.publish('scaling/pressure', { type: 'MEMORY_CRITICAL', metrics });
            await this.garbageCollect();
        }

        if (metrics.loadAverage[0] > this.thresholds.load) {
            this.emit('pressure', 'CPU_THROTTLING_REQUIRED');
            monitor.log('warn', 'AutoScaler', `CPU load average critical: ${metrics.loadAverage[0]}`, { metrics });
            pubSub.publish('scaling/pressure', { type: 'CPU_THROTTLING_REQUIRED', metrics });
            this.throttleNonEssentialServices();
        }
    }

    private async garbageCollect(): Promise<void> {
        if (typeof global !== 'undefined' && (global as any).gc) {
            monitor.log('info', 'AutoScaler', 'Triggering manual garbage collection');
            (global as any).gc();
        } else {
            monitor.log('warn', 'AutoScaler', 'Manual garbage collection is not exposed. Run Node with --expose-gc');
        }
    }

    private throttleNonEssentialServices(): void {
        console.warn("[AutoScaler] Throttling non-essential background processes...");
        monitor.log('warn', 'AutoScaler', 'Throttling non-essential background processes due to high CPU load');
        pubSub.publish('scaling/action', { action: 'THROTTLE_NON_ESSENTIAL', timestamp: Date.now() });
    }

    private initializeMonitoring(): void {
        setInterval(async () => {
            try {
                const metrics = await this.getSystemMetrics();
                await this.scaleResources(metrics);
            } catch (error) {
                console.error("[AutoScaler] Monitoring Error:", error);
                monitor.log('error', 'AutoScaler', 'Monitoring loop encountered an error', { error: error instanceof Error ? error.message : String(error) });
            }
        }, 5000);
    }

    public getStatus(): object {
        return {
            status: 'OPERATIONAL',
            provider: 'LOCAL_NATIVE_SCALER',
            version: '1.0.0',
            thresholds: this.thresholds,
            monitoringIntervalMs: 5000
        };
    }
}

export const autoScaler = AutoScaler.getInstance();
export default autoScaler;