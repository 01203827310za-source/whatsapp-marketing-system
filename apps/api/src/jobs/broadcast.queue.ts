import { type BulkJobOptions, type ConnectionOptions, Queue } from "bullmq";
import { env } from "../config/env";
import { processBroadcastJob } from "./broadcast.processor";

export interface BroadcastJobData {
  campaignId: string;
  customerId: string;
}

export interface BroadcastBulkJob {
  name: string;
  data: BroadcastJobData;
  opts?: BulkJobOptions;
}

export interface BroadcastQueue {
  addBulk(jobs: BroadcastBulkJob[]): Promise<unknown>;
}

export const isMemoryQueue = env.REDIS_URL === "memory";

const parseRedisConnection = (url: string): ConnectionOptions => {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port || 6379),
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    maxRetriesPerRequest: null
  };
};

export const redisConnection = isMemoryQueue ? undefined : parseRedisConnection(env.REDIS_URL);

export const broadcastQueue: BroadcastQueue = isMemoryQueue
  ? {
      async addBulk(jobs: BroadcastBulkJob[]) {
        for (const job of jobs) {
          const delay = job.opts?.delay ?? 0;
          setTimeout(() => {
            processBroadcastJob(job.data).catch((error) => console.error("Memory broadcast job failed", error));
          }, delay);
        }
        return jobs;
      }
    }
  : (new Queue<BroadcastJobData>("broadcast", {
      connection: redisConnection!,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: 1000,
        removeOnFail: 5000
      }
    }) as unknown as BroadcastQueue);
