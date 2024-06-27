import * as threads from 'worker_threads';

export class Thread<T, P> {
    constructor(proc: (param?: P)=>T, options?: threads.WorkerOptions) {
        this.procedure = proc;
        this.result = new Promise<T>((resolve, reject)=>{
            this.resolve = resolve;
            this.reject  = reject;
        });
    }

    exec(param?: P): Promise<T> {
        if (this.options) {
            this.options.workerData = param;
        } else {
            this.options = { workerData: param };
        }

        this.worker = new threads.Worker(__filename, this.options);
        this.worker.on('message', (result)=>{
            this.worker!.terminate();
            this.resolve!(result);
            Thread.instances.delete(this);
        });
        this.worker.on('error', (error)=>{
            this.worker!.terminate();
            this.reject!(error);
            Thread.instances.delete(this);
        });

        Thread.instances.add(this);
        this.worker.postMessage(this.procedure.toString());

        return this.result;
    }

    result: Promise<T>;

    static instances = new Set();

    private procedure : (param?: P)=>T;
    private options: threads.WorkerOptions | undefined;
    private resolve: ((r: any)=>void) | undefined;
    private reject:  ((e: any)=>void) | undefined;
    private worker:  threads.Worker | undefined;
}

// Example: await exec((n: number = 100){ return n * n; });
export async function exec<T, P>(proc: (param?: P)=>T, param?: P, options?: threads.WorkerOptions) {
    return (new Thread(proc, options)).exec(param);
}

if (!threads.isMainThread) {
    threads.parentPort?.on('message', (p)=>{
        let proc = eval(`(${p})`);
        threads.parentPort?.postMessage(proc(threads.workerData));
    });
}