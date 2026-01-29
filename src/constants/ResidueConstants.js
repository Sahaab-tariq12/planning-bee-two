export const TYPE_OPTIONS = [
  { value: "individual", label: "Individual(s)" },
  { value: "discretionary_trust", label: "Discretionary Trust" },
  { value: "vpt", label: "VPT" },
];

export const createInitialGroup = () => ({
  id: Date.now(),
  percentage: "",
  type: "",
  beneficiaries: [],
  goc: {
    giftOverToChildren: false,
    accruer: false,
    otherEntities: false,
  },
  furtherDetails: "",
});

export const createInitialBeneficiary = () => ({
  id: Date.now(),
  title: "",
  name: "",
  relationship: "",
  classGift: "",
  address: "",
  ageOfVesting: "",
  selectedPerson: "",
});

// Function to calculate total percentage
export const calculateTotal = (groups) => {
  let total = 0;
  for (let i = 0; i < groups.length; i++) {
    const percentage = parseFloat(groups[i].percentage);
    if (!isNaN(percentage)) {
      total = total + percentage;
    }
  }
  return total;
};

