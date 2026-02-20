import asyncio
from httpx import AsyncClient

async def run():
    async with AsyncClient(base_url="http://127.0.0.1:5000") as client:
        # Note: replace with a real token you can grab from the frontend if needed
        response = await client.get("/api/user/progress", headers={"Authorization": "Bearer TEST_TOKEN"})
        print("Status", response.status_code)
        print("Text", response.text)

asyncio.run(run())
