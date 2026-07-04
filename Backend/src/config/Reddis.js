const redis = require("redis");

class InMemoryRedisMock {
    constructor() {
        this.store = new Map();
        this.expirations = new Map();
    }

    async connect() {
        console.warn("⚠️ Using In-Memory Redis Mock. Rate limiting and blacklisting will be kept in memory.");
        return this;
    }

    async exists(key) {
        this._checkExpiration(key);
        return this.store.has(key) ? 1 : 0;
    }

    async set(key, value, options = {}) {
        this.store.set(key, value);
        if (options.EX) {
            const expireTime = Date.now() + options.EX * 1000;
            this.expirations.set(key, expireTime);
        }
        return "OK";
    }

    async expireAt(key, timestamp) {
        const expireTime = timestamp * 1000;
        this.expirations.set(key, expireTime);
        return 1;
    }

    on(event, callback) {
        return this;
    }

    _checkExpiration(key) {
        if (this.expirations.has(key)) {
            const expireTime = this.expirations.get(key);
            if (Date.now() > expireTime) {
                this.store.delete(key);
                this.expirations.delete(key);
            }
        }
    }
}


class ResilientRedisClient {
    constructor() {
        this.activeClient = null;
        this.errorListeners = [];
    }

    on(event, callback) {
        if (event === 'error') {
            this.errorListeners.push(callback);
        }
        if (this.activeClient) {
            this.activeClient.on(event, callback);
        }
        return this;
    }

    async connect() {
        // 1. Try Cloud Redis
        if (process.env.REDIS_HOST_ID) {
            console.log(`Connecting to Cloud Redis (${process.env.REDIS_HOST_ID})...`);
            const cloudClient = redis.createClient({
                username: 'default',
                password: process.env.REDIS_PASS,
                socket: {
                    host: process.env.REDIS_HOST_ID,
                    port: 16597,
                    reconnectStrategy(retries) {
                        if (retries > 1) return new Error("Cloud Redis connection failed");
                        return 100;
                    }
                }
            });

            cloudClient.on('error', (err) => {
                if (this.activeClient === cloudClient) {
                    this.errorListeners.forEach(cb => cb(err));
                }
            });

            try {
                await cloudClient.connect();
                this.activeClient = cloudClient;
                console.log("✅ Connected to Cloud Redis successfully!");
                return;
            } catch (err) {
                console.warn(`❌ Cloud Redis connection failed: ${err.message}. Trying local Redis...`);
                try {
                    await cloudClient.disconnect();
                } catch (e) { }
            }
        }

        // 2. Try Local Redis
        console.log("Connecting to Local Redis (127.0.0.1:6379)...");
        const localClient = redis.createClient({
            socket: {
                host: "127.0.0.1",
                port: 6379,
                reconnectStrategy(retries) {
                    if (retries > 1) return new Error("Local Redis connection failed");
                    return 100;
                }
            }
        });

        localClient.on('error', (err) => {
            if (this.activeClient === localClient) {
                this.errorListeners.forEach(cb => cb(err));
            }
        });

        try {
            await localClient.connect();
            this.activeClient = localClient;
            console.log("✅ Connected to Local Redis successfully!");
            return;
        } catch (err) {
            console.warn(`❌ Local Redis connection failed: ${err.message}.`);
            try {
                await localClient.disconnect();
            } catch (e) { }
        }

        // 3. Fallback to In-Memory Mock
        const mockClient = new InMemoryRedisMock();
        await mockClient.connect();
        this.activeClient = mockClient;
    }

    async exists(...args) {
        return this.activeClient.exists(...args);
    }

    async set(...args) {
        return this.activeClient.set(...args);
    }

    async expireAt(...args) {
        return this.activeClient.expireAt(...args);
    }
}

const resilientClient = new ResilientRedisClient();
module.exports = resilientClient;
