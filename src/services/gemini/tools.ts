import { FunctionDeclaration, Type } from '@google/genai';

export const showSchemeResultsTool: FunctionDeclaration = {
  name: 'showSchemeResults',
  description: 'Display 2 to 4 relevant government support schemes on screen matching the user’s need.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      sector: {
        type: Type.STRING,
        description: 'The sector matching the user need: EDUCATION, FINANCE, HEALTH, SKILLS, ENTREPRENEURSHIP, SAFETY, HOUSING, or AGRICULTURE',
      },
      userNeedSummary: {
        type: Type.STRING,
        description: 'Short phrase describing what the user asked for (e.g. daughter college scholarship, pregnant nutrition assistance)',
      },
    },
    required: ['sector', 'userNeedSummary'],
  },
};

export const openSchemeTool: FunctionDeclaration = {
  name: 'openScheme',
  description: 'Open the detailed guidance screen for a specific government support scheme.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      schemeId: {
        type: Type.STRING,
        description: 'The exact ID of the scheme from the verified catalog (e.g. aicte-pragati-degree, pm-matru-vandana, pm-mudra)',
      },
    },
    required: ['schemeId'],
  },
};

export const highlightSectionTool: FunctionDeclaration = {
  name: 'highlightSection',
  description: 'Visually highlight and focus a section on the scheme details screen while explaining it to the user.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      targetId: {
        type: Type.STRING,
        description: 'The section ID to highlight: scheme-overview, scheme-who-is-it-for, scheme-benefits, scheme-eligibility, scheme-documents, scheme-application, or scheme-official-source',
      },
      sectionPurpose: {
        type: Type.STRING,
        description: 'What this section is explaining (e.g. required papers, who can apply)',
      },
    },
    required: ['targetId'],
  },
};

export const showGuidanceStepTool: FunctionDeclaration = {
  name: 'showGuidanceStep',
  description: 'Advance the step indicator on the screen to show user progression.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      stepName: {
        type: Type.STRING,
        description: 'Step name: OVERVIEW, WHO_IS_IT_FOR, BENEFITS, ELIGIBILITY, DOCUMENTS, APPLICATION, or OFFICIAL_SOURCE',
      },
    },
    required: ['stepName'],
  },
};

export const startApplicationGuidanceTool: FunctionDeclaration = {
  name: 'startApplicationGuidance',
  description:
    'Start the interactive step-by-step application submission guidance assistant for the currently viewed scheme.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      route: {
        type: Type.STRING,
        description: 'Preferred route: CSC (Common Service Centre / e-Sevai / village kiosk) or ONLINE (official government portal)',
      },
      currentStep: {
        type: Type.STRING,
        description: 'Current submission step: CHECKLIST, DETAILS, ROUTE, or OFFICIAL_PORTAL',
      },
    },
  },
};

export const GEMINI_LIVE_TOOLS = [
  {
    functionDeclarations: [
      showSchemeResultsTool,
      openSchemeTool,
      highlightSectionTool,
      showGuidanceStepTool,
      startApplicationGuidanceTool,
    ],
  },
];

