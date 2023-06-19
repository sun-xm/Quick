import * as wthreads from 'worker_threads';

export function exec<T, P>(func: (param: P)=>T, param?: P) {
    let promise = new Promise<T>((res, rej)=>{
        resolve = res;
        reject  = rej;
    });

    let f = func.toString();
    let p = JSON.stringify(param);
    worker.postMessage({ f, p });

    return promise;
}

let resolve: (r: any)=>void;
let reject:  (e: any)=>void;

const worker = new wthreads.Worker(__filename);
worker.on('message', (result)=>{
    worker.terminate();
    resolve(result);
});

worker.on('error', (error)=>{
    worker.terminate();
    reject(error);
});

if (!wthreads.isMainThread) {
    wthreads.parentPort?.on('message', (proc: { f: string, p: string })=>{
        let f = eval(`(${proc.f})`);
        let p = proc.p ? JSON.parse(proc.p) : undefined;
        wthreads.parentPort?.postMessage(f(p));
    });
}