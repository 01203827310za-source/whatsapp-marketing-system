import { Worker } from "bullmq";
import { env } from "../config/env";
import { isMemoryQueue, redisConnection, type BroadcastJobData } from "./broadcast.queue";
import { markFailedIfExhausted, processBroadcastJob } from "./broadcast.processor";

if (!isMemoryQueue) {
  const worker = new Worker<BroadcastJobData>(
    "broadcast",
    async (job) => processBroadcastJob(job.data, job.attemptsMade),
    {
      connection: redisConnection!,
      concurrency: env.BROADCAST_BATCH_SIZE,
      limiter: { max: env.BROADCAST_BATCH_SIZE, duration: env.BROADCAST_DELAY_MS }
    }
  );

  worker.on("failed", markFailedIfExhausted);
}

console.log(isMemoryQueue ? "Broadcast memory queue active" : "Broadcast worker started");
