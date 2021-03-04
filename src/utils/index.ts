/**
 * Sleep for xxx seconds
 * @param sec {number}
 */
export const sleep = async (sec: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, sec * 1000));
