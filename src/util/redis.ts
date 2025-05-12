import { createClient } from 'redis';

const redis = createClient({
    username: 'default',
    password: 'Y0Y8uP59lv7vGeqD9PdUiFVe9lEDF4dv',
    socket: {
        host: 'redis-10745.c14.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 10745
    }
    // socket: {
    //     host: process.env.REDIS_HOST || '3.93.234.164',
    //     port: parseInt(process.env.REDIS_PORT || '10745'),
    //     reconnectStrategy: retries => retries > 5 ? false : Math.min(retries * 100, 3000)
    //   }
});

redis.on('error', err => console.log('❌ Redis Client Error', err));

redis.on('connect', ()=> console.log('✅ Redis connected'))
// await client.connect();

async function connectRedis() {
    try {
        await redis.connect(); 
    } catch (error) { 
    }
}

connectRedis()
// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar

export default redis

