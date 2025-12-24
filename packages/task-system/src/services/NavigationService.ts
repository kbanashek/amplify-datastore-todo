import { Alert, Linking } from "react-native";
import { Appointment } from "@task-types/Appointment";
import { getServiceLogger } from "@utils/serviceLogger";

/**
 * Navigation service for handling external navigation.
 * The package handles ALL navigation logic independently.
 * Tries multiple strategies automatically without requiring LX configuration.
 */
class NavigationService {
  /**
   * Navigate to appointment details.
   * Package handles ALL navigation logic using multiple fallback strategies.
   * Completely self-contained - no external dependencies or configuration needed.
   *
   * @param appointment - The appointment to navigate to
   * @param timezoneId - Optional timezone ID
   * @param navigation - React Navigation object (from useNavigation hook)
   */
  navigateToAppointmentDetails(
    appointment: Appointment,
    timezoneId?: string,
    navigation?: any
  ): void {
    const params = {
      appointment: JSON.stringify(appointment),
      timezoneId: timezoneId || "",
    };

    // Strategy 1: Try React Navigation parent navigator (works with expo-router too)
    if (navigation) {
      try {
        // Get parent navigation (expo-router exposes routes through parent)
        const parentNav = navigation.getParent?.() || navigation;

        // Try common route names that expo-router might use
        const routeNames = [
          "appointment-details",
          "AppointmentDetails",
          "(tabs)/appointment-details",
          "/(tabs)/appointment-details",
        ];

        for (const routeName of routeNames) {
          try {
            parentNav.navigate(routeName as never, params as never);
            return;
          } catch (e) {
            // Try next route name
            continue;
          }
        }
      } catch (error) {
        getServiceLogger("NavigationService").warn(
          "React Navigation failed, trying next strategy",
          error
        );
      }
    }

    // Strategy 2: Try React Native Linking API
    try {
      const queryString = new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString();
      Linking.openURL(`appointment-details?${queryString}`).catch(() => {
        // Linking failed, show alert
        this.showFallbackAlert();
      });
      return;
    } catch (error) {
      getServiceLogger("NavigationService").warn("Linking API failed", error);
    }

    // Strategy 3: Last resort - show alert
    this.showFallbackAlert();
  }

  private showFallbackAlert(): void {
    Alert.alert(
      "Appointment Details",
      "Unable to navigate to appointment details. Please ensure the appointment details screen is configured in your app."
    );
  }
}

// Singleton instance
export const navigationService = new NavigationService();
