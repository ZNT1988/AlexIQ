// Simple test to verify ESM configuration with Jest
describe("ESM Configuration Test", () => {
  test("should support ES modules properly", () => {
    expect(true).toBe(true);
  });

  test("should have access to global test config", () => {
    expect(global.testConfig).toBeDefined();
    expect(global.testConfig.timeout).toBe(10000);
  });

  test("should have mock services available", () => {
    expect(global.mocks).toBeDefined();
    expect(global.mocks.clerk).toBeDefined();
    expect(global.mocks.database).toBeDefined();
    expect(global.mocks.ai).toBeDefined();
  });

  test("should have test utilities available", () => {
    expect(global.testUtils).toBeDefined();
    expect(typeof global.testUtils.createTestUser).toBe("function");
    expect(typeof global.testUtils.randomString).toBe("function");
  });

  test("should create test user with correct structure", () => {
    const testUser = global.testUtils.createTestUser();
    expect(testUser).toHaveProperty("id");
    expect(testUser).toHaveProperty("email");
    expect(testUser).toHaveProperty("firstName");
    expect(testUser).toHaveProperty("lastName");
  });

  test("should generate random strings", () => {
    const randomStr = global.testUtils.randomString(10);
    expect(typeof randomStr).toBe("string");
    expect(randomStr.length).toBe(10);
  });
});
