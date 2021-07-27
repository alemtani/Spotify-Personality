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

  // workQueue.process(async (job) => {
  //   console.log('Beginning job', job.id);

  //   await Promise.all([getGenres(job), getProbs()])
  //   .then(data => {
  //     console.log(data);
  //     return data;
  //   })
  //   .catch(err => {
  //     console.log(err);
  //     throw err;
  //   });
  // });

  workQueue.process('./crawler');
}

// Initialize the clustered worker process
// See: https://devcenter.heroku.com/articles/node-concurrency for more info
throng({ workers, start });