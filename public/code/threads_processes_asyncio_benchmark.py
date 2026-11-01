"""
Benchmark for the Engineering Notes article
"Threads, processes, or asyncio? I measured where each one helps in Python".

PART 1 contains the article's example functions, unchanged.
PART 2 adds the sequential baselines, a local test server and the timing.
In each comparison every version does the same work on the same inputs;
only the way the work is run changes.

  I/O-bound: 3 HTTP requests        sequential vs threads vs asyncio
  CPU-bound: sum_squares(5M, 6M, 7M) sequential vs threads vs processes

The three URLs point to a small test server started by this script on your
own machine. It waits DELAY seconds before each response to imitate a slow
API, so the results don't depend on your internet connection.

Run:
    pip install httpx
    python threads_processes_asyncio_benchmark.py
"""

import asyncio
import os
import platform
import statistics
import sys
import threading
import time
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from itertools import repeat

import httpx

# =============================================================================
# PART 1: the article's examples
# =============================================================================

# --- Threads section ---------------------------------------------------------
def fetch_blocking(client, url):
    response = client.get(url)
    response.raise_for_status()
    return response.content


def fetch_with_threads(urls):
    with httpx.Client(timeout=10.0) as client:
        with ThreadPoolExecutor(max_workers=3) as pool:
            return list(pool.map(fetch_blocking, repeat(client), urls))


# --- Processes section -------------------------------------------------------
def sum_squares(limit):
    total = 0
    for number in range(limit):
        total += number * number
    return total


def calculate_with_processes(limits):
    with ProcessPoolExecutor(max_workers=3) as pool:
        return list(pool.map(sum_squares, limits))


# --- asyncio section ---------------------------------------------------------
async def fetch_async(client, url):
    response = await client.get(url)
    response.raise_for_status()
    return response.content


async def fetch_pages(urls):
    async with httpx.AsyncClient(timeout=10.0) as client:
        return await asyncio.gather(
            *(fetch_async(client, url) for url in urls)
        )


def fetch_with_asyncio(urls):
    return asyncio.run(fetch_pages(urls))


# =============================================================================
# PART 2: baselines, local test server and timing
# =============================================================================

def fetch_sequential(urls):
    with httpx.Client(timeout=10.0) as client:
        return [fetch_blocking(client, url) for url in urls]


def calculate_sequential(limits):
    return [sum_squares(limit) for limit in limits]


def calculate_with_threads(limits):
    # The process-pool code with only the executor class changed.
    with ThreadPoolExecutor(max_workers=3) as pool:
        return list(pool.map(sum_squares, limits))


DELAY = 1.0  # seconds the test server waits before each response
RUNS = 3     # each case runs this many times; the median is reported


class SlowHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        time.sleep(DELAY)
        body = self.path.encode()  # each URL gets a different response body
        self.send_response(200)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


def median_seconds(func, arg):
    times = []
    for _ in range(RUNS):
        start = time.perf_counter()
        func(arg)
        times.append(time.perf_counter() - start)
    return statistics.median(times)


def compare(title, cases, arg):
    # Check every version returns exactly the same result before timing.
    expected = cases[0][1](arg)
    for name, func in cases[1:]:
        assert func(arg) == expected, f"{name} returned a different result"

    print(f"\n{title}")
    baseline = None
    for name, func in cases:
        seconds = median_seconds(func, arg)
        baseline = baseline or seconds
        print(f"  {name:<11} {seconds:6.3f} s   {baseline / seconds:4.1f}x vs sequential")


def main():
    gil = getattr(sys, "_is_gil_enabled", lambda: True)()
    print(f"Python {platform.python_version()} on {platform.system()}, "
          f"{os.cpu_count()} logical CPUs, GIL {'enabled' if gil else 'disabled'}, "
          f"median of {RUNS} runs")

    server = ThreadingHTTPServer(("127.0.0.1", 0), SlowHandler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    host, port = server.server_address
    urls = [f"http://{host}:{port}/api/{name}" for name in ("a", "b", "c")]

    compare(f"I/O-bound: 3 HTTP requests, server waits {DELAY:g} s each", [
        ("sequential", fetch_sequential),
        ("threads", fetch_with_threads),
        ("asyncio", fetch_with_asyncio),
    ], urls)

    compare("CPU-bound: sum_squares for 5M, 6M and 7M", [
        ("sequential", calculate_sequential),
        ("threads", calculate_with_threads),
        ("processes", calculate_with_processes),
    ], [5_000_000, 6_000_000, 7_000_000])

    server.shutdown()


if __name__ == "__main__":
    main()
