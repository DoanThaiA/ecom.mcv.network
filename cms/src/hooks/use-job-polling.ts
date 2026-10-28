import { useState, useEffect, useRef, useCallback } from 'react';
import { jobRepository } from 'src/repositories/job.repository';
import type { JobStatusResponse } from 'src/types/import-session';

const TERMINAL_STATUSES = ['completed', 'failed', 'cancelled'];

interface UseJobPollingResult {
  job: JobStatusResponse | null;
  loading: boolean;
  error: string | null;
  isTerminal: boolean;
}

/**
 * Hook for polling a job's status at a given interval.
 * Stops polling when the job reaches a terminal status.
 */
export function useJobPolling(jobId: string | null, intervalMs = 3000): UseJobPollingResult {
  const [job, setJob] = useState<JobStatusResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTerminal, setIsTerminal] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) return;

    try {
      const data = await jobRepository.getJob(jobId);
      setJob(data);
      setError(null);

      if (TERMINAL_STATUSES.includes(data.status)) {
        setIsTerminal(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch job status');
    }
  }, [jobId]);

  useEffect(() => {
    if (!jobId) {
      setJob(null);
      setLoading(false);
      setError(null);
      setIsTerminal(false);
      return;
    }

    setLoading(true);
    setIsTerminal(false);

    // Initial fetch
    fetchJob().finally(() => setLoading(false));

    // Start polling
    intervalRef.current = setInterval(() => {
      fetchJob();
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [jobId, intervalMs, fetchJob]);

  // Stop polling when terminal
  useEffect(() => {
    if (isTerminal && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [isTerminal]);

  return { job, loading, error, isTerminal };
}
