import DatabaseQueue from "./database-queue";

const db_queue = new DatabaseQueue(process.env.REDIS_URL);

console.log('db queue worker stared, waiting for job');

db_queue['queue'].on('completed', (job) => {
    console.log(`Job completed: ${job.id} | Type: ${job.name}`);
});

db_queue['queue'].on('failed', (job, err) => {
    console.error(`Job failed: ${job?.id} | Type: ${job?.name} | Error: ${err}`);
});

db_queue['queue'].on('error', (err) => {
    console.error('Queue error:', err);
});

process.on('SIGINT', async () => {
    console.log('Shutting down DatabaseQueue worker...');
    await db_queue.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('Shutting down DatabaseQueue worker...');
    await db_queue.close();
    process.exit(0);
});