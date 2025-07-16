export type SolAutoSaving = {
  "version": "0.1.0",
  "name": "sol_auto_saving",
  "instructions": [
    {
      "name": "initializeUser",
      "docs": [
        "Initialise un compte utilisateur avec un nom et l'adresse de l'autorité (wallet)"
      ],
      "accounts": [
        {
          "name": "userAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "createSavingAccount",
      "docs": [
        "Crée un compte d’épargne avec un objectif et une date de déblocage (1 an plus tard)"
      ],
      "accounts": [
        {
          "name": "savingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "goal",
          "type": "u64"
        }
      ]
    },
    {
      "name": "depositSol",
      "docs": [
        "Dépose des SOLs (10% sont automatiquement verrouillés dans le compte d’épargne)"
      ],
      "accounts": [
        {
          "name": "userAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "savingsAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawSol",
      "docs": [
        "Permet de retirer des fonds manuellement (hors déblocage annuel)"
      ],
      "accounts": [
        {
          "name": "userAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "savingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "checkBalance",
      "docs": [
        "Vérifie le solde (aucune écriture, juste une lecture possible côté client)"
      ],
      "accounts": [
        {
          "name": "userAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "savingAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "withdrawSaving",
      "docs": [
        "Débloque l’épargne automatiquement après la date prévue (1 an)"
      ],
      "accounts": [
        {
          "name": "savingsAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "userAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "totalDeposits",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "savingAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "goal",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "amountLocked",
            "type": "u64"
          },
          {
            "name": "releaseDate",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InsufficientFunds",
      "msg": "Fonds insuffisants dans le compte d'épargne."
    },
    {
      "code": 6001,
      "name": "TooEarly",
      "msg": "Trop tôt pour débloquer les fonds. Patientez jusqu'à la date prévue."
    }
  ]
};

export const IDL: SolAutoSaving = {
  "version": "0.1.0",
  "name": "sol_auto_saving",
  "instructions": [
    {
      "name": "initializeUser",
      "docs": [
        "Initialise un compte utilisateur avec un nom et l'adresse de l'autorité (wallet)"
      ],
      "accounts": [
        {
          "name": "userAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        }
      ]
    },
    {
      "name": "createSavingAccount",
      "docs": [
        "Crée un compte d’épargne avec un objectif et une date de déblocage (1 an plus tard)"
      ],
      "accounts": [
        {
          "name": "savingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "userAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "goal",
          "type": "u64"
        }
      ]
    },
    {
      "name": "depositSol",
      "docs": [
        "Dépose des SOLs (10% sont automatiquement verrouillés dans le compte d’épargne)"
      ],
      "accounts": [
        {
          "name": "userAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "savingsAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "withdrawSol",
      "docs": [
        "Permet de retirer des fonds manuellement (hors déblocage annuel)"
      ],
      "accounts": [
        {
          "name": "userAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "savingAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "checkBalance",
      "docs": [
        "Vérifie le solde (aucune écriture, juste une lecture possible côté client)"
      ],
      "accounts": [
        {
          "name": "userAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "savingAccount",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "withdrawSaving",
      "docs": [
        "Débloque l’épargne automatiquement après la date prévue (1 an)"
      ],
      "accounts": [
        {
          "name": "savingsAccount",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "user",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": []
    }
  ],
  "accounts": [
    {
      "name": "userAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "totalDeposits",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "savingAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "goal",
            "type": "u64"
          },
          {
            "name": "owner",
            "type": "publicKey"
          },
          {
            "name": "amountLocked",
            "type": "u64"
          },
          {
            "name": "releaseDate",
            "type": "i64"
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "InsufficientFunds",
      "msg": "Fonds insuffisants dans le compte d'épargne."
    },
    {
      "code": 6001,
      "name": "TooEarly",
      "msg": "Trop tôt pour débloquer les fonds. Patientez jusqu'à la date prévue."
    }
  ]
};
