import * as threads from './threads';

let thread = new threads.Current();

thread.onNotify((notify)=>{
	if (notify.message) {
		console.log(notify.message);
	}
	else if (notify.exit) {
		process.exit(0);
	}
});

thread.data({ data: 'This is some data' });
thread.data({ error: 'This is an error' });

export function test() {
	let t = new threads.Thread('TEST');
	t.exec(__filename);

	t.onData((data)=>{
		if (data.data) {
			console.log(data.data);
		}
		else if (data.error) {
			console.error(data.error);
		}
	});

	t.notify({ message: 'Hello' });
	t.notify({ exit: true });
}

export async function exec() {
	console.log(await threads.exec((n: number)=>{ return n * n; }, 3));
}