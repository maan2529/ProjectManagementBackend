import userModel from "../models/userModel";

export default async function generateUniqueUsername(
  input: string,
): Promise<string> {
  if (!input || typeof input !== 'string') {
    throw new Error('Invalid input: a valid email or name is required.');
  }

  // Extract base username from email or use the input directly
  const baseUsername = input.includes('@') ? input.split('@')[0] : input;

  let isUnique = false;
  let finalUsername = '';

  while (!isUnique) {
    const randomNumber = Math.floor(100 + Math.random() * 900); // Generate a random 3-digit number
    finalUsername = `${baseUsername}${randomNumber}`;

    // Check if the generated username already exists
    const exists = await userModel.findOne({ username: finalUsername });

    if (!exists) {
      isUnique = true;
    }
  }

  return finalUsername;
}
