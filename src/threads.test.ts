import * as threads from './threads';

const thread = new threads.Current();

thread.onNotify((notify)=>{
	if (notify.message) {
		console.log(notify.message);
	}
	else if (notify.exit) {
		thread.exit(0);
	}
});

thread.data({ data: 'This is some data' });
thread.data({ error: 'This is an error' });

export function test() {
	let thread = new threads.Thread('TEST');
	thread.exec(__filename);

	thread.onData((data)=>{
		if (data.data) {
			console.log(data.data);
		}
		else if (data.error) {
			console.error(data.error);
		}
	});

	thread.notify({ message: 'Hello' });
	thread.notify({ exit: true });
}

export async function exec() {
	console.log(await threads.exec(()=>{ return 'Hello'; }));
	console.log(await threads.exec((n: number)=>{ return n * n; }, 3));
}