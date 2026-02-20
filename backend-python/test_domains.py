import asyncio
from httpx import AsyncClient

async def run():
    async with AsyncClient(base_url="http://127.0.0.1:8000") as client:
        # Request domains endpoint
        response = await client.get("/api/domains")
        print("Status", response.status_code)

asyncio.run(run())
