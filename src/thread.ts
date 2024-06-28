import * as threads from 'worker_threads';

class Thread<T, P> {
    constructor(proc: (param?: P)=>T) {
        this.procedure = proc;
        this.result = new Promise<T>((resolve, reject)=>{
            this.resolve = resolve;
            this.reject  = reject;
        });
    }

    exec(param?: P): Promise<T> {
        this.worker = new threads.Worker(__filename, { workerData: param });
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

    private procedure : (param?: P)=>T;
    private resolve: ((r: any)=>void) | undefined;
    private reject:  ((e: any)=>void) | undefined;
    private worker:  threads.Worker | undefined;
    private result:  Promise<T>;

    private static instances = new Set();
}

export function exec<T>(proc: ()=>T) : Promise<T>;
export function exec<T, P>(proc: (param:  P)=>T, param:  P): Promise<T>;
export function exec<T, P>(proc: (param?: P)=>T, param?: P) {
    return (new Thread(proc)).exec(param);
}

if (!threads.isMainThread) {
    threads.parentPort?.on('message', (p)=>{
        let proc = eval(`(${p})`);
        threads.parentPort?.postMessage(proc(threads.workerData));
    });
}