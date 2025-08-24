import { createClient } from 'redis';

const redis = createClient({
    username: 'default',
    password: 'Y0Y8uP59lv7vGeqD9PdUiFVe9lEDF4dv',
    socket: {
        host: 'redis-10745.c14.us-east-1-2.ec2.redns.redis-cloud.com',
        port: 10745
    }
});

redis.on('error', err => console.log('❌ Redis Client Error', err));

redis.on('connect', ()=> console.log('✅ Redis connected-new'))
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

