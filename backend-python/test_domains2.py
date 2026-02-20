import asyncio
from httpx import AsyncClient

async def run():
    async with AsyncClient(base_url="http://127.0.0.1:8000") as client:
        # Request domains endpoint with and without trailing slash
        res1 = await client.get("/api/domains")
        print("GET /api/domains ->", res1.status_code, dict(res1.headers))
        
        res2 = await client.get("/api/domains/")
        print("GET /api/domains/ ->", res2.status_code, dict(res2.headers))

asyncio.run(run())
