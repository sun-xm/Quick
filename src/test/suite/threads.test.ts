import * as assert from 'assert';
import * as threads from '../../threads';

// Thread procedure
const thread = threads.current();
thread.proc(()=>{
    thread.data({ startup: 'Thread is up' });

    thread.onNotify((notify)=>{
        if (notify.data) {
            thread.data({ data: notify.data[0] });
        }

        if (notify.exit) {
            thread.exit(123);
        }

        if (notify.error) {
            throw new Error('This is an error');
        }
    });
});

// Register test cases
if (threads.isMain()) {
    suite("Threads Test Suite", ()=>{
        test('notify/data/exit', async()=>{
            let result = new Promise<boolean>((resolve, reject)=>{
                let thread = new threads.Thread(__filename);

                thread.onData((data)=>{
                    if (data.startup) {
                        if ('Thread is up' !== data.startup) {
                            resolve(false);
                        }
                        thread.notify({ exit: true });

                    }
                });

                thread.onExit((code)=>{
                    resolve(123 == code);
                });
            });

            assert(await result);
        });

        test('exception', async()=>{
            let result = new Promise<boolean>((resolve, reject)=>{
                let thread = new threads.Thread(__filename);

                thread.onError((err)=>{
                    resolve('This is an error' === err.message);
                });

                thread.notify({ error: true });
            });

            assert(await result);
        });

        test('SharedArrayBuffer', async()=>{
            let result = new Promise<boolean>((resolve, reject)=>{
                let thread = new threads.Thread(__filename);

                thread.onData((data)=>{
                    if (data.data) {
                        resolve(12345 == data.data);
                    }
                });

                let arr = new Int32Array(new SharedArrayBuffer(4));
                arr[0] = 12345;
                thread.notify({ data: arr });
            });

            assert(await result);
        });

        test('One-off execution', async ()=>{
            assert('Hello' == await threads.exec(()=>'Hello'));
            assert(9 == await threads.exec((n)=>n * n, 3));
        });
    });
}