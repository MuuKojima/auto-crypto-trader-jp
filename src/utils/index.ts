/**
 * Sleep for xxx seconds
 * @param sec
 */
export const sleep = async (sec: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, sec * 1000));

