/**
 * Sleep for xxx seconds
 * @param sec {number}
 */
export const sleep = async (sec: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, sec * 1000));

/**
 * Elaspsed Time Sec
 * @param sec {number}
 */
export const elapsedSecFromNow = (time: number): number =>
  (Date.now() - time) / 1000;
