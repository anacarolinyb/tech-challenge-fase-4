/** Remove dados sensíveis antes de devolver um usuário na API. */
function toPublicUser(user) {
  if (!user) return null;
  const { passwordHash, ...publicData } = user;
  return publicData;
}

module.exports = { toPublicUser };
