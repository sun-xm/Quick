import * as threads from 'worker_threads';

export class Thread<T, P> {
    static exec<T, P>(proc: (param?: P)=>T, param?: P) {
        let thread = new Thread({ workerData: param });
        thread.worker.postMessage(proc.toString());
        return thread;
    }

    result: Promise<T>;

    private constructor(options?: threads.WorkerOptions) {
        this.result = new Promise<T>((resolve, reject)=>{
            this.resolve = resolve;
            this.reject  = reject;
        });
        this.worker = new threads.Worker(__filename, options);
        this.worker.on('message', (r)=>{
            this.worker.terminate();
            this.resolve!(r);
        });
        this.worker.on('error', (e)=>{
            this.worker.terminate();
            this.reject!(e);
        });
    }

    private resolve: ((r: any)=>void) | undefined;
    private reject:  ((e: any)=>void) | undefined;
    private worker:  threads.Worker;
}

if (!threads.isMainThread) {
    threads.parentPort?.on('message', (p)=>{
        let proc = eval(`(${p})`);
        threads.parentPort?.postMessage(proc(threads.workerData));
    });
}