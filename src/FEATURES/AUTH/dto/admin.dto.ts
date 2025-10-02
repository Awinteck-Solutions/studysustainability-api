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

  @Expose() countryOfOrigin;
  @Expose() countryOfResidence;
  @Expose() cityOfResidence;
  @Expose() gender;
  @Expose() ageRange;
  @Expose() levelOfStudy;
  @Expose() academicProgramInterest;
  @Expose() graduateRecruitmentInterest;
  @Expose() qualificationType;
  @Expose() website;
  @Expose() extraEmail;
  @Expose() accreditation;
  @Expose() eventTypes;
  @Expose() fullname;
  @Expose() facebook;
  @Expose() twitter;
  @Expose() instagram;
  @Expose() linkedin;
  @Expose() youtube;
  @Expose() tiktok;
  @Expose() pinterest;
  @Expose() aboutUs;
  @Expose() whyStudyWithUs;
  @Expose() campusLife;
  @Expose() id;
  

}

export const formatAdminResponse = (user, token) => {
  // console.log('user :>> ', user);
  // Handle both Mongoose documents and plain objects
  const userObj = user.toObject ? user.toObject() : user;
  let admin = token ? { ...userObj, token } : userObj;
  return plainToInstance(AdminDto, admin, { excludeExtraneousValues: true });
};

