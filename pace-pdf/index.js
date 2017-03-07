const Redis = require('ioredis');
const redis = new Redis(6379, 'redis');

redis.subscribe('pdf', 'info', (err, count) => {});

redis.on('message', (channel, message) => {
    console.log(`Receive message ${message} from channel ${channel}`);
});
