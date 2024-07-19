import * as threads from 'worker_threads';

export class Thread {
    constructor(file: string, param?: any) {
        this.worker = new threads.Worker(file, { workerData: param });
        this.thread = this.worker.threadId;
        this.worker.on('error', (error)=>{
            console.error('Thread <id=' + this.id() + '> throws an error:\n' + error.stack);
        });
        this.worker.on('exit', (code)=>{
            console.debug('Thread <id=' + this.id() + '> exited with code ' + code);
        });
    }

    id() {
        return this.thread;
    }

    isAlive() {
        return -1 != this.worker.threadId;
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

    private worker: threads.Worker;
    private thread: number;
}

class Current {
    id() {
        return threads.threadId;
    }

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

    static current: Current | undefined;
}

export function current() {
    if (!Current.current) {
        Current.current = new Current;
    }
    return Current.current;
}


const KEEP_ALIVE = new Set<threads.Worker>();
export function exec<T>(proc: ()=>T) : Promise<T>;
export function exec<T, P>(proc: (param:  P)=>T, param:  P): Promise<T>;
export function exec<T, P>(proc: (param?: P)=>T, param?: P) {
    let resolve: (value: any)=>void;
    let reject:  (error: any)=>void;
    let result = new Promise<T>((rsv, rej)=>{
        resolve = rsv;
        reject  = rej;
    });

    let worker = new threads.Worker(__filename, { workerData: param });
    worker.on('message', result=>resolve(result));
    worker.on('error', error=>reject(error));
    worker.on('exit', code=>KEEP_ALIVE.delete(worker));

    KEEP_ALIVE.add(worker);
    worker.postMessage(proc.toString());

    return result;
}

// One-off procedure
current().main(()=>{
    threads.parentPort?.on('message', (p)=>{
        let proc = eval(`(${p})`);
        threads.parentPort?.postMessage(proc(threads.workerData));
        process.exit(0);
    });
});