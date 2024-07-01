import * as threads from 'worker_threads';

export class Thread {
    constructor(name?: string) {
        this.name = name;
    }

    exec<P>(file: string, param?: P) {
        if (this.worker) {
            throw new Error('Thread is already running. Use new thread object to start a new thread');
        }
        this.worker = new threads.Worker(file, { workerData: param, stdin: true, stdout: true, stderr: false });
        this.worker.on('error', (error)=>{
            console.error('Thread "' + (this.name ?? '<no_name>') + '" throws an error:\n' + error);
        });
        this.worker.on('exit', (code)=>{
            console.debug('Thread "' + (this.name ?? '<no_name>') + '" exited with code ' + code);
        });
    }

    notify(data: any) {
        this.worker?.stdin?.write(JSON.stringify(data));
    }

    onData(ondata: (data: any)=>void) {
        this.worker?.stdout.on('data', (data)=>{
            if (Buffer.isBuffer(data)) {
                ondata(JSON.parse(data.toString()));
            }
        });
    }

    onExit(onexit: (code: number | undefined)=>void) {
        this.worker?.on('exit', (code)=>{
            onexit(code);
        });
    }

    onError(onerror: (error: Error)=>void) {
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
            this.worker = undefined;
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
    data(data: any) {
        process.stdout.write(JSON.stringify(data));
    }

    param() {
        return threads.workerData;
    }

    onNotify(onnotify: (data: any)=>void) {
        process.stdin.on('data', (data)=>{
            if (Buffer.isBuffer(data)) {
                onnotify(JSON.parse(data.toString()));
            }
        });
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