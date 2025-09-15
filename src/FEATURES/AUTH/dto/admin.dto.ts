const { Expose, plainToInstance } = require("class-transformer");

export class AdminDto {
  @Expose() token;
  @Expose() firstname;
  @Expose() lastname;
  @Expose() image;
  @Expose() organisationName;
  @Expose() email;
  @Expose() role;
  @Expose() permissions;
  @Expose() status;
  @Expose() createdAt;
  @Expose() updatedAt;

}

export const formatAdminResponse = (user, token) => {
  // console.log('user :>> ', user);
  let admin = token?{ ...user.toObject(), token } : user.toObject()
  return plainToInstance(AdminDto, admin, { excludeExtraneousValues: true });
};

