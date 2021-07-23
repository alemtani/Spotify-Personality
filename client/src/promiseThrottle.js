import PromiseThrottle from 'promise-throttle';

// Promise Throttle is a library that limits the rate of requests
export default new PromiseThrottle({
    requestsPerSecond: 5
});