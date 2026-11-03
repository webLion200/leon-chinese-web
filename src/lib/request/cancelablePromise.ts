export class CancelablePromise<T> extends Promise<T> {
  private readonly cancelRequest: () => void;
  private cancelled = false;

  constructor(
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: unknown) => void,
      onCancel: { isCancelled: boolean },
    ) => void,
  ) {
    let cancel!: () => void;
    const cancelState = { isCancelled: false };

    super((resolve, reject) => {
      cancel = () => {
        cancelState.isCancelled = true;
      };
      executor(resolve, reject, cancelState);
    });

    this.cancelRequest = cancel;
  }

  public cancel(): void {
    if (this.cancelled) return;
    this.cancelled = true;
    this.cancelRequest();
  }

  public get isCancelled(): boolean {
    return this.cancelled;
  }
}
