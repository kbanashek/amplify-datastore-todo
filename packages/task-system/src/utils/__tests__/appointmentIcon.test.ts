import {
  getAppointmentIconConfig,
  AppointmentIconConfig,
} from "@utils/appointmentIcon";
import { AppointmentType } from "@task-types/Appointment";

describe("getAppointmentIconConfig", () => {
  describe("telehealth appointments", () => {
    it("should return video icon for TELEVISIT type", () => {
      const result = getAppointmentIconConfig(AppointmentType.TELEVISIT);

      expect(result.iconName).toBe("video.fill");
      expect(result.translationKey).toBe("appointment.telehealth");
    });

    it("should return consistent results for multiple calls", () => {
      const result1 = getAppointmentIconConfig(AppointmentType.TELEVISIT);
      const result2 = getAppointmentIconConfig(AppointmentType.TELEVISIT);

      expect(result1).toEqual(result2);
    });
  });

  describe("onsite appointments", () => {
    it("should return building icon for ONSITE type", () => {
      const result = getAppointmentIconConfig(AppointmentType.ONSITE);

      expect(result.iconName).toBe("building.2.fill");
      expect(result.translationKey).toBe("appointment.onsiteVisit");
    });

    it("should return consistent results for multiple calls", () => {
      const result1 = getAppointmentIconConfig(AppointmentType.ONSITE);
      const result2 = getAppointmentIconConfig(AppointmentType.ONSITE);

      expect(result1).toEqual(result2);
    });
  });

  describe("return type structure", () => {
    it("should return object with iconName and translationKey properties", () => {
      const result = getAppointmentIconConfig(AppointmentType.TELEVISIT);

      expect(result).toHaveProperty("iconName");
      expect(result).toHaveProperty("translationKey");
      expect(typeof result.iconName).toBe("string");
      expect(typeof result.translationKey).toBe("string");
    });

    it("should satisfy AppointmentIconConfig type", () => {
      const result: AppointmentIconConfig = getAppointmentIconConfig(
        AppointmentType.ONSITE
      );

      expect(result).toBeDefined();
    });
  });

  describe("different appointment types", () => {
    it("should return different configs for different types", () => {
      const telehealthConfig = getAppointmentIconConfig(
        AppointmentType.TELEVISIT
      );
      const onsiteConfig = getAppointmentIconConfig(AppointmentType.ONSITE);

      expect(telehealthConfig.iconName).not.toBe(onsiteConfig.iconName);
      expect(telehealthConfig.translationKey).not.toBe(
        onsiteConfig.translationKey
      );
    });

    it("should handle all AppointmentType enum values", () => {
      const types = [AppointmentType.TELEVISIT, AppointmentType.ONSITE];

      types.forEach(type => {
        const result = getAppointmentIconConfig(type);
        expect(result.iconName).toBeDefined();
        expect(result.translationKey).toBeDefined();
      });
    });
  });

  describe("icon names", () => {
    it("should use SF Symbol naming convention", () => {
      const telehealthResult = getAppointmentIconConfig(
        AppointmentType.TELEVISIT
      );
      const onsiteResult = getAppointmentIconConfig(AppointmentType.ONSITE);

      // SF Symbols use dot notation and descriptive names
      expect(telehealthResult.iconName).toMatch(/\./);
      expect(onsiteResult.iconName).toMatch(/\./);
    });
  });

  describe("translation keys", () => {
    it("should use appointment namespace", () => {
      const telehealthResult = getAppointmentIconConfig(
        AppointmentType.TELEVISIT
      );
      const onsiteResult = getAppointmentIconConfig(AppointmentType.ONSITE);

      expect(telehealthResult.translationKey.startsWith("appointment.")).toBe(
        true
      );
      expect(onsiteResult.translationKey.startsWith("appointment.")).toBe(true);
    });

    it("should use camelCase for translation keys", () => {
      const onsiteResult = getAppointmentIconConfig(AppointmentType.ONSITE);

      // onsiteVisit is camelCase
      expect(onsiteResult.translationKey).toBe("appointment.onsiteVisit");
    });
  });
});
