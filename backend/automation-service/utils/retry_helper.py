import asyncio
import functools
from typing import Callable, Any, Tuple, Type
from datetime import datetime


async def retry_async(
    func: Callable,
    *args,
    max_retries: int = 3,
    backoff_factor: float = 2.0,
    exceptions: Tuple[Type[Exception], ...] = (Exception,),
    on_retry: Callable[[int, Exception], None] = None,
    **kwargs
) -> Any:
    """
    Retry async function with exponential backoff
    
    Args:
        func: Async function to retry
        *args: Positional arguments for func
        max_retries: Maximum number of retry attempts (default: 3)
        backoff_factor: Backoff multiplier (default: 2.0)
        exceptions: Tuple of exceptions to catch (default: (Exception,))
        on_retry: Callback function called on each retry (retry_count, exception)
        **kwargs: Keyword arguments for func
        
    Returns:
        Result from func
        
    Raises:
        Last exception if all retries exhausted
    """
    last_exception = None
    
    for retry_count in range(max_retries + 1):
        try:
            return await func(*args, **kwargs)
        except exceptions as e:
            last_exception = e
            
            if retry_count >= max_retries:
                raise
            
            # Calculate backoff delay
            delay = backoff_factor ** retry_count
            
            # Call on_retry callback if provided
            if on_retry:
                on_retry(retry_count + 1, e)
            
            print(f"Retry {retry_count + 1}/{max_retries} after {delay}s: {str(e)}")
            await asyncio.sleep(delay)
    
    # Should not reach here, but just in case
    if last_exception:
        raise last_exception


def retry_sync(
    max_retries: int = 3,
    backoff_factor: float = 2.0,
    exceptions: Tuple[Type[Exception], ...] = (Exception,)
):
    """
    Decorator for synchronous functions with retry logic
    
    Args:
        max_retries: Maximum number of retry attempts
        backoff_factor: Backoff multiplier
        exceptions: Tuple of exceptions to catch
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            
            for retry_count in range(max_retries + 1):
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    last_exception = e
                    
                    if retry_count >= max_retries:
                        raise
                    
                    import time
                    delay = backoff_factor ** retry_count
                    print(f"Retry {retry_count + 1}/{max_retries} after {delay}s: {str(e)}")
                    time.sleep(delay)
            
            if last_exception:
                raise last_exception
        
        return wrapper
    return decorator
