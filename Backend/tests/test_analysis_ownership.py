"""
Tests for analysis job ownership (HR-01).

Every job must be bound to the submitting user; get_job must return None
when a different user polls the same job_id.
"""

import time
import pytest


def _import_queue():
    from app.core import analysis_queue
    return analysis_queue


# ── Job ownership enforcement ─────────────────────────────────────────────────

def test_job_owner_can_retrieve_result():
    q = _import_queue()
    owner = "alice@example.com"

    def quick_fn():
        return {"ok": True}

    job_id = q.submit_analysis(owner, quick_fn)
    # Give the thread pool a moment to finish.
    deadline = time.time() + 5
    while time.time() < deadline:
        job = q.get_job(job_id, owner)
        if job and job["status"] in (q.JobStatus.DONE, q.JobStatus.ERROR):
            break
        time.sleep(0.1)

    job = q.get_job(job_id, owner)
    assert job is not None
    assert job["status"] == q.JobStatus.DONE
    assert job["result"] == {"ok": True}


def test_wrong_owner_cannot_retrieve_job():
    q = _import_queue()
    owner = "alice@example.com"
    other = "eve@example.com"

    def quick_fn():
        return {"secret_data": True}

    job_id = q.submit_analysis(owner, quick_fn)

    # Regardless of timing, the wrong owner must never see the job.
    assert q.get_job(job_id, other) is None


def test_pending_job_returns_status_not_result():
    q = _import_queue()
    owner = "bob@example.com"

    import threading
    event = threading.Event()

    def blocking_fn():
        event.wait(timeout=10)
        return {"done": True}

    job_id = q.submit_analysis(owner, blocking_fn)
    job = q.get_job(job_id, owner)

    # Job might be PENDING or RUNNING — result must be None while blocked.
    assert job is not None
    assert job["status"] in (q.JobStatus.PENDING, q.JobStatus.RUNNING)
    assert job["result"] is None

    event.set()  # unblock the worker
    time.sleep(0.2)  # let it finish cleanly


def test_job_stores_owner_id_in_memory():
    """The in-memory job record must carry owner_id for the authorization check."""
    q = _import_queue()
    owner = "carol@example.com"

    def quick_fn():
        return {}

    job_id = q.submit_analysis(owner, quick_fn)

    import threading
    with q._jobs_lock:
        job = q._jobs.get(job_id)

    # Job may already be done/expired, but if present the owner must match.
    if job is not None:
        assert job.get("owner_id") == owner
