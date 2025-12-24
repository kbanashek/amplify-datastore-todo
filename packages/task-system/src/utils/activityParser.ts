import {
  ActivityConfig,
  DisplayProperty,
  Element,
  Layout,
  ParsedElement,
  ParsedScreen,
  Question,
  Screen,
} from "@task-types/ActivityConfig";

export interface ParsedActivityData {
  screens: ParsedScreen[];
  questions: Question[];
}

/**
 * Get screens from MOBILE layout (matching LX getScreens behavior)
 */
function getScreensFromLayouts(
  activityConfig: ActivityConfig
): Screen[] | null {
  if (activityConfig.layouts && Array.isArray(activityConfig.layouts)) {
    for (const layout of activityConfig.layouts) {
      if (layout.type === "MOBILE" && layout.screens) {
        return layout.screens;
      }
    }
  }
  return null;
}

/**
 * Match questions from activityGroups to screen elements by ID (matching LX getQuestionsForEachScreen behavior)
 */
function matchQuestionsToScreens(
  questions: Question[],
  screens: Screen[],
  patientAnswers: Record<string, any>
): ParsedScreen[] {
  const parsedScreens: ParsedScreen[] = [];

  for (const screen of screens) {
    const parsedElements: ParsedElement[] = [];

    if (screen.elements) {
      // Sort elements by order
      const sortedElements = [...screen.elements].sort(
        (a, b) => (a.order || 0) - (b.order || 0)
      );

      for (const element of sortedElements) {
        // Find matching question by ID
        const question = questions.find(q => q.id === element.id);

        if (question) {
          // Parse display properties
          const displayProperties: Record<string, string> = {};
          if (element.displayProperties) {
            element.displayProperties.forEach((prop: DisplayProperty) => {
              try {
                const parsed = JSON.parse(prop.value);
                displayProperties[prop.key] =
                  typeof parsed === "string" ? parsed : prop.value;
              } catch {
                displayProperties[prop.key] = prop.value;
              }
            });
          }

          const patientAnswer = patientAnswers[question.id] || null;

          parsedElements.push({
            id: element.id,
            order: element.order || 0,
            question,
            displayProperties,
            patientAnswer,
          });
        }
      }
    }

    if (parsedElements.length > 0) {
      // Parse screen-level display properties
      const screenDisplayProperties: Record<string, string> = {};
      if (screen.displayProperties) {
        screen.displayProperties.forEach((prop: DisplayProperty) => {
          try {
            const parsed = JSON.parse(prop.value);
            screenDisplayProperties[prop.key] =
              typeof parsed === "string" ? parsed : prop.value;
          } catch {
            screenDisplayProperties[prop.key] = prop.value;
          }
        });
      }

      parsedScreens.push({
        id: screen.id || `screen-${parsedScreens.length}`,
        name:
          screen.name ||
          screen.text ||
          `Page ${screen.order || parsedScreens.length + 1}`,
        order: screen.order || parsedScreens.length,
        elements: parsedElements,
        displayProperties: screenDisplayProperties,
      });
    }
  }

  return parsedScreens;
}

/**
 * Parse Activity JSON configuration and extract questions for rendering
 * Based on the structure from the documentation
 */
