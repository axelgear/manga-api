import Redis from 'ioredis';
// Create a Redis client
const redis = new Redis({
  host: '127.0.0.1', // Your Redis host
  port: 6379, // Your Redis port
  password: 'Rv3JhWb654nJ0B3VrkjUOKA2ksF1p1', // Redis password (if set)
});
export default redis;
