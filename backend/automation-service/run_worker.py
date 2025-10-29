#!/usr/bin/env python3
import asyncio
from services.async_processor import upload_processor

async def main():
    print("Starting Kafka Upload Worker...")
    await upload_processor.run()

if __name__ == "__main__":
    asyncio.run(main())
