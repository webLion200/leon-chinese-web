export class CancelablePromise<T> extends Promise<T> {
  private _isCancelled = false;
  constructor(
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: unknown) => void,
      onCancel: { isCancelled: boolean },
    ) => void,
  ) {
    const cancelState = { isCancelled: false };
    super((resolve, reject) => executor(resolve, reject, cancelState));
  }

  public cancel() {
    this._isCancelled = true;
  }

  public get isCancelled(): boolean {
    return this._isCancelled;
  }
}
