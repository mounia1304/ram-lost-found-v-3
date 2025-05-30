export const generateShortCode = () => {
  const randomNum = Math.floor(1000 + Math.random() * 9000); // 4 chiffres
  return `FND${randomNum}`;
};
