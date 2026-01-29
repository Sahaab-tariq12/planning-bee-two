import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

const AppContext = createContext();

// Key for localStorage
const STORAGE_KEY = 'planning_bee_app_data';

// Initial state
const initialState = {
  clientDetails: {},
  signatures: {
    client1: null,
    client2: null
  },
  willInstructions: {
    propertyTrusts: [],
    businessTrusts: [],
    testamentaryCapacity: {
      hasLPAs: "",
      hasConcerns: "",
      understandsInstructions: "",
      understandsClaims: "",
      notUndulyInfluenced: "",
      paralegalCertification: false,
    },
    residue: {
      spousalEstateTransfer: "",
      percentageGroups: [],
      hasSubstitutionalProvisions: false,
      alternateGroups: []
    },
    bequests: []
  },
  familyProtection: {
    requireTrust: "",
    client1NI: "",
    client2NI: "",
    settlors: {
      client1: false,
      client2: false,
      both: false
    },
    clientsAsTrustees: false,
    client1Trustees: [],
    client2Trustees: [],
    beneficiarySetup: "",
    beneficiaries: [],
    additionalInfo: "",
    disabledBeneficiaries: false,
    potentialClaims: false,
    mainResidence: false,
    mortgageOrEquity: false,
    rx1OrTr1: "",
    trustReasons: {
      reduceProbate: false,
      sidewaysDisinheritance: false,
      divorceClaims: false,
      generationalIHT: false,
      claimsAgainstEstate: false
    }
  },
  lpaInstructions: {
    requireLPAs: "",
    client1: {
      preferences: "",
      certificateProvider: "",
      decisionTiming: "",
      storeOrRegister: "",
      awareOfFee: false,
      propertyAttorneys: [],
      healthAttorneys: [],
      replacementPropertyAttorneys: [],
      replacementHealthAttorneys: [],
      peopleToNotify: []
    },
    client2: {
      preferences: "",
      certificateProvider: "",
      decisionTiming: "",
      storeOrRegister: "",
      awareOfFee: false,
      propertyAttorneys: [],
      healthAttorneys: [],
      replacementPropertyAttorneys: [],
      replacementHealthAttorneys: [],
      peopleToNotify: []
    }
  },
  idInformation: {
    idDocuments: [],
    supportingDocuments: []
  },
  reviewSignData: {
    // Consultation points
    makingWill: false,
    safeStorage: false,
    keepingWillUpToDate: false,
    lpasRegFee: false,
    clientResponsibleSigning: false,
    opgRegFee: false,
    propertyTrusts: false,
    otherWillTrusts: false,
    familyProtectionTrusts: false,
    cancellationTerms: false,
    other: false,
    otherDetails: "",

    // Products taken
    productsWills: false,
    productsLPAs: false,
    productsDiscretionaryTrust: false,
    productsPropertyProtectionTrust: false,
    productsBPRT: false,
    productsFamilyProtectionTrust: false,
    productsVulnerableDisabilityTrust: false,
    productsRightsOfOccupation: false,
    productsOther: false,
    productsOtherDetails: "",
    
    // For other services management
    otherServiceInput: "",
    otherServicesList: [],

    // Pricing
    paymentTerms: "",
    totalAmount: "",
    amountPaid: "",
    amountOwing: "",

    // Family Protection Trust question
    takingFamilyProtectionTrust: false,
  }
};

// Helper function to load data from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return initialState;
    }
    const loadedState = JSON.parse(serializedState);
    // Ensure we merge the initial state with the loaded state properly
    return {
      ...initialState,
      ...loadedState,
      // Ensure signatures are properly merged
      signatures: {
        ...initialState.signatures,
        ...(loadedState.signatures || {})
      },
      // Ensure reviewSignData is properly merged
      reviewSignData: {
        ...initialState.reviewSignData,
        ...(loadedState.reviewSignData || {})
      }
    };
  } catch (err) {
    console.warn('Failed to load state from localStorage:', err);
    return initialState;
  }
};

export const AppProvider = ({ children }) => {
  const [appState, setAppState] = useState(loadState);
  const [isLoading, setIsLoading] = useState(true);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    } catch (err) {
      console.error('Failed to save state to localStorage:', err);
    }
  }, [appState]);

  // Update a specific section of the state - memoized to prevent infinite loops
  const updateState = useCallback((path, data, options = {}) => {
    setAppState(prev => {
      let newState;
      
      // Handle nested paths like 'willInstructions.bequests'
      if (path.includes('.')) {
        const [section, ...nestedKeys] = path.split('.');
        let currentSection = { ...prev[section] };
        
        // Navigate to the nested property
        let target = currentSection;
        for (let i = 0; i < nestedKeys.length - 1; i++) {
          target[nestedKeys[i]] = { ...target[nestedKeys[i]] };
          target = target[nestedKeys[i]];
        }
        
        // Set the final property
        const finalKey = nestedKeys[nestedKeys.length - 1];
        target[finalKey] = data;
        
        newState = {
          ...prev,
          [section]: currentSection
        };
      } else if (options.mergeWithExisting) {
        // For signatures, we want to merge the existing signatures with the new data
        if (path === 'signatures') {
          newState = {
            ...prev,
            signatures: {
              ...prev.signatures,
              ...data
            }
          };
        } else {
          newState = {
            ...prev,
            [path]: {
              ...prev[path],
              ...data
            }
          };
        }
      } else {
        newState = {
          ...prev,
          [path]: data
        };
      }
      
      // Save to localStorage immediately
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      } catch (err) {
        console.error('Failed to save state to localStorage:', err);
      }
      
      return newState;
    });
    
    // Return a promise that resolves when the state is updated
    return Promise.resolve();
  }, []);

  // Clear all data - memoized to prevent infinite loops
  const clearData = useCallback(() => {
    setAppState(initialState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Set loading to false once initial state is loaded
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    ...appState,
    updateState,
    clearData,
    isLoading
  }), [appState, updateState, clearData, isLoading]);

  return (
    <AppContext.Provider value={contextValue}>
      {!isLoading && children}
    </AppContext.Provider>
  );
};

// Custom hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
