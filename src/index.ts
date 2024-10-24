import { Webhook } from 'svix';
import { createClient } from '@supabase/supabase-js';

let supabase: ReturnType<typeof createClient>;

export default {
	async fetch(request, env, ctx): Promise<Response> {
		supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);
		const secret = env.CLERK_WEBHOOK_SECRET;
		return handleRequest(request, secret);
	},
} satisfies ExportedHandler<Env>;

async function handleRequest(request: Request, secret: string): Promise<Response> {
	if (request.method !== 'POST') {
		return new Response('Method Not Allowed', { status: 405 });
	}

	// Verify the webhook signature
	const headers = request.headers;
	const body = await request.text();

	const svix_id = headers.get('svix-id') || '';
	const svix_timestamp = headers.get('svix-timestamp') || '';
	const svix_signature = headers.get('svix-signature') || '';

	if (!svix_id || !svix_timestamp || !svix_signature) {
		return new Response('Error occured -- no svix headers', {
			status: 400,
		});
	}

	const wh = new Webhook(secret);

	let evt;

	try {
		evt = wh.verify(body, {
			'svix-id': svix_id,
			'svix-timestamp': svix_timestamp,
			'svix-signature': svix_signature,
		});
	} catch (err) {
		console.log('Error verifying webhook:', err);
		return new Response('Error occured -- invalid signature', {
			status: 400,
		});
	}

	const eventData: any = evt;

	const eventType = eventData.type;
	const clerkUser = eventData.data;

	try {
		switch (eventType) {
			case 'user.created':
				await handleUserCreated(clerkUser);
				break;
			case 'user.createdAtEdge':
				await handleUserCreated(clerkUser);
				break;
			case 'user.updated':
				await handleUserUpdated(clerkUser);
				break;
			default:
				return new Response('Event type not supported', { status: 400 });
		}
	} catch (err) {
		console.log('Error handling webhook:', err);
		return new Response('Error occured -- during event handling', {
			status: 400,
		});
	}

	return new Response('Webhook processed', { status: 200 });
}

async function handleUserCreated(user: any): Promise<void> {
	const { error } = await supabase.from('users').insert({
		clerk_id: user.id,
		first_name: user.first_name,
		last_name: user.last_name,
		email: user.email_addresses[0].email_address,
		phone_number: user.phone_numbers[0]?.phone_number || null,
	});

	if (error) {
		console.log('Error creating user:', error);
		throw new Error('Error creating user');
	}

	console.log(
		`New user created: ${user.id}, email: ${user.email_addresses[0].email_address}, phone: ${user.phone_numbers[0]?.phone_number}, first name: ${user.first_name}, last name: ${user.last_name}`,
	);
}

async function handleUserUpdated(user: any): Promise<void> {
	const { error } = await supabase
		.from('users')
		.update({
			clerk_id: user.id,
			first_name: user.first_name,
			last_name: user.last_name,
			email: user.email_addresses[0].email_address,
			phone_number: user.phone_numbers[0]?.phone_number || null,
		})
		.eq('clerk_id', user.id);

	if (error) {
		console.log('Error creating user:', error);
		throw new Error('Error creating user');
	}

	console.log(
		`User updated: ${user.id}, email: ${user.email_addresses[0].email_address}, phone: ${user.phone_numbers[0]?.phone_number}, first name: ${user.first_name}, last name: ${user.last_name}`,
	);
}
