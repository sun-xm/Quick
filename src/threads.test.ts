import * as threads from './threads';

const thread = threads.current();
thread.main(()=>{
	thread.data({ message: 'Thread is up' });

	wait(5000);
	thread.onNotify((notify)=>{
		if (notify.message) {
			thread.data({ message: 'Message received: ' +  notify.message});
		}
		else if (notify.data && 'array' === notify.data.type) {
			thread.data({ message: 'Data received: ' + notify.data.payload[0]});
		}
		else if (notify.exit) {
			thread.exit(0);
		}
	});
});

function wait(timeout: number) {
	const sab = new SharedArrayBuffer(16);
	const int32 = new Int32Array(sab);
	Atomics.wait(int32, 0, 0, timeout);
}

export function test() {
	let thread = new threads.Thread(__filename);
	thread.onData((data)=>{
		console.log(data.message);
	});

	let arr = new Int32Array(new SharedArrayBuffer(4));
	arr[0] = 12345;

	thread.notify({ message: 'Hello' });
	thread.notify({ data: { type: 'array', payload: arr } });
	thread.notify({ exit: true });
}

export async function exec() {
	console.log(await threads.exec(()=>{ return 'Hello'; }));
	console.log(await threads.exec((n)=>{ return n * n; }, 3));
}