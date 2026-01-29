export const initialPropertyTrust = {
  trustType: "", // "ppt" or "standalone"
  whoRequires: "", // "client1", "client2", "both"
  propertyAddress: "",
  transferToJointNames: "", // "yes" or "no"
  sevOfTenancyRequired: "", // "yes" or "no"
  occupantLifeTenant: {
    client1: false,
    client2: false,
    both: false,
    other: false,
    otherName: "",
    otherDetails: "",
  },
  periodOfTenancy: "", // "life" or "fixed"
  fixedTerm: "",
  lifeTenantEndsOn: {
    cohabitation: false,
    marriage: false,
    age: false,
  },
  flexibleLifeInterestTrust: "", // "yes" or "no"
  rightToSubstitute: "", // "yes" or "no"
  downsizingSurplus: "", // "residual", "income", "other"
  downsizingOther: "",
  trustPeriodEnds: "", // "residual", "secondLevel", "other"
  trustPeriodEndsOther: "",
};

