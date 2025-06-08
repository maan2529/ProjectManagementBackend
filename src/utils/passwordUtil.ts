import bcrypt from 'bcrypt';

// Define the types explicitly
const saltRounds: number = 10;

export const hashPassword = async (password: string): Promise<string> => {
  const salt: string = await bcrypt.genSalt(saltRounds);
  const hash: any = await bcrypt.hash(password, salt);
  return hash;
};

export const comparePassword = async (
  password: string,
  hash: string,
): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
