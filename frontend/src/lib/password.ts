export const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (password: string) => password.length >= 8 },
  { label: "Contains a letter", test: (password: string) => /[A-Za-z]/.test(password) },
  { label: "Contains a number", test: (password: string) => /\d/.test(password) },
];

export const PASSWORD_RULE_MESSAGE = "Password must be at least 8 characters and include a letter and a number.";

export const isStrongPassword = (password: string) => PASSWORD_RULES.every((rule) => rule.test(password));
