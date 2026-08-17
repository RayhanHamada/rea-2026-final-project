import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";

const statement = {
  ...defaultStatements,
} as const;

export const ac = createAccessControl(statement);

export const admin = ac.newRole({
  ...adminAc.statements,
});

export const recruiter = ac.newRole({
  user: ["create", "list", "get", "set-role"],
});

export const candidate = ac.newRole({
  ...adminAc.statements,
});
