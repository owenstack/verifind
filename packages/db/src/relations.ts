import { defineRelations, defineRelationsPart } from "drizzle-orm";
import {
	account,
	authRelations,
	notification,
	notificationRelations,
	passkey,
	property,
	propertyRelations,
	pushSubscription,
	savedProperty,
	session,
	user,
	verification,
} from "./schema";

const schema = {
	account,
	notification,
	passkey,
	property,
	pushSubscription,
	savedProperty,
	session,
	user,
	verification,
};

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
	...propertyRelations,
	...notificationRelations,
};
