export async function wait(ms: number, speedRef: React.MutableRefObject<number>, pauseRef: React.MutableRefObject<boolean>, stopRef: React.MutableRefObject<boolean>) {
  const adjustedMs = ms / (speedRef.current || 1);
  const start = Date.now();
  
  while (Date.now() - start < adjustedMs) {
    if (stopRef.current) throw new Error("STOPPED");
    if (pauseRef.current) {
      await new Promise(resolve => setTimeout(resolve, 100));
      // Re-adjust start time to effectively "pause" the timer
      continue; 
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
}

export async function checkStop(stopRef: React.MutableRefObject<boolean>) {
  if (stopRef.current) throw new Error("STOPPED");
}
