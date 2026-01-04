import {
  ActivityConfig,
  ParsedScreen,
  ParsedElement,
  Question,
  Element,
  Screen,
  Layout,
  DisplayProperty,
} from "../types/ActivityConfig";

export interface ParsedActivityData {
  screens: ParsedScreen[];
  questions: Question[];
}

/**
 * Parse Activity JSON configuration and extract questions for rendering
 * Based on the structure from the documentation
 */
export function parseActivityConfig(
  activityConfig: ActivityConfig,
  patientAnswers: { [key: string]: any } = {}
): ParsedActivityData {
  const screens: ParsedScreen[] = [];
  const allQuestions: Question[] = [];

  // Extract questions from activityGroups for reference
  const questionMap = new Map<string, Question>();
  if (activityConfig.activityGroups) {
    activityConfig.activityGroups.forEach(group => {
      if (group.questions) {
        group.questions.forEach(question => {
          questionMap.set(question.id, question);
        });
        allQuestions.push(...group.questions);
      }
    });
  }

  // Process layouts (preferred structure)
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
                const displayProperties: { [key: string]: string } = {};
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
            const screenDisplayProperties: { [key: string]: string } = {};
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
            const displayProperties: { [key: string]: string } = {};
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
        const screenDisplayProperties: { [key: string]: string } = {};
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
  displayProperties: { [key: string]: string },
  key: string,
  defaultValue: string = ""
): string {
  return displayProperties[key] || defaultValue;
}