export function parseActivityConfig(
  activityConfig: ActivityConfig,
  patientAnswers: Record<string, any> = {}
): ParsedActivityData {
  const screens: ParsedScreen[] = [];
  const allQuestions: Question[] = [];

  const normalizeActivityGroups = (
    raw: unknown
  ): ActivityConfig["activityGroups"] => {
    if (raw === null || raw === undefined) {
      return [];
    }

    if (typeof raw === "string") {
      try {
        const parsed: unknown = JSON.parse(raw);
        return normalizeActivityGroups(parsed);
      } catch {
        return [];
      }
    }

    if (Array.isArray(raw)) {
      return raw as ActivityConfig["activityGroups"];
    }

    // Some fixture/import paths may provide a single group object instead of an array.
    if (typeof raw === "object" && raw !== null) {
      return [raw as NonNullable<ActivityConfig["activityGroups"]>[number]];
    }

    return [];
  };

  // Extract questions from activityGroups for reference
  const questionMap = new Map<string, Question>();
  const activityGroups = normalizeActivityGroups(activityConfig.activityGroups);

  // Check if activityGroups has questions - if so, prioritize it over layouts
  const hasActivityGroupsWithQuestions =
    activityGroups &&
    activityGroups.length > 0 &&
    activityGroups.some(
      group => group?.questions && group.questions.length > 0
    );

  if (activityGroups) {
    activityGroups.forEach(group => {
      if (group?.questions) {
        group.questions.forEach(question => {
          questionMap.set(question.id, question);
        });
        allQuestions.push(...group.questions);
      }
    });
  }

  // Priority: If activityGroups has questions, use it directly (POC structure)
  if (hasActivityGroupsWithQuestions) {
    // Get screens from layouts (MOBILE) or activityConfig.screens (matching LX behavior)
    const layoutScreens = getScreensFromLayouts(activityConfig);
    const hasLayoutScreens = layoutScreens && layoutScreens.length > 0;
    const hasDirectScreens =
      activityConfig.screens && activityConfig.screens.length > 0;

    if (hasDirectScreens && activityConfig.screens) {
      // Use activityConfig.screens directly (matching LX line 175-176)
      // Match questions from activityGroups to screen elements by ID
      const matchedScreens = matchQuestionsToScreens(
        allQuestions,
        activityConfig.screens,
        patientAnswers
      );
      screens.push(...matchedScreens);
    } else if (hasLayoutScreens && layoutScreens) {
      // Use screens from layouts, match questions to elements by ID (matching LX line 178)
      const matchedScreens = matchQuestionsToScreens(
        allQuestions,
        layoutScreens,
        patientAnswers
      );
      screens.push(...matchedScreens);
    } else {
      // No layouts and no screens: Create a single screen with all questions (default behavior)
      // This matches LX behavior when screens array is empty
      const parsedElements: ParsedElement[] = [];
      let elementOrder = 0;

      if (activityGroups) {
        activityGroups.forEach(group => {
          if (group?.questions && group.questions.length > 0) {
            group.questions.forEach(question => {
              const patientAnswer = patientAnswers[question.id] || null;
              parsedElements.push({
                id: question.id,
                order: elementOrder++,
                question,
                displayProperties: {},
                patientAnswer,
              });
            });
          }
        });
      }

      if (parsedElements.length > 0) {
        screens.push({
          id: "default-screen",
          name: "Questions",
          order: 0,
          elements: parsedElements,
          displayProperties: {},
        });
      }
    }

    // Sort screens by order
    screens.sort((a, b) => a.order - b.order);

    return {
      screens,
      questions: allQuestions,
    };
  }

  // Fallback: Process layouts (existing behavior)
  if (activityConfig.layouts) {
    activityConfig.layouts.forEach((layout: Layout) => {
      // Only process MOBILE layouts
      if (layout.type === "MOBILE" && layout.screens) {
        layout.screens.forEach((screen: Screen) => {
          const parsedElements: ParsedElement[] = [];

          if (screen.elements) {
            // Sort elements by order
            const sortedElements = [...screen.elements].sort(
              (a, b) => (a.order || 0) - (b.order || 0)
            );

            sortedElements.forEach((element: Element) => {
              // Get question from element.question or match by id from questionMap
              let question: Question | undefined = element.question;

              if (!question && element.id) {
                question = questionMap.get(element.id);
              }

              if (question) {
                // Parse display properties
                const displayProperties: Record<string, string> = {};
                if (element.displayProperties) {
                  element.displayProperties.forEach((prop: DisplayProperty) => {
                    // Parse JSON-stringified values (e.g., "\"text\"" -> "text")
                    try {
                      const parsed = JSON.parse(prop.value);
                      displayProperties[prop.key] =
                        typeof parsed === "string" ? parsed : prop.value;
                    } catch {
                      // If not JSON, use as-is
                      displayProperties[prop.key] = prop.value;
                    }
                  });
                }

                // Get patient answer if exists
                const patientAnswer = patientAnswers[question.id] || null;

                parsedElements.push({
                  id: element.id,
                  order: element.order || 0,
                  question,
                  displayProperties,
                  patientAnswer,
                });
              }
            });
          }

          if (parsedElements.length > 0) {
            // Parse screen-level display properties
            const screenDisplayProperties: Record<string, string> = {};
            if (screen.displayProperties) {
              screen.displayProperties.forEach((prop: DisplayProperty) => {
                try {
                  const parsed = JSON.parse(prop.value);
                  screenDisplayProperties[prop.key] =
                    typeof parsed === "string" ? parsed : prop.value;
                } catch {
                  screenDisplayProperties[prop.key] = prop.value;
                }
              });
            }

            screens.push({
              id: screen.id || `screen-${screens.length}`,
              name:
                screen.name ||
                screen.text ||
                `Page ${screen.order || screens.length + 1}`,
              order: screen.order || screens.length,
              elements: parsedElements,
              displayProperties: screenDisplayProperties,
            });
          }
        });
      }
    });
  }

  // Fallback: Process screens directly if no layouts
  if (screens.length === 0 && activityConfig.screens) {
    activityConfig.screens.forEach((screen: Screen) => {
      const parsedElements: ParsedElement[] = [];

      if (screen.elements) {
        const sortedElements = [...screen.elements].sort(
          (a, b) => (a.order || 0) - (b.order || 0)
        );

        sortedElements.forEach((element: Element) => {
          let question: Question | undefined = element.question;

          if (!question && element.id) {
            question = questionMap.get(element.id);
          }

          if (question) {
            const displayProperties: Record<string, string> = {};
            if (element.displayProperties) {
              element.displayProperties.forEach((prop: DisplayProperty) => {
                try {
                  const parsed = JSON.parse(prop.value);
                  displayProperties[prop.key] =
                    typeof parsed === "string" ? parsed : prop.value;
                } catch {
                  displayProperties[prop.key] = prop.value;
                }
              });
            }

            const patientAnswer = patientAnswers[question.id] || null;

            parsedElements.push({
              id: element.id,
              order: element.order || 0,
              question,
              displayProperties,
              patientAnswer,
            });
          }
        });
      }

      if (parsedElements.length > 0) {
        // Parse screen-level display properties
        const screenDisplayProperties: Record<string, string> = {};
        if (screen.displayProperties) {
          screen.displayProperties.forEach((prop: DisplayProperty) => {
            try {
              const parsed = JSON.parse(prop.value);
              screenDisplayProperties[prop.key] =
                typeof parsed === "string" ? parsed : prop.value;
            } catch {
              screenDisplayProperties[prop.key] = prop.value;
            }
          });
        }

        screens.push({
          id: screen.id || `screen-${screens.length}`,
          name:
            screen.name ||
            screen.text ||
            `Page ${screen.order || screens.length + 1}`,
          order: screen.order || screens.length,
          elements: parsedElements,
          displayProperties: screenDisplayProperties,
        });
      }
    });
  }

  // Sort screens by order
  screens.sort((a, b) => a.order - b.order);

  return {
    screens,
    questions: allQuestions,
  };
}

/**
 * Get display property value
 */
export function getDisplayProperty(
  displayProperties: Record<string, string>,
  key: string,
  defaultValue: string = ""
): string {
  return displayProperties[key] || defaultValue;
}
