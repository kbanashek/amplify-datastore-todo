import {
  initializeI18n,
  getDefaultNamespace,
} from "@translations/config/i18nConfig";

describe("i18nConfig", () => {
  describe("getDefaultNamespace", () => {
    it("should return the default namespace", () => {
      expect(getDefaultNamespace()).toBe("task-system");
    });
  });

  describe("initializeI18n", () => {
    it("should create standalone i18next instance when no parent provided", () => {
      const i18n = initializeI18n({
        defaultLocale: "en",
        preferredLanguage: "en",
      });

      expect(i18n).toBeDefined();
      expect(i18n.language).toBe("en");
    });

    it("should use parent i18next instance when provided", () => {
      const mockParentI18n = {
        hasResourceBundle: jest.fn(() => false),
        addResourceBundle: jest.fn(),
        changeLanguage: jest.fn(),
        language: "en",
      } as any;

      const i18n = initializeI18n({
        parentI18n: mockParentI18n,
        preferredLanguage: "es",
      });

      expect(i18n).toBe(mockParentI18n);
      expect(mockParentI18n.addResourceBundle).toHaveBeenCalled();
      expect(mockParentI18n.changeLanguage).toHaveBeenCalledWith("es");
    });

    it("should not add resource bundle if already exists", () => {
      const mockParentI18n = {
        hasResourceBundle: jest.fn(() => true),
        addResourceBundle: jest.fn(),
        changeLanguage: jest.fn(),
        language: "en",
      } as any;

      const i18n = initializeI18n({
        parentI18n: mockParentI18n,
      });

      expect(i18n).toBe(mockParentI18n);
      expect(mockParentI18n.addResourceBundle).not.toHaveBeenCalled();
    });
  });
});
