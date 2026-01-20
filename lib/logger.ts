type LogData = Record<string, unknown>;

export function createLogger(route: string) {
  const startTime = performance.now();
  const timings: { label: string; duration: number }[] = [];
  let lastTime = startTime;

  return {
    time(label: string) {
      const now = performance.now();
      const duration = now - lastTime;
      timings.push({ label, duration });
      lastTime = now;
    },

    end(status: number, data?: LogData) {
      const totalDuration = performance.now() - startTime;

      const timingStr = timings
        .map((t) => `${t.label}=${t.duration.toFixed(1)}ms`)
        .join(" ");

      console.log(
        JSON.stringify({
          route,
          status,
          total: `${totalDuration.toFixed(1)}ms`,
          timings: timingStr,
          ...data,
        }),
      );
    },

    error(error: unknown, data?: LogData) {
      const totalDuration = performance.now() - startTime;

      console.error(
        JSON.stringify({
          route,
          status: 500,
          total: `${totalDuration.toFixed(1)}ms`,
          error: error instanceof Error ? error.message : "Unknown error",
          ...data,
        }),
      );
    },
  };
}
