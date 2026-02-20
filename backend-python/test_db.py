import asyncio
from src.core.database import get_db
from src.models import User, Notification
from sqlalchemy.future import select

async def main():
    print("Testing models import...", User.notifications)
    
if __name__ == "__main__":
    asyncio.run(main())
