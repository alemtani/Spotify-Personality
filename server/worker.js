let throng = require('throng');
let Queue = require("bull");

const {getGenres, getProbs} = require('./crawler');

// Connect to a local redis instance locally, and the Heroku-provided URL in production
let REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// Spin up multiple processes to handle jobs to take advantage of more CPU cores
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
let workers = process.env.WEB_CONCURRENCY || 2;

function start() {
  // Connect to the named work queue
  let workQueue = new Queue('work', REDIS_URL);

  workQueue.process(async (job) => {
    console.log('Processing job', job.id, job.data);

    const [genres, probs] = await Promise.all([getGenres(), getProbs()]);

    job.data.genres = genres;
    job.data.probs = probs;

    console.log('Ending job ' + JSON.stringify(job.data));
    
    return {data: job.data};
  });
}

// Initialize the clustered worker process
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
throng({ workers, start });