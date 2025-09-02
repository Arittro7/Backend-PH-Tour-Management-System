import { createClient } from 'redis';
import { envVars } from './env';

export const redisClient = createClient({ //For convenient rename client as RedisClient 
    username: envVars.REDIS_USERNAME,
    password: envVars.REDIS_PASSWORD,
    socket: {
        host: envVars.REDIS_HOST,
        port: Number(envVars.REDIS_PORT) // as all envVars are string 
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));

// await client.connect(); //`Moved to connectRedis fn👇🏾

// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar

//to resolve the top-level error add the following code
export const connectRedis = async () => {
  if(!redisClient.isOpen){
    await redisClient.connect();
    console.log("Redis Connected");
  }
}

// This connectRedis fn will call in server.ts along with startServer & seedSuperAdmin