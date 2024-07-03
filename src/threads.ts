import * as threads from 'worker_threads';

export class Thread {
    constructor(name?: string) {
        this.name = name;
    }

    exec<P>(file: string, param?: P) {
        if (this.worker) {
            throw new Error('Thread is already running. Use new thread object to start a new thread');
        }
        this.worker = new threads.Worker(file, { workerData: param });
        this.worker.on('error', (error)=>{
            console.error('Thread "' + (this.name ?? '<no_name>') + '" throws an error:\n' + error);
        });
        this.worker.on('exit', (code)=>{
            console.debug('Thread "' + (this.name ?? '<no_name>') + '" exited with code ' + code);
        });
    }

    notify(data: any) {
        this.worker?.postMessage(data);
    }

    onData(ondata: (data: any)=>void) {
        this.worker?.removeAllListeners('message');
        this.worker?.on('message', ondata);
    }

    onExit(onexit: (code: number | undefined)=>void) {
        this.worker?.removeAllListeners('exit');
        this.worker?.on('exit', onexit);
    }

    onError(onerror: (error: Error)=>void) {
        this.worker?.removeAllListeners('error');
        this.worker?.on('error', onerror);
    }

    oneOff<T, P>(proc: (param?: P)=>T, param?: P): Promise<T> {
        let resolve: (value: any)=>void;
        let reject:  (error: any)=>void;
        let result = new Promise<T>((rsv, rej)=>{
            resolve = rsv;
            reject  = rej;
        });

        this.worker = new threads.Worker(__filename, { workerData: param });
        this.worker.on('message', (result)=>{
            resolve(result);
        });
        this.worker.on('error', (error)=>{
            reject(error);
        });
        this.worker.on('exit', (code)=>{
            Thread.instances.delete(this);
        });

        Thread.instances.add(this);
        this.worker.postMessage(proc.toString());

        return result;
    }

    private name:   string | undefined;
    private worker: threads.Worker | undefined;

    private static instances = new Set();
}

export class Current {
    main(proc: ()=>void) {
        if (!this.isMain()) {
            proc();
        }
    }

    exit(code?: number) {
        process.exit(code);
    }

    param() {
        return threads.workerData;
    }

    isMain() {
        return threads.isMainThread;
    }

    data(data: any) {
        threads.parentPort?.postMessage(data);
    }

    onNotify(onnotify: (data: any)=>void) {
        threads.parentPort?.removeAllListeners('message');
        threads.parentPort?.on('message', onnotify);
    }
}

export function exec<T>(proc: ()=>T) : Promise<T>;
export function exec<T, P>(proc: (param:  P)=>T, param:  P): Promise<T>;
export function exec<T, P>(proc: (param?: P)=>T, param?: P) {
    return (new Thread).oneOff(proc, param);
}

// One-off procedure
if (!threads.isMainThread) {
    threads.parentPort?.on('message', (p)=>{
        let proc = eval(`(${p})`);
        threads.parentPort?.postMessage(proc(threads.workerData));
        process.exit(0);
    });
}