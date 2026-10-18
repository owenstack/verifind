import { defineRelations, defineRelationsPart } from "drizzle-orm";
import {
	account,
	authRelations,
	passkey,
	session,
	user,
	verification,
} from "./schema";

const schema = { account, passkey, session, user, verification };

export const relations = {
	...defineRelations(schema),
	...authRelations,
	...defineRelationsPart({ user, passkey }, (r) => ({
		passkey: {
			user: r.one.user({
				from: r.passkey.userId,
				to: r.user.id,
			}),
		},
	})),
};
