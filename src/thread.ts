import * as threads from 'worker_threads';

export class Thread<T, P> {
    static exec<T, P>(proc: (param: P)=>T, param?: P) {
        let thread = new Thread({ workerData: param });
        thread.worker.postMessage(proc.toString());
        return thread;
    }

    result: Promise<T>;

    private constructor(options?: threads.WorkerOptions) {
        this.result = new Promise<T>((res, rej)=>{
            resolve = res;
            reject  = rej;
        });
        this.worker = new threads.Worker(__filename, options);
        this.worker.on('message', (r)=>{
            this.worker.terminate();
            resolve(r);
        });
        this.worker.on('error', (e)=>{
            this.worker.terminate();
            reject(e);
        });
    }

    private worker: threads.Worker;
}

let resolve: (r: any)=>void;
let reject:  (e: any)=>void;

if (!threads.isMainThread) {
    threads.parentPort?.on('message', (p)=>{
        let proc = eval(`(${p})`);
        threads.parentPort?.postMessage(proc(threads.workerData));
    });
}